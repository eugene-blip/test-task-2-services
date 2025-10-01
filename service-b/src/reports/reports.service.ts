import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { ChartService } from './chart.service';
import * as PDFDocument from 'pdfkit';
import { Readable } from 'stream';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly chartService: ChartService,
  ) {}

  async getTimeSeriesData(startDate?: string, endDate?: string) {
    const fromTimestamp = startDate ? new Date(startDate).getTime() : Date.now() - 7 * 24 * 60 * 60 * 1000;
    const toTimestamp = endDate ? new Date(endDate).getTime() : Date.now();

    const timeSeriesKeys = await this.redisService.getAllTimeSeries();
    const data: Record<string, any> = {};

    for (const key of timeSeriesKeys) {
      const values = await this.redisService.queryTimeSeries(key, fromTimestamp, toTimestamp);
      data[key] = values.map(([timestamp, value]) => ({
        timestamp,
        value: parseFloat(value),
        date: new Date(timestamp).toISOString(),
      }));
    }

    return data;
  }

  async generatePDFReport(startDate?: string, endDate?: string): Promise<Buffer> {
    this.logger.log('Generating PDF report...');

    const timeSeriesData = await this.getTimeSeriesData(startDate, endDate);

    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Title
        doc.fontSize(24).font('Helvetica-Bold').text('Event Analytics Report', { align: 'center' });
        doc.moveDown();

        // Date range
        const fromDate = startDate ? new Date(startDate).toLocaleDateString() : 'Last 7 days';
        const toDate = endDate ? new Date(endDate).toLocaleDateString() : 'Now';
        doc.fontSize(12).font('Helvetica').text(`Report Period: ${fromDate} - ${toDate}`, { align: 'center' });
        doc.moveDown(2);

        // Summary section
        doc.fontSize(16).font('Helvetica-Bold').text('Summary', { underline: true });
        doc.moveDown(0.5);

        const totalEvents = Object.values(timeSeriesData).reduce((sum: number, series: any) => {
          return sum + series.length;
        }, 0);

        doc.fontSize(12).font('Helvetica');
        doc.text(`Total Time Series Keys: ${Object.keys(timeSeriesData).length}`);
        doc.text(`Total Data Points: ${totalEvents}`);
        doc.moveDown(2);

        // Generate charts for each time series
        for (const [key, values] of Object.entries(timeSeriesData)) {
          if (values.length === 0) continue;

          const seriesValues = values as Array<{ timestamp: number; value: number; date: string }>;

          // Add section title
          doc.fontSize(14).font('Helvetica-Bold').text(this.formatKeyName(key), { underline: true });
          doc.moveDown(0.5);

          // Statistics
          const dataValues = seriesValues.map((v) => v.value);
          const sum = dataValues.reduce((a, b) => a + b, 0);
          const avg = sum / dataValues.length;
          const max = Math.max(...dataValues);
          const min = Math.min(...dataValues);

          doc.fontSize(10).font('Helvetica');
          doc.text(`Data Points: ${seriesValues.length}`);
          doc.text(`Sum: ${sum.toFixed(2)}`);
          doc.text(`Average: ${avg.toFixed(2)}`);
          doc.text(`Max: ${max.toFixed(2)}`);
          doc.text(`Min: ${min.toFixed(2)}`);
          doc.moveDown(1);

          // Generate and embed chart
          try {
            const labels = this.generateTimeLabels(seriesValues);
            const chartData = this.aggregateDataByLabel(seriesValues, labels);

            const chartBuffer = await this.chartService.generateLineChart(
              labels,
              [{ label: this.formatKeyName(key), data: chartData }],
              this.formatKeyName(key),
            );

            // Check if we need a new page
            if (doc.y > 500) {
              doc.addPage();
            }

            doc.image(chartBuffer, {
              fit: [500, 250],
              align: 'center',
            });

            doc.moveDown(2);
          } catch (error) {
            this.logger.error(`Error generating chart for ${key}:`, error);
            doc.text(`Chart generation failed for ${key}`);
            doc.moveDown(1);
          }

          // Add page break if needed
          if (doc.y > 650) {
            doc.addPage();
          }
        }

        // Footer - Add to current page only (we'll skip complex page numbering for now)
        doc.fontSize(8).font('Helvetica').text(
          `Generated: ${new Date().toLocaleString()}`,
          50,
          doc.page.height - 30,
          { align: 'center' },
        );

        doc.end();
      } catch (error) {
        this.logger.error('Error generating PDF:', error);
        reject(error);
      }
    });
  }

  private formatKeyName(key: string): string {
    return key
      .replace('ts:events:', '')
      .replace(/:/g, ' - ')
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private generateTimeLabels(data: Array<{ timestamp: number; value: number }>): string[] {
    if (data.length === 0) return [];

    // Group by hour if data spans multiple days, otherwise by minute
    const timeSpan = data[data.length - 1].timestamp - data[0].timestamp;
    const groupByHour = timeSpan > 24 * 60 * 60 * 1000;

    const labels = new Set<string>();
    data.forEach((point) => {
      const date = new Date(point.timestamp);
      if (groupByHour) {
        labels.add(date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' }));
      } else {
        labels.add(date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' }));
      }
    });

    return Array.from(labels).slice(0, 20); // Limit to 20 labels for readability
  }

  private aggregateDataByLabel(
    data: Array<{ timestamp: number; value: number }>,
    labels: string[],
  ): number[] {
    const labelMap = new Map<string, number>();

    data.forEach((point) => {
      const date = new Date(point.timestamp);
      const timeSpan = data[data.length - 1].timestamp - data[0].timestamp;
      const groupByHour = timeSpan > 24 * 60 * 60 * 1000;

      let label: string;
      if (groupByHour) {
        label = date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
      } else {
        label = date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' });
      }

      labelMap.set(label, (labelMap.get(label) || 0) + point.value);
    });

    return labels.map((label) => labelMap.get(label) || 0);
  }
}
