import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private readonly logger = new Logger(RedisService.name);

  async onModuleInit() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379');

    this.client = createClient({
      socket: {
        host,
        port,
      },
    });

    this.client.on('error', (err) => this.logger.error('Redis Client Error', err));
    this.client.on('connect', () => this.logger.log('Redis Client Connected'));

    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Disconnected from Redis');
  }

  getClient(): RedisClientType {
    return this.client;
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    const subscriber = this.client.duplicate();
    await subscriber.connect();
    await subscriber.subscribe(channel, callback);
    this.logger.log(`Subscribed to channel: ${channel}`);
  }

  async queryTimeSeries(
    key: string,
    fromTimestamp: number,
    toTimestamp: number,
  ): Promise<Array<[number, string]>> {
    try {
      const result = await this.client.sendCommand([
        'TS.RANGE',
        key,
        fromTimestamp.toString(),
        toTimestamp.toString(),
      ]);
      return result as Array<[number, string]>;
    } catch (error) {
      this.logger.error(`Error querying time series ${key}:`, error);
      return [];
    }
  }

  async getAllTimeSeries(): Promise<string[]> {
    try {
      const keys = await this.client.keys('ts:*');
      return keys;
    } catch (error) {
      this.logger.error('Error getting all time series:', error);
      return [];
    }
  }

  async getTimeSeriesInfo(key: string): Promise<any> {
    try {
      return await this.client.sendCommand(['TS.INFO', key]);
    } catch (error) {
      this.logger.error(`Error getting time series info for ${key}:`, error);
      return null;
    }
  }
}
