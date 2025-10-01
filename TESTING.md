# Testing Guide

This guide provides step-by-step instructions for testing all features of the microservices.

## Prerequisites

Ensure all services are running:
```bash
docker-compose up -d
```

Check service health:
```bash
docker-compose ps
```

## Service A Testing

### 1. Test Data Fetching from Public API

**Fetch users data (JSON format):**
```bash
curl -X POST http://localhost:3000/data/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://jsonplaceholder.typicode.com/users",
    "format": "json"
  }'
```

**Expected Response:**
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

**Fetch posts data (Excel format):**
```bash
curl -X POST http://localhost:3000/data/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://jsonplaceholder.typicode.com/posts",
    "format": "excel"
  }'
```

### 2. Test File Upload

**Create a test JSON file:**
```bash
cat > test-data.json << 'EOF'
[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "website": "johndoe.com"
  },
  {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "098-765-4321",
    "website": "janesmith.com"
  }
]
EOF
```

**Upload the file:**
```bash
curl -X POST http://localhost:3000/data/upload \
  -F "file=@test-data.json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "File uploaded and data inserted successfully",
  "data": {
    "recordCount": 2,
    "insertedCount": 2,
    "duration": 145,
    "errors": []
  }
}
```

### 3. Test Data Retrieval

**Get all data with pagination:**
```bash
curl "http://localhost:3000/data/all?limit=10&skip=0"
```

### 4. Test Search API

**Simple text search:**
```bash
curl "http://localhost:3000/search?query=john&page=1&limit=10"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "query": "john",
  "duration": 23
}
```

**Advanced search with filters:**
```bash
curl -X POST http://localhost:3000/search/advanced \
  -H "Content-Type: application/json" \
  -d '{
    "email": "example.com"
  }' \
  "?page=1&limit=10"
```

**Search with sorting:**
```bash
curl "http://localhost:3000/search?query=&page=1&limit=10&sortBy=createdAt&sortOrder=desc"
```

### 5. Verify Swagger Documentation

Open in browser:
```
http://localhost:3000/api
```

## Service B Testing

### 1. Test Event Log Queries

**Get all logs:**
```bash
curl "http://localhost:3001/logs?limit=50&page=1"
```

**Filter by event type:**
```bash
curl "http://localhost:3001/logs?eventType=DATA_FETCHED&limit=20"
```

**Filter by service:**
```bash
curl "http://localhost:3001/logs?serviceId=service-a&limit=20"
```

**Filter by date range:**
```bash
curl "http://localhost:3001/logs?startDate=2025-09-01T00:00:00Z&endDate=2025-10-01T23:59:59Z&limit=50"
```

**Expected Response:**
```json
{
  "success": true,
  "logs": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 125,
    "totalPages": 3
  }
}
```

### 2. Test Log Statistics

**Get overall statistics:**
```bash
curl "http://localhost:3001/logs/stats"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total": 125,
    "byEventType": {
      "DATA_FETCHED": 45,
      "FILE_UPLOADED": 30,
      "DATA_INSERTED": 30,
      "SEARCH_PERFORMED": 20
    },
    "byServiceId": {
      "service-a": 125
    }
  }
}
```

**Get statistics for date range:**
```bash
curl "http://localhost:3001/logs/stats?startDate=2025-09-01&endDate=2025-10-01"
```

### 3. Test Recent Logs

```bash
curl "http://localhost:3001/logs/recent?limit=10"
```

### 4. Test Time Series Data Query

```bash
curl "http://localhost:3001/reports/timeseries?startDate=2025-09-01T00:00:00Z&endDate=2025-10-01T23:59:59Z"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "ts:events:DATA_FETCHED:count": [
      {
        "timestamp": 1696118400000,
        "value": 1,
        "date": "2025-10-01T00:00:00.000Z"
      }
    ],
    "ts:events:DATA_FETCHED:records": [...],
    "ts:events:DATA_FETCHED:duration": [...]
  }
}
```

### 5. Test PDF Report Generation

**Generate and download PDF report:**
```bash
curl "http://localhost:3001/reports/pdf?startDate=2025-09-01T00:00:00Z&endDate=2025-10-01T23:59:59Z" \
  --output report.pdf
```

**Verify the PDF:**
```bash
file report.pdf
# Should output: report.pdf: PDF document
```

Open the PDF to verify:
- Title and date range
- Summary statistics
- Time series charts
- Professional layout with labels

### 6. Verify Swagger Documentation

Open in browser:
```
http://localhost:3001/api
```

## Integration Testing

### End-to-End Flow Test

**1. Fetch data from API (Service A):**
```bash
curl -X POST http://localhost:3000/data/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://jsonplaceholder.typicode.com/users",
    "format": "json"
  }'
```

**2. Wait a moment for event propagation (1-2 seconds)**

**3. Check if event was logged (Service B):**
```bash
curl "http://localhost:3001/logs?eventType=DATA_FETCHED&limit=1"
```

**4. Verify the event contains correct data:**
- Check `eventType` is "DATA_FETCHED"
- Check `serviceId` is "service-a"
- Check `recordCount` matches the fetched data
- Check `timestamp` is recent

**5. Search the inserted data (Service A):**
```bash
curl "http://localhost:3000/search?query=&page=1&limit=5"
```

**6. Check if search event was logged (Service B):**
```bash
curl "http://localhost:3001/logs?eventType=SEARCH_PERFORMED&limit=1"
```

**7. Generate report with all events (Service B):**
```bash
curl "http://localhost:3001/reports/pdf" --output integration-test-report.pdf
```

## Redis Testing

### Access RedisInsight

Open in browser:
```
http://localhost:8001
```

**Connect to Redis:**
- Host: redis
- Port: 6379

**Verify Time Series Data:**
1. Navigate to Browser
2. Search for keys: `ts:*`
3. View time series data

### Manual Redis Commands

**Connect to Redis CLI:**
```bash
docker exec -it redis redis-cli
```

**List all time series keys:**
```
KEYS ts:*
```

**Query time series data:**
```
TS.RANGE ts:events:DATA_FETCHED:count - +
```

**Get time series info:**
```
TS.INFO ts:events:DATA_FETCHED:count
```

## MongoDB Testing

### Access MongoDB

**Connect to MongoDB:**
```bash
docker exec -it mongodb mongosh -u admin -p password123 --authenticationDatabase admin
```

**Service A Database:**
```javascript
use serviceA
db.data.find().limit(5)
db.data.countDocuments()
db.data.getIndexes()
```

**Service B Database:**
```javascript
use serviceB
db.event_logs.find().limit(5)
db.event_logs.countDocuments()
db.event_logs.getIndexes()
```

**Test text search:**
```javascript
use serviceA
db.data.find({ $text: { $search: "john" } }).limit(5)
```

## Performance Testing

### Load Test Data Fetching

```bash
for i in {1..10}; do
  curl -X POST http://localhost:3000/data/fetch \
    -H "Content-Type: application/json" \
    -d '{
      "url": "https://jsonplaceholder.typicode.com/users",
      "format": "json"
    }' &
done
wait
```

### Load Test Search

```bash
for i in {1..50}; do
  curl "http://localhost:3000/search?query=test&page=1&limit=10" &
done
wait
```

### Verify Event Processing

After load testing, check event logs:
```bash
curl "http://localhost:3001/logs/stats"
```

## Troubleshooting

### Service Not Responding

**Check service status:**
```bash
docker-compose ps
```

**View service logs:**
```bash
docker-compose logs service-a
docker-compose logs service-b
```

**Restart services:**
```bash
docker-compose restart service-a service-b
```

### MongoDB Connection Issues

**Check MongoDB logs:**
```bash
docker-compose logs mongodb
```

**Verify MongoDB is accessible:**
```bash
docker exec -it mongodb mongosh -u admin -p password123 --authenticationDatabase admin --eval "db.adminCommand('ping')"
```

### Redis Connection Issues

**Check Redis logs:**
```bash
docker-compose logs redis
```

**Test Redis connection:**
```bash
docker exec -it redis redis-cli ping
```

### Events Not Being Received

**Check Redis Pub/Sub:**
```bash
docker exec -it redis redis-cli
SUBSCRIBE service-events
```

Then trigger an event from Service A and watch for messages.

### No Time Series Data

**Verify RedisTimeSeries module:**
```bash
docker exec -it redis redis-cli MODULE LIST
```

Should show RedisTimeSeries module loaded.

## Test Results Checklist

- [ ] Service A can fetch data from public API
- [ ] Data is saved to JSON file
- [ ] Data is saved to Excel file
- [ ] File upload works with JSON
- [ ] File upload works with Excel
- [ ] Data is inserted into MongoDB
- [ ] Bulk insert works correctly
- [ ] Search returns correct results
- [ ] Pagination works correctly
- [ ] Text search with indexes works
- [ ] Advanced search with filters works
- [ ] Events are published to Redis
- [ ] Service B receives events
- [ ] Events are logged to MongoDB
- [ ] Log queries work with filters
- [ ] Log statistics are accurate
- [ ] Time series data is stored
- [ ] Time series data can be queried
- [ ] PDF report is generated
- [ ] PDF contains charts
- [ ] PDF has proper layout
- [ ] Swagger documentation is accessible
- [ ] All API endpoints respond correctly
- [ ] Error handling works properly
- [ ] Services recover from failures

## Automated Testing

### Unit Tests

**Service A:**
```bash
cd service-a
pnpm test
```

**Service B:**
```bash
cd service-b
pnpm test
```

### Integration Tests

Run the end-to-end flow test script:
```bash
./test-integration.sh
```

## Conclusion

After completing all tests, you should have:
1. Data in MongoDB from both fetching and uploading
2. Event logs in Service B database
3. Time series data in Redis
4. Generated PDF reports with charts
5. Verified all API endpoints work correctly
