import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class EventSubscriberService implements OnModuleInit {
  private readonly logger = new Logger(EventSubscriberService.name);
  private readonly EVENTS_CHANNEL = 'service-events';

  constructor(
    private readonly redisService: RedisService,
    private readonly databaseService: DatabaseService,
  ) {}

  async onModuleInit() {
    await this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    try {
      await this.redisService.subscribe(this.EVENTS_CHANNEL, async (message) => {
        await this.handleEvent(message);
      });

      this.logger.log(`Subscribed to ${this.EVENTS_CHANNEL}`);
    } catch (error) {
      this.logger.error('Error subscribing to events:', error);
    }
  }

  private async handleEvent(message: string) {
    try {
      const event = JSON.parse(message);
      
      this.logger.log(`Received event: ${event.eventType} from ${event.serviceId}`);

      // Store event in MongoDB
      const logsCollection = this.databaseService.getCollection('event_logs');
      await logsCollection.insertOne({
        ...event,
        receivedAt: new Date(),
      });

      this.logger.debug(`Event stored: ${event.eventType}`);
    } catch (error) {
      this.logger.error('Error handling event:', error);
    }
  }
}
