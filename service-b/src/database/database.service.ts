import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { MongoClient, Db, Collection, Document } from 'mongodb';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient;
  private db: Db;
  private readonly logger = new Logger(DatabaseService.name);

  async onModuleInit() {
    const uri = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/serviceB?authSource=admin';
    
    this.client = new MongoClient(uri);
    await this.client.connect();
    this.db = this.client.db();
    
    this.logger.log('Connected to MongoDB');
    
    // Create indexes
    await this.createIndexes();
  }

  async onModuleDestroy() {
    await this.client.close();
    this.logger.log('Disconnected from MongoDB');
  }

  getDb(): Db {
    return this.db;
  }

  getCollection<T extends Document = Document>(name: string): Collection<T> {
    return this.db.collection<T>(name);
  }

  private async createIndexes() {
    try {
      const logsCollection = this.getCollection('event_logs');
      
      // Create indexes for efficient querying
      await logsCollection.createIndex(
        { timestamp: -1 },
        { name: 'timestamp_index' }
      );
      
      await logsCollection.createIndex(
        { eventType: 1, timestamp: -1 },
        { name: 'eventType_timestamp_index' }
      );
      
      await logsCollection.createIndex(
        { serviceId: 1, timestamp: -1 },
        { name: 'serviceId_timestamp_index' }
      );
      
      this.logger.log('Database indexes created successfully');
    } catch (error) {
      this.logger.error('Error creating indexes:', error);
    }
  }
}
