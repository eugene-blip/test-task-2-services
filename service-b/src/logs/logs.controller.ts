import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { QueryLogsDto } from './dto/query-logs.dto';
import { StatsQueryDto } from './dto/stats-query.dto';
import { getLast30DaysIsoRange } from '../common/swagger.utils';

const { startIso: LOGS_START_DEFAULT, endIso: LOGS_END_DEFAULT } = getLast30DaysIsoRange();

@ApiTags('logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @ApiOperation({ summary: 'Query event logs with filters' })
  async queryLogs(@Query() queryDto: QueryLogsDto) {
    const result = await this.logsService.queryLogs(queryDto);
    return {
      success: true,
      ...result,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get log statistics' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)', schema: { type: 'string', default: LOGS_START_DEFAULT, example: LOGS_START_DEFAULT } })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)', schema: { type: 'string', default: LOGS_END_DEFAULT, example: LOGS_END_DEFAULT } })
  async getStats(
    @Query() query: StatsQueryDto,
  ) {
    const stats = await this.logsService.getStats(query.startDate, query.endDate);
    return {
      success: true,
      data: stats,
    };
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent logs' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentLogs(@Query('limit') limit?: number) {
    const logs = await this.logsService.getRecentLogs(limit ? parseInt(limit.toString()) : 10);
    return {
      success: true,
      data: logs,
    };
  }
}
