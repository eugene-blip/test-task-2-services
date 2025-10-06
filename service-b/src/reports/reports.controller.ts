import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiProduces } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('timeseries')
  @ApiOperation({ summary: 'Get time series data from RedisTimeSeries' })
  @ApiQuery({ name: 'startDate', required: false, type: String, example: '2025-09-01T00:00:00Z', description: 'Start date for report (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, example: '2025-10-01T23:59:59Z', description: 'End date for report (ISO format)' })
  async getTimeSeriesData(
    @Query() query: GenerateReportDto,
  ) {
    const data = await this.reportsService.getTimeSeriesData(query.startDate, query.endDate);
    return {
      success: true,
      data,
    };
  }

  @Get('pdf')
  @ApiOperation({ summary: 'Generate PDF report with charts from time series data' })
  @ApiProduces('application/pdf')
  @ApiQuery({ name: 'startDate', required: false, type: String, example: '2025-09-01T00:00:00Z', description: 'Start date for report (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, example: '2025-10-01T23:59:59Z', description: 'End date for report (ISO format)' })
  async generatePDFReport(
    @Res() res: Response,
    @Query() query: GenerateReportDto,
  ) {
    const pdfBuffer = await this.reportsService.generatePDFReport(query.startDate, query.endDate);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=report-${Date.now()}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }
}
