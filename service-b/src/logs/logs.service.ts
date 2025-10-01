import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { QueryLogsDto } from './dto/query-logs.dto';
import { Collection } from 'mongodb';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);
  private readonly collectionName = 'event_logs';

  constructor(private readonly databaseService: DatabaseService) {}

  private getCollection(): Collection {
    return this.databaseService.getCollection(this.collectionName);
  }

  async queryLogs(queryDto: QueryLogsDto) {
    const { eventType, serviceId, startDate, endDate, page = 1, limit = 50 } = queryDto;

    const filter: any = {};

    if (eventType) {
      filter.eventType = eventType;
    }

    if (serviceId) {
      filter.serviceId = serviceId;
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate).getTime();
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate).getTime();
      }
    }

    const skip = (page - 1) * limit;
    const collection = this.getCollection();

    const [logs, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStats(startDate?: string, endDate?: string) {
    const filter: any = {};

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate).getTime();
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate).getTime();
      }
    }

    const collection = this.getCollection();

    const [total, eventTypeCounts, serviceIdCounts] = await Promise.all([
      collection.countDocuments(filter),
      collection
        .aggregate([
          { $match: filter },
          { $group: { _id: '$eventType', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),
      collection
        .aggregate([
          { $match: filter },
          { $group: { _id: '$serviceId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),
    ]);

    return {
      total,
      byEventType: eventTypeCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byServiceId: serviceIdCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };
  }

  async getRecentLogs(limit: number = 10) {
    const collection = this.getCollection();
    return collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }
}
