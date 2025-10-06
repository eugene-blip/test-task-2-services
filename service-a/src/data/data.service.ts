import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EventPublisherService } from '../redis/event-publisher.service';
import { FileService } from './file.service';
import { DataRecord, FetchResult, UploadResult } from './interfaces/data.interface';
import { Collection } from 'mongodb';
import { EventType } from '../shared/types/events';

@Injectable()
export class DataService {
  private readonly logger = new Logger(DataService.name);
  private readonly collectionName = 'data';

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventPublisher: EventPublisherService,
    private readonly fileService: FileService,
  ) {}

  private getCollection(): Collection<DataRecord> {
    return this.databaseService.getCollection<DataRecord>(this.collectionName);
  }

  async fetchCryptoData(
    coinId: string,
    vsCurrency: string,
    days: number,
    format: 'json' | 'excel' = 'json',
  ): Promise<FetchResult> {
    const startTime = Date.now();
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}`;

    try {
      const { filePath, data } = await this.fileService.fetchAndSaveData(
        url,
        format,
        { enrich: { coinId, vsCurrency, days } }
      );
      const duration = Date.now() - startTime;

      // Insert enriched data into MongoDB
      const insertResult = await this.insertDataRobustly(data);

      // Publish events
      await this.eventPublisher.publishEvent({
        eventType: EventType.DATA_FETCHED,
        timestamp: Date.now(),
        serviceId: 'service-a',
        recordCount: data.length,
        source: url,
        duration,
        metadata: { 
          format, 
          filePath, 
          coinId, 
          vsCurrency, 
          days 
        },
      });

      await this.eventPublisher.publishEvent({
        eventType: EventType.DATA_INSERTED,
        timestamp: Date.now(),
        serviceId: 'service-a',
        collectionName: this.collectionName,
        recordCount: insertResult.insertedCount,
        duration,
      });

      return {
        recordCount: data.length,
        filePath,
        format,
        duration,
        insertedCount: insertResult.insertedCount,
      };
    } catch (error) {
      await this.eventPublisher.publishEvent({
        eventType: EventType.ERROR_OCCURRED,
        timestamp: Date.now(),
        serviceId: 'service-a',
        error: error.message,
        context: 'fetchCryptoData',
      });
      throw error;
    }
  }

  async fetchDataFromApi(url: string, format: 'json' | 'excel' = 'json'): Promise<FetchResult> {
    const startTime = Date.now();

    try {
      const { filePath, data } = await this.fileService.fetchAndSaveData(url, format);
      const duration = Date.now() - startTime;

      // Publish event
      await this.eventPublisher.publishEvent({
        eventType: EventType.DATA_FETCHED,
        timestamp: Date.now(),
        serviceId: 'service-a',
        recordCount: data.length,
        source: url,
        duration,
        metadata: { format, filePath },
      });

      return {
        recordCount: data.length,
        filePath,
        format,
        duration,
        insertedCount: 0,
      };
    } catch (error) {
      await this.eventPublisher.publishEvent({
        eventType: EventType.ERROR_OCCURRED,
        timestamp: Date.now(),
        serviceId: 'service-a',
        error: error.message,
        context: 'fetchDataFromApi',
      });
      throw error;
    }
  }

  async uploadAndInsertData(buffer: Buffer, mimetype: string, filename: string): Promise<UploadResult> {
    const startTime = Date.now();

    try {
      // Publish file uploaded event
      await this.eventPublisher.publishEvent({
        eventType: EventType.FILE_UPLOADED,
        timestamp: Date.now(),
        serviceId: 'service-a',
        fileName: filename,
        fileSize: buffer.length,
        fileType: mimetype,
      });

      // Parse file
      const data = await this.fileService.parseUploadedFile(buffer, mimetype);

      // Insert into MongoDB with robust error handling
      const result = await this.insertDataRobustly(data);
      const duration = Date.now() - startTime;

      // Publish data inserted event
      await this.eventPublisher.publishEvent({
        eventType: EventType.DATA_INSERTED,
        timestamp: Date.now(),
        serviceId: 'service-a',
        collectionName: this.collectionName,
        recordCount: result.insertedCount,
        duration,
      });

      return {
        recordCount: data.length,
        insertedCount: result.insertedCount,
        duration,
        errors: result.errors,
      };
    } catch (error) {
      await this.eventPublisher.publishEvent({
        eventType: EventType.ERROR_OCCURRED,
        timestamp: Date.now(),
        serviceId: 'service-a',
        error: error.message,
        context: 'uploadAndInsertData',
      });
      throw error;
    }
  }

  private async insertDataRobustly(data: any[]): Promise<{ insertedCount: number; errors: string[] }> {
    const collection = this.getCollection();
    const errors: string[] = [];
    let insertedCount = 0;

    // Add timestamps to all records
    const enrichedData = data.map(item => ({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Try bulk insert first
    try {
      const result = await collection.insertMany(enrichedData, { ordered: false });
      insertedCount = result.insertedCount;
      this.logger.log(`Bulk inserted ${insertedCount} records`);
      return { insertedCount, errors };
    } catch (error) {
      this.logger.warn('Bulk insert failed, falling back to individual inserts');

      // Fall back to individual inserts
      for (let i = 0; i < enrichedData.length; i++) {
        try {
          await collection.insertOne(enrichedData[i]);
          insertedCount++;
        } catch (err) {
          const errorMsg = `Record ${i}: ${err.message}`;
          errors.push(errorMsg);
          this.logger.error(errorMsg);
        }
      }
    }

    return { insertedCount, errors };
  }

  async getAllData(limit: number = 100, skip: number = 0): Promise<DataRecord[]> {
    const collection = this.getCollection();
    return collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async getDataCount(): Promise<number> {
    const collection = this.getCollection();
    return collection.countDocuments();
  }
}
