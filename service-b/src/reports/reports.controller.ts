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
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getTimeSeriesData(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.reportsService.getTimeSeriesData(startDate, endDate);
    return {
      success: true,
      data,
    };
  }

  @Get('pdf')
  @ApiOperation({ summary: 'Generate PDF report with charts from time series data' })
  @ApiProduces('application/pdf')
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async generatePDFReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.reportsService.generatePDFReport(startDate, endDate);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=report-${Date.now()}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }
}
