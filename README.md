# Microservices Architecture - Services A & B

A comprehensive microservices solution built with NestJS, featuring data processing, event-driven architecture, and advanced reporting capabilities.

## 🏗️ Architecture Overview

This project consists of:
- **Service A**: Data fetching, file processing, and search API
- **Service B**: Event logging, querying, and PDF report generation
- **Report Service**: Go-based gRPC service for PDF generation (Bonus)
- **MongoDB**: Document storage for both services
- **Redis Stack**: Pub/Sub messaging and RedisTimeSeries for analytics

## 📋 Features

### Service A (Port 3000)

#### Core Features
- **Public API Data Fetching**: Fetch large datasets from public APIs and save to JSON/Excel files (fully automated)
- **File Upload & Parsing**: Upload JSON or Excel files and parse them automatically
- **Robust MongoDB Insertion**: Bulk insert with fallback to individual inserts for error handling
- **Advanced Search API**: 
  - Full-text search with MongoDB text indexes
  - Efficient cursor-based pagination
  - Custom filter support
  - Sorting capabilities
- **Event Publishing**: All API actions published to RedisTimeSeries for analytics

#### API Endpoints
- `POST /data/fetch` - Fetch data from public API and save to file
- `POST /data/upload` - Upload and parse file, insert into MongoDB
- `GET /data/all` - Get all data with pagination
- `GET /search` - Search with text query and pagination
- `POST /search/advanced` - Advanced search with custom filters

### Service B (Port 3001)

#### Core Features
- **Event Subscription**: Subscribes to all events from Service A via Redis Pub/Sub
- **Event Logging**: Stores all events in MongoDB with indexed fields
- **Log Query API**: Query logs by date range, event type, service ID
- **PDF Report Generation**: Generate PDF reports with charts from RedisTimeSeries data
  - Time series charts for event metrics
  - Event count summaries
  - Duration analytics
  - Professional layout with labels

#### API Endpoints
- `GET /logs` - Query event logs with filters
- `GET /logs/stats` - Get log statistics
- `GET /reports/pdf` - Generate PDF report with charts
- `GET /reports/timeseries` - Get time series data

### Report Service (Port 50051) - Bonus

Go-based gRPC service for high-performance PDF report generation with advanced charting capabilities.

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- Go 1.21+ (for report service development)

### Installation & Running

1. **Clone the repository**
```bash
git clone <repository-url>
cd test-task-2-services
```

2. **Start all services with Docker Compose**
```bash
docker-compose up -d
```

This will start:
- MongoDB (port 27017)
- Redis Stack (port 6379, RedisInsight on 8001)
- Service A (port 3000)
- Service B (port 3001)
- Report Service (port 50051)

3. **Access the services**
- Service A API: http://localhost:3000/api
- Service B API: http://localhost:3001/api
- RedisInsight: http://localhost:8001

### Local Development

#### Service A
```bash
cd service-a
npm install
npm run start:dev
```

#### Service B
```bash
cd service-b
npm install
npm run start:dev
```

#### Report Service (Go)
```bash
cd report-service
go mod download
go run main.go
```

## 📚 API Usage Examples

### Service A Examples

#### 1. Fetch Data from Public API
```bash
curl -X POST http://localhost:3000/data/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://jsonplaceholder.typicode.com/users",
    "format": "json"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Data fetched and saved successfully",
  "data": {
    "recordCount": 10,
    "filePath": "/app/data/data_1234567890.json",
    "format": "json",
    "duration": 523
  }
}
```

#### 2. Upload and Parse File
```bash
curl -X POST http://localhost:3000/data/upload \
  -F "file=@data.json"
```

#### 3. Search Data
```bash
curl "http://localhost:3000/search?query=john&page=1&limit=10"
```

#### 4. Advanced Search
```bash
curl -X POST http://localhost:3000/search/advanced \
  -H "Content-Type: application/json" \
  -d '{
    "email": "example.com",
    "name": "John"
  }' \
  "?page=1&limit=10"
```

### Service B Examples

#### 1. Query Event Logs
```bash
curl "http://localhost:3001/logs?eventType=DATA_FETCHED&limit=50"
```

#### 2. Get Log Statistics
```bash
curl "http://localhost:3001/logs/stats?startDate=2025-09-01&endDate=2025-10-01"
```

#### 3. Generate PDF Report
```bash
curl "http://localhost:3001/reports/pdf?startDate=2025-09-01&endDate=2025-10-01" \
  --output report.pdf
```

#### 4. Get Time Series Data
```bash
curl "http://localhost:3001/reports/timeseries?startDate=2025-09-01&endDate=2025-10-01"
```

## 🗂️ Project Structure

```
test-task-2-services/
├── docker-compose.yml          # Docker orchestration
├── shared/                     # Shared TypeScript types
│   └── types/
│       ├── events.ts          # Event type definitions
│       └── index.ts
├── service-a/                  # Service A (NestJS)
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── database/          # MongoDB connection (official driver)
│   │   ├── redis/             # Redis connection & event publisher
│   │   ├── data/              # Data fetching & file operations
│   │   └── search/            # Search API with indexing
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── service-b/                  # Service B (NestJS)
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── database/          # MongoDB connection (official driver)
│   │   ├── redis/             # Redis connection
│   │   ├── event-subscriber/  # Event subscription from Service A
│   │   ├── logs/              # Log storage & query APIs
│   │   └── reports/           # PDF report generation
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
└── report-service/             # Go gRPC service (Bonus)
    ├── main.go
    ├── proto/
    ├── go.mod
    └── Dockerfile
```

## 🔧 Technical Implementation

### Database Connections
- **MongoDB**: Using official `mongodb` driver (not Mongoose)
- **Redis**: Using official `redis` driver (not @nestjs-modules/ioredis)
- Connection management via NestJS lifecycle hooks

### Inter-Service Communication
- **Redis Pub/Sub**: For event-driven messaging between services
- **RedisTimeSeries**: For storing time-series analytics data
- **gRPC**: For high-performance report generation (bonus feature)

### Data Processing
- **File Operations**: Fully automated fetching and parsing (JSON/Excel)
- **Robust Insertion**: Bulk insert with individual fallback
- **Indexing**: MongoDB text indexes and compound indexes for performance

### Search & Pagination
- **Text Search**: MongoDB full-text search with text indexes
- **Efficient Pagination**: Cursor-based pagination with compound indexes
- **Filtering**: Dynamic query building for advanced filters

### Event Publishing
- All API actions publish events to Redis
- Events stored in RedisTimeSeries with labels
- Metrics tracked: count, duration, record count, file size

### PDF Report Generation
- **Charts**: Time series visualizations using Chart.js
- **Layout**: Professional formatting with headers, labels, and summaries
- **Data**: Real-time data from RedisTimeSeries

## 🎯 Code Quality

- **TypeScript**: Strongly typed throughout
- **Clean Architecture**: Separation of concerns with modules
- **Shared Libraries**: Common types and utilities
- **Error Handling**: Comprehensive error handling and logging
- **Validation**: DTO validation with class-validator
- **Documentation**: Swagger/OpenAPI documentation for all endpoints

## 🔐 Environment Variables

### Service A
```env
PORT=3000
MONGODB_URI=mongodb://admin:password123@mongodb:27017/serviceA?authSource=admin
REDIS_HOST=redis
REDIS_PORT=6379
SERVICE_NAME=service-a
```

### Service B
```env
PORT=3001
MONGODB_URI=mongodb://admin:password123@mongodb:27017/serviceB?authSource=admin
REDIS_HOST=redis
REDIS_PORT=6379
SERVICE_NAME=service-b
SERVICE_A_URL=http://service-a:3000
```

## 📊 Monitoring

- **RedisInsight**: Visual interface for Redis data at http://localhost:8001
- **Logs**: Structured logging in all services
- **Events**: All actions tracked in event logs

## 🧪 Testing

```bash
# Service A
cd service-a
npm test

# Service B
cd service-b
npm test

# Report Service
cd report-service
go test ./...
```

## 🛠️ Development Notes

### Adding New Event Types
1. Add event type to `shared/types/events.ts`
2. Implement event publishing in Service A
3. Event automatically logged by Service B subscriber

### Extending Search
- Add new indexes in `database.service.ts`
- Extend query building in `search.service.ts`

### Custom Reports
- Add new time series keys in `event-publisher.service.ts`
- Extend report generation in `reports.service.ts`

## 📝 License

MIT

## 👥 Author

Built as a technical assessment demonstrating microservices architecture, event-driven design, and full-stack development capabilities.
