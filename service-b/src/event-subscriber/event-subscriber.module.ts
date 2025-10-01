import { Module } from '@nestjs/common';
import { EventSubscriberService } from './event-subscriber.service';

@Module({
  providers: [EventSubscriberService],
})
export class EventSubscriberModule {}
