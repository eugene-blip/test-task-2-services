import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { QueryLogsDto } from './dto/query-logs.dto';
import { StatsQueryDto } from './dto/stats-query.dto';

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
  @ApiQuery({ name: 'startDate', required: false, type: String, example: '2025-09-01T00:00:00Z', description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, example: '2025-10-01T23:59:59Z', description: 'End date (ISO format)' })
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
