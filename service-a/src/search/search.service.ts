import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EventPublisherService } from '../redis/event-publisher.service';
import { SearchDto, SearchResult } from './dto/search.dto';
import { Collection } from 'mongodb';
import { EventType } from '../shared/types/events';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly collectionName = 'data';

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  private getCollection(): Collection {
    return this.databaseService.getCollection(this.collectionName);
  }

  async search(searchDto: SearchDto): Promise<SearchResult<any>> {
    const startTime = Date.now();
    const { query, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = searchDto;

    try {
      const collection = this.getCollection();
      const skip = (page - 1) * limit;

      // Build search filter
      let filter: any = {};
      if (query && query.trim()) {
        // Use MongoDB text search if available
        filter = { $text: { $search: query } };
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute search with pagination
      const [data, total] = await Promise.all([
        collection
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .toArray(),
        collection.countDocuments(filter),
      ]);

      const duration = Date.now() - startTime;
      const totalPages = Math.ceil(total / limit);

      // Publish search event
      await this.eventPublisher.publishEvent({
        eventType: EventType.SEARCH_PERFORMED,
        timestamp: Date.now(),
        serviceId: 'service-a',
        query: query || '',
        resultCount: data.length,
        page,
        limit,
        duration,
      });

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        query,
        duration,
      };
    } catch (error) {
      this.logger.error('Search error:', error);

      await this.eventPublisher.publishEvent({
        eventType: EventType.ERROR_OCCURRED,
        timestamp: Date.now(),
        serviceId: 'service-a',
        error: error.message,
        context: 'search',
      });

      throw error;
    }
  }

  async advancedSearch(filters: Record<string, any>, searchDto: SearchDto): Promise<SearchResult<any>> {
    const startTime = Date.now();
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = searchDto;

    try {
      const collection = this.getCollection();
      const skip = (page - 1) * limit;

      // Build MongoDB query from filters
      const query = this.buildMongoQuery(filters);

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute search
      const [data, total] = await Promise.all([
        collection
          .find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .toArray(),
        collection.countDocuments(query),
      ]);

      const duration = Date.now() - startTime;
      const totalPages = Math.ceil(total / limit);

      // Publish search event
      await this.eventPublisher.publishEvent({
        eventType: EventType.SEARCH_PERFORMED,
        timestamp: Date.now(),
        serviceId: 'service-a',
        query: JSON.stringify(filters),
        resultCount: data.length,
        page,
        limit,
        duration,
      });

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        duration,
      };
    } catch (error) {
      this.logger.error('Advanced search error:', error);
      throw error;
    }
  }

  private buildMongoQuery(filters: Record<string, any>): any {
    const query: any = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined) continue;

      if (typeof value === 'string') {
        // Use regex for string fields
        query[key] = { $regex: value, $options: 'i' };
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // Handle range queries, etc.
        query[key] = value;
      } else {
        // Exact match
        query[key] = value;
      }
    }

    return query;
  }
}
