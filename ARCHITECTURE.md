# Architecture Documentation

## System Overview

This microservices architecture demonstrates event-driven design with two main NestJS services and an optional Go gRPC service for high-performance reporting.

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client/API Users                         │
└────────────┬────────────────────────────────────┬────────────────┘
             │                                    │
             │ HTTP/REST                          │ HTTP/REST
             ▼                                    ▼
    ┌────────────────┐                   ┌────────────────┐
    │   Service A    │                   │   Service B    │
    │   (Port 3000)  │                   │   (Port 3001)  │
    │                │                   │                │
    │ - Data Fetch   │                   │ - Event Sub    │
    │ - File Parse   │                   │ - Log Query    │
    │ - Search API   │                   │ - PDF Reports  │
    └────┬───────┬───┘                   └───┬────────┬───┘
         │       │                           │        │
         │       │ Pub/Sub Events            │        │
         │       └───────────┬───────────────┘        │
         │                   │                        │
         │                   ▼                        │
         │          ┌─────────────────┐               │
         │          │  Redis Stack    │               │
         │          │  (Port 6379)    │               │
         │          │                 │               │
         │          │ - Pub/Sub       │◄──────────────┘
         │          │ - TimeSeries    │
         │          └─────────────────┘
         │
         │ MongoDB Queries
         ▼
┌─────────────────┐
│    MongoDB      │
│  (Port 27017)   │
│                 │
│ - serviceA DB   │
│ - serviceB DB   │
└─────────────────┘

         Optional: gRPC
              │
              ▼
    ┌────────────────┐
    │ Report Service │
    │  (Port 50051)  │
    │                │
    │ - Go/gRPC      │
    │ - PDF Gen      │
    └────────────────┘
```

## Data Flow

### 1. Data Fetching Flow (Service A)

```
User Request → POST /data/fetch
    ↓
Service A fetches from public API
    ↓
Data saved to JSON/Excel file
    ↓
Event published to Redis (DATA_FETCHED)
    ↓
Event stored in RedisTimeSeries
    ↓
Service B receives event via Pub/Sub
    ↓
Event logged to MongoDB
```

### 2. File Upload Flow (Service A)

```
User uploads file → POST /data/upload
    ↓
Service A parses file (JSON/Excel)
    ↓
Event: FILE_UPLOADED → Redis
    ↓
Bulk insert to MongoDB (with fallback)
    ↓
Event: DATA_INSERTED → Redis
    ↓
Service B logs both events
```

### 3. Search Flow (Service A)

```
User search query → GET /search?query=...
    ↓
MongoDB text search with indexes
    ↓
Efficient pagination applied
    ↓
Event: SEARCH_PERFORMED → Redis
    ↓
Results returned to user
    ↓
Service B logs search event
```

### 4. Report Generation Flow (Service B)

```
User requests report → GET /reports/pdf
    ↓
Service B queries RedisTimeSeries
    ↓
Aggregates time series data
    ↓
Generates charts using Chart.js
    ↓
Creates PDF with PDFKit
    ↓
Returns PDF to user
```

## Technology Stack

### Service A (NestJS)
- **Framework**: NestJS 10.x
- **Database**: MongoDB (official driver)
- **Cache/Messaging**: Redis (official driver)
- **File Processing**: ExcelJS, Axios
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI

### Service B (NestJS)
- **Framework**: NestJS 10.x
- **Database**: MongoDB (official driver)
- **Cache/Messaging**: Redis (official driver)
- **PDF Generation**: PDFKit
- **Charts**: chartjs-node-canvas
- **Documentation**: Swagger/OpenAPI

### Report Service (Go - Bonus)
- **Language**: Go 1.21+
- **RPC**: gRPC
- **Redis Client**: go-redis
- **PDF**: gofpdf
- **Charts**: go-chart

### Infrastructure
- **Orchestration**: Docker Compose
- **Database**: MongoDB 7.0
- **Cache**: Redis Stack (with RedisTimeSeries)
- **Monitoring**: RedisInsight

## Database Schema

### Service A - MongoDB

**Collection: data**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  website: String,
  company: Object,
  address: Object,
  // ... other fields from API
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Text index: `{ name: "text", email: "text", description: "text" }`
- Compound index: `{ createdAt: -1, _id: 1 }`
- Single index: `{ email: 1 }`

### Service B - MongoDB

**Collection: event_logs**
```javascript
{
  _id: ObjectId,
  eventType: String,        // DATA_FETCHED, FILE_UPLOADED, etc.
  timestamp: Number,        // Unix timestamp in ms
  serviceId: String,        // service-a, service-b
  recordCount: Number,      // Optional
  duration: Number,         // Optional
  fileName: String,         // Optional
  fileSize: Number,         // Optional
  // ... other event-specific fields
  receivedAt: Date
}
```

**Indexes:**
- Single index: `{ timestamp: -1 }`
- Compound index: `{ eventType: 1, timestamp: -1 }`
- Compound index: `{ serviceId: 1, timestamp: -1 }`

## Redis Data Structures

### Pub/Sub Channel
- **Channel**: `service-events`
- **Purpose**: Inter-service event messaging
- **Format**: JSON serialized events

### RedisTimeSeries Keys

Format: `ts:events:{eventType}:{metric}`

Examples:
- `ts:events:DATA_FETCHED:count` - Count of data fetch events
- `ts:events:DATA_FETCHED:records` - Number of records fetched
- `ts:events:DATA_FETCHED:duration` - Duration of fetch operations
- `ts:events:FILE_UPLOADED:filesize` - File sizes uploaded
- `ts:events:SEARCH_PERFORMED:count` - Search query counts

**Labels**: Each time series has labels:
- `eventType`: Type of event
- `service`: Originating service

## API Endpoints

### Service A

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /data/fetch | Fetch data from public API |
| POST | /data/upload | Upload and parse file |
| GET | /data/all | Get all data with pagination |
| GET | /search | Text search with pagination |
| POST | /search/advanced | Advanced search with filters |

### Service B

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /logs | Query event logs |
| GET | /logs/stats | Get log statistics |
| GET | /logs/recent | Get recent logs |
| GET | /reports/timeseries | Get time series data |
| GET | /reports/pdf | Generate PDF report |

## Event Types

```typescript
enum EventType {
  DATA_FETCHED = 'DATA_FETCHED',
  FILE_UPLOADED = 'FILE_UPLOADED',
  DATA_INSERTED = 'DATA_INSERTED',
  SEARCH_PERFORMED = 'SEARCH_PERFORMED',
  ERROR_OCCURRED = 'ERROR_OCCURRED',
}
```

## Security Considerations

1. **MongoDB Authentication**: Uses username/password authentication
2. **Input Validation**: All DTOs validated with class-validator
3. **File Upload**: File type and size validation
4. **CORS**: Enabled for cross-origin requests
5. **Error Handling**: Comprehensive error handling with logging

## Scalability

### Horizontal Scaling
- Both services are stateless and can be scaled horizontally
- MongoDB supports replica sets for high availability
- Redis can be clustered for scalability

### Performance Optimizations
- MongoDB indexes for fast queries
- Bulk insert with fallback for data insertion
- Efficient pagination with skip/limit
- RedisTimeSeries for fast time series queries

## Monitoring & Observability

1. **Logs**: Structured logging in all services
2. **Events**: All actions tracked in event logs
3. **RedisInsight**: Visual interface for Redis data
4. **Metrics**: Time series data for analytics

## Development Workflow

1. **Local Development**: Run services individually with `npm run start:dev`
2. **Docker Development**: Use `docker-compose up` for full stack
3. **Testing**: Unit tests with Jest
4. **Linting**: ESLint for code quality

## Deployment

### Docker Compose (Development)
```bash
docker-compose up -d
```

### Production Considerations
- Use environment-specific configurations
- Implement health checks
- Set up log aggregation
- Configure monitoring and alerting
- Use secrets management for credentials
- Implement rate limiting
- Add authentication/authorization

## Future Enhancements

1. **Authentication**: Add JWT-based authentication
2. **Rate Limiting**: Implement API rate limiting
3. **Caching**: Add Redis caching for frequent queries
4. **WebSockets**: Real-time event streaming
5. **Message Queue**: Add RabbitMQ/Kafka for reliable messaging
6. **API Gateway**: Centralized API gateway
7. **Service Mesh**: Istio for advanced traffic management
8. **Observability**: Prometheus + Grafana for metrics
