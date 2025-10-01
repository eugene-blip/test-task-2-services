import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { LogsModule } from './logs/logs.module';
import { ReportsModule } from './reports/reports.module';
import { EventSubscriberModule } from './event-subscriber/event-subscriber.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    RedisModule,
    EventSubscriberModule,
    LogsModule,
    ReportsModule,
  ],
})
export class AppModule {}
