export enum EventType {
  DATA_FETCHED = 'DATA_FETCHED',
  FILE_UPLOADED = 'FILE_UPLOADED',
  DATA_INSERTED = 'DATA_INSERTED',
  SEARCH_PERFORMED = 'SEARCH_PERFORMED',
  ERROR_OCCURRED = 'ERROR_OCCURRED',
}

export interface BaseEvent {
  eventType: EventType;
  timestamp: number;
  serviceId: string;
  metadata?: Record<string, any>;
}

export interface DataFetchedEvent extends BaseEvent {
  eventType: EventType.DATA_FETCHED;
  recordCount: number;
  source: string;
  duration: number;
}

export interface FileUploadedEvent extends BaseEvent {
  eventType: EventType.FILE_UPLOADED;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export interface DataInsertedEvent extends BaseEvent {
  eventType: EventType.DATA_INSERTED;
  collectionName: string;
  recordCount: number;
  duration: number;
}

export interface SearchPerformedEvent extends BaseEvent {
  eventType: EventType.SEARCH_PERFORMED;
  query: string;
  resultCount: number;
  page: number;
  limit: number;
  duration: number;
}

export interface ErrorEvent extends BaseEvent {
  eventType: EventType.ERROR_OCCURRED;
  error: string;
  stack?: string;
  context: string;
}

export type ServiceEvent =
  | DataFetchedEvent
  | FileUploadedEvent
  | DataInsertedEvent
  | SearchPerformedEvent
  | ErrorEvent;
