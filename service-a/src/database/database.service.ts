import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { MongoClient, Db, Collection, Document } from 'mongodb';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient;
  private db: Db;
  private readonly logger = new Logger(DatabaseService.name);

  async onModuleInit() {
    const uri = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/serviceA?authSource=admin';
    
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
      const dataCollection = this.getCollection('data');
      
      // Create text index for search
      await dataCollection.createIndex(
        { name: 'text', description: 'text', email: 'text' },
        { name: 'text_search_index' }
      );
      
      // Create compound index for efficient pagination
      await dataCollection.createIndex(
        { createdAt: -1, _id: 1 },
        { name: 'pagination_index' }
      );
      
      // Create index on email for unique constraint
      await dataCollection.createIndex(
        { email: 1 },
        { name: 'email_index', unique: false }
      );

      // Indexes to speed up coin/time-series searches
      await dataCollection.createIndex(
        { coinId: 1 },
        { name: 'coinId_index' }
      );
      await dataCollection.createIndex(
        { vsCurrency: 1 },
        { name: 'vsCurrency_index' }
      );
      
      this.logger.log('Database indexes created successfully');
    } catch (error) {
      this.logger.error('Error creating indexes:', error);
    }
  }
}
