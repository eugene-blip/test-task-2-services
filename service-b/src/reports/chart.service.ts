import { Injectable, Logger } from '@nestjs/common';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import * as fs from 'fs';

@Injectable()
export class ChartService {
  private readonly logger = new Logger(ChartService.name);
  private readonly chartJSNodeCanvas: ChartJSNodeCanvas;

  constructor() {
    // Configure ChartJS with better font settings
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({
      width: 800,
      height: 400,
      backgroundColour: 'white',
      chartCallback: (ChartJS) => {
        ChartJS.defaults.font = {
          family: 'Liberation Sans, DejaVu Sans, Arial, sans-serif',
          size: 12,
          style: 'normal',
          weight: 'normal',
          lineHeight: 1.2
        };
      },
    });
  }

  async generateLineChart(
    labels: string[],
    datasets: Array<{ label: string; data: number[]; borderColor?: string; backgroundColor?: string }>,
    title: string,
  ): Promise<Buffer> {
    const configuration = {
      type: 'line' as const,
      data: {
        labels,
        datasets: datasets.map((dataset, index) => ({
          label: dataset.label,
          data: dataset.data,
          borderColor: dataset.borderColor || this.getColor(index),
          backgroundColor: dataset.backgroundColor || this.getColor(index, 0.2),
          borderWidth: 2,
          fill: false,
        })),
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title,
            font: {
              family: 'Liberation Sans, DejaVu Sans, Arial, sans-serif',
              size: 16,
              weight: 'bold',
            },
          },
          legend: {
            display: true,
            position: 'top' as const,
            labels: {
              font: {
                family: 'Liberation Sans, DejaVu Sans, Arial, sans-serif',
                size: 12,
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count',
              font: {
                family: 'Liberation Sans, DejaVu Sans, Arial, sans-serif',
                size: 12,
              },
            },
            ticks: {
              font: {
                family: 'Liberation Sans, DejaVu Sans, Arial, sans-serif',
                size: 10,
              },
            },
          },
          x: {
            title: {
              display: true,
              text: 'Time',
              font: {
                family: 'Liberation Sans, DejaVu Sans, Arial, sans-serif',
                size: 12,
              },
            },
            ticks: {
              font: {
                family: 'Liberation Sans, DejaVu Sans, Arial, sans-serif',
                size: 10,
              },
            },
          },
        },
      },
    };

    return this.chartJSNodeCanvas.renderToBuffer(configuration as any);
  }

  async generateBarChart(
    labels: string[],
    data: number[],
    title: string,
    label: string = 'Count',
  ): Promise<Buffer> {
    const configuration = {
      type: 'bar' as const,
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title,
            font: {
              family: 'Liberation Sans, DejaVu Sans, Arial, sans-serif',
              size: 16,
              weight: 'bold',
            },
          },
          legend: {
            display: true,
            position: 'top' as const,
            labels: {
              font: {
                family: 'Liberation Sans, DejaVu Sans, Arial, sans-serif',
                size: 12,
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count',
              font: {
                family: 'Liberation Sans, DejaVu Sans, Arial, sans-serif',
                size: 12,
              },
            },
            ticks: {
              font: {
                family: 'Liberation Sans, DejaVu Sans, Arial, sans-serif',
                size: 10,
              },
            },
          },
          x: {
            ticks: {
              font: {
                family: 'Liberation Sans, DejaVu Sans, Arial, sans-serif',
                size: 10,
              },
            },
          },
        },
      },
    };

    return this.chartJSNodeCanvas.renderToBuffer(configuration as any);
  }

  private getColor(index: number, alpha: number = 1): string {
    const colors = [
      `rgba(54, 162, 235, ${alpha})`,   // Blue
      `rgba(255, 99, 132, ${alpha})`,   // Red
      `rgba(75, 192, 192, ${alpha})`,   // Green
      `rgba(255, 206, 86, ${alpha})`,   // Yellow
      `rgba(153, 102, 255, ${alpha})`,  // Purple
      `rgba(255, 159, 64, ${alpha})`,   // Orange
    ];
    return colors[index % colors.length];
  }
}
