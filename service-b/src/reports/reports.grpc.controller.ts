import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ReportsService } from './reports.service';
import { RedisService } from '../redis/redis.service';

interface ReportRequest {
  start_timestamp?: number;
  end_timestamp?: number;
  metrics?: string[];
}

interface ReportResponse {
  pdf_data: Buffer;
  page_count: number;
  generated_at: string;
}

interface TimeSeriesRequest {
  key: string;
  start_timestamp?: number;
  end_timestamp?: number;
}

interface TimeSeriesResponse {
  data_points: { timestamp: number; value: number }[];
  key: string;
}

@Controller()
export class ReportsGrpcController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly redisService: RedisService,
  ) {}

  @GrpcMethod('ReportService', 'GenerateReport')
  async generateReport(data: ReportRequest): Promise<ReportResponse> {
    const startDate = data.start_timestamp
      ? new Date(data.start_timestamp).toISOString()
      : undefined;
    const endDate = data.end_timestamp
      ? new Date(data.end_timestamp).toISOString()
      : undefined;

    const pdfBuffer = await this.reportsService.generatePDFReport(startDate, endDate);

    return {
      pdf_data: pdfBuffer,
      page_count: 1,
      generated_at: new Date().toISOString(),
    };
  }

  @GrpcMethod('ReportService', 'GetTimeSeriesData')
  async getTimeSeriesData(data: TimeSeriesRequest): Promise<TimeSeriesResponse> {
    const fromTs = data.start_timestamp ?? Date.now() - 7 * 24 * 60 * 60 * 1000;
    const toTs = data.end_timestamp ?? Date.now();

    const points = await this.redisService.queryTimeSeries(data.key, fromTs, toTs);
    const data_points = (points || []).map(([ts, valueStr]) => ({
      timestamp: Number(ts),
      value: parseFloat(String(valueStr)),
    }));

    return { key: data.key, data_points };
  }
}
