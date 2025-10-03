import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import { EventType, ServiceEvent } from '../shared/types/events';

// Extend the shared ServiceEvent interface to allow additional properties
export interface ExtendedServiceEvent extends Omit<ServiceEvent, 'eventType'> {
  eventType: EventType | string; // Allow both enum and string for flexibility
  [key: string]: any;
}

@Injectable()
export class EventPublisherService {
  private readonly logger = new Logger(EventPublisherService.name);
  private readonly EVENTS_CHANNEL = 'service-events';
  private readonly serviceId: string;

  constructor(private readonly redisService: RedisService) {
    this.serviceId = process.env.SERVICE_NAME || 'service-a';
  }

  async publishEvent(event: ExtendedServiceEvent): Promise<void> {
    try {
      const enrichedEvent = {
        ...event,
        serviceId: this.serviceId,
        timestamp: event.timestamp || Date.now(),
      };

      // Publish to Redis Pub/Sub channel
      await this.redisService.publish(
        this.EVENTS_CHANNEL,
        JSON.stringify(enrichedEvent),
      );

      // Store in RedisTimeSeries for analytics
      await this.storeInTimeSeries(enrichedEvent);

      this.logger.log(`Event published: ${enrichedEvent.eventType}`);
    } catch (error) {
      this.logger.error('Error publishing event:', error);
      throw error;
    }
  }

  private async storeInTimeSeries(event: ExtendedServiceEvent): Promise<void> {
    const timestamp = event.timestamp;
    const eventType = event.eventType;

    // Store event count
    await this.redisService.addToTimeSeries(
      `ts:events:${eventType}:count`,
      timestamp,
      1,
      { eventType, service: this.serviceId },
    );

    // Store specific metrics based on event type
    if (event.recordCount !== undefined) {
      await this.redisService.addToTimeSeries(
        `ts:events:${eventType}:records`,
        timestamp,
        event.recordCount,
        { eventType, service: this.serviceId },
      );
    }

    if (event.duration !== undefined) {
      await this.redisService.addToTimeSeries(
        `ts:events:${eventType}:duration`,
        timestamp,
        event.duration,
        { eventType, service: this.serviceId },
      );
    }

    if (event.fileSize !== undefined) {
      await this.redisService.addToTimeSeries(
        `ts:events:${eventType}:filesize`,
        timestamp,
        event.fileSize,
        { eventType, service: this.serviceId },
      );
    }
  }
}
