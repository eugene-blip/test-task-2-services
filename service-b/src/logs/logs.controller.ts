import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { QueryLogsDto } from './dto/query-logs.dto';

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
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const stats = await this.logsService.getStats(startDate, endDate);
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
