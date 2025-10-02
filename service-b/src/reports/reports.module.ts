import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ChartService } from './chart.service';
import { ReportsGrpcController } from './reports.grpc.controller';

@Module({
  controllers: [ReportsController, ReportsGrpcController],
  providers: [ReportsService, ChartService],
})
export class ReportsModule {}
