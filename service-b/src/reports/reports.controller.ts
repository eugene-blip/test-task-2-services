import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiProduces } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { getLast30DaysIsoRange } from '../common/swagger.utils';

const { startIso: REPORTS_START_DEFAULT, endIso: REPORTS_END_DEFAULT } = getLast30DaysIsoRange();

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('timeseries')
  @ApiOperation({ summary: 'Get time series data from RedisTimeSeries' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for report (ISO format)', schema: { type: 'string', default: REPORTS_START_DEFAULT, example: REPORTS_START_DEFAULT } })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for report (ISO format)', schema: { type: 'string', default: REPORTS_END_DEFAULT, example: REPORTS_END_DEFAULT } })
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
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for report (ISO format)', schema: { type: 'string', default: REPORTS_START_DEFAULT, example: REPORTS_START_DEFAULT } })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for report (ISO format)', schema: { type: 'string', default: REPORTS_END_DEFAULT, example: REPORTS_END_DEFAULT } })
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
