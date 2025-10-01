# Getting Started Guide

Welcome! This guide will help you get the microservices up and running in minutes.

## 🚀 Quick Start (5 Minutes)

### Step 1: Prerequisites

Ensure you have installed:
- **Docker** (20.10+)
- **Docker Compose** (2.0+)

Check versions:
```bash
docker --version
docker-compose --version
```

### Step 2: Start Services

```bash
# Navigate to project directory
cd test-task-2-services

# Start all services
docker-compose up -d

# Wait for services to be ready (30-60 seconds)
docker-compose ps
```

### Step 3: Verify Services

```bash
# Check all services are running
docker-compose ps

# Expected output:
# service-a     running   0.0.0.0:3000->3000/tcp
# service-b     running   0.0.0.0:3001->3001/tcp
# mongodb       running   0.0.0.0:27017->27017/tcp
# redis         running   0.0.0.0:6379->6379/tcp
```

### Step 4: Test the System

```bash
# Run quick test script
./quick-test.sh
```

### Step 5: Explore APIs

Open in your browser:
- **Service A Swagger**: http://localhost:3000/api
- **Service B Swagger**: http://localhost:3001/api
- **RedisInsight**: http://localhost:8001

## 📖 First API Calls

### 1. Fetch Data from Public API

```bash
curl -X POST http://localhost:3000/data/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://jsonplaceholder.typicode.com/users",
    "format": "json"
  }'
```

**What happens:**
1. Service A fetches data from the API
2. Data is saved to a JSON file
3. Event is published to Redis
4. Service B receives and logs the event
5. Metrics stored in RedisTimeSeries

### 2. Search the Data

```bash
curl "http://localhost:3000/search?query=&page=1&limit=5"
```

### 3. View Event Logs

```bash
curl "http://localhost:3001/logs?limit=10"
```

### 4. Generate PDF Report

```bash
curl "http://localhost:3001/reports/pdf" --output my-report.pdf
```

Open `my-report.pdf` to see charts and analytics!

## 🎯 Common Tasks

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f service-a
docker-compose logs -f service-b
```

### Restart Services

```bash
# All services
docker-compose restart

# Specific service
docker-compose restart service-a
```

### Stop Services

```bash
docker-compose down
```

### Clean Everything

```bash
# Stop and remove volumes (deletes all data)
docker-compose down -v
```

## 🗂️ Project Structure

```
test-task-2-services/
├── 📄 README.md              ← Start here
├── 📄 GETTING_STARTED.md     ← This file
├── 📄 ARCHITECTURE.md        ← System design
├── 📄 TESTING.md             ← Testing guide
├── 📄 PROJECT_SUMMARY.md     ← Requirements checklist
├── 🐳 docker-compose.yml     ← Docker setup
├── 🔧 Makefile               ← Build commands
├── 📁 service-a/             ← Service A code
├── 📁 service-b/             ← Service B code
├── 📁 report-service/        ← Go gRPC service
└── 📁 shared/                ← Shared types
```

## 📚 Documentation Guide

1. **README.md** - Overview and features
2. **GETTING_STARTED.md** (this file) - Quick setup
3. **ARCHITECTURE.md** - Technical architecture
4. **TESTING.md** - How to test everything
5. **CONTRIBUTING.md** - Development guidelines
6. **PROJECT_SUMMARY.md** - Requirements fulfilled
7. **FEATURES_CHECKLIST.md** - Complete feature list

## 🛠️ Using Makefile

The project includes a Makefile for common tasks:

```bash
# Show all available commands
make help

# Install dependencies
make install

# Start services
make up

# View logs
make logs

# Stop services
make down

# Run tests
make test

# Clean everything
make clean
```

## 🔍 Exploring the System

### MongoDB

```bash
# Connect to MongoDB
docker exec -it mongodb mongosh -u admin -p password123 --authenticationDatabase admin

# In MongoDB shell:
use serviceA
db.data.find().limit(5)
db.data.countDocuments()

use serviceB
db.event_logs.find().limit(5)
```

### Redis

```bash
# Connect to Redis CLI
docker exec -it redis redis-cli

# In Redis CLI:
KEYS ts:*
TS.RANGE ts:events:DATA_FETCHED:count - +
```

### RedisInsight (GUI)

1. Open http://localhost:8001
2. Click "Add Redis Database"
3. Use host: `redis`, port: `6379`
4. Browse keys and visualize data

## 🎓 Learning Path

### Beginner
1. Read README.md
2. Start services with `docker-compose up -d`
3. Try API calls from GETTING_STARTED.md
4. Explore Swagger documentation
5. View logs with `docker-compose logs -f`

### Intermediate
1. Read ARCHITECTURE.md
2. Understand event flow
3. Explore MongoDB collections
4. Check RedisTimeSeries data
5. Run full test suite from TESTING.md

### Advanced
1. Read CONTRIBUTING.md
2. Modify code and add features
3. Run services locally (without Docker)
4. Add new event types
5. Extend reporting capabilities

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check Docker is running
docker ps

# Check ports are not in use
lsof -i :3000
lsof -i :3001
lsof -i :27017
lsof -i :6379

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d
```

### Can't Connect to Services

```bash
# Check service health
docker-compose ps

# View service logs
docker-compose logs service-a
docker-compose logs service-b

# Restart services
docker-compose restart
```

### No Data in MongoDB

```bash
# First, fetch some data
curl -X POST http://localhost:3000/data/fetch \
  -H "Content-Type: application/json" \
  -d '{"url": "https://jsonplaceholder.typicode.com/users", "format": "json"}'

# Then check MongoDB
docker exec -it mongodb mongosh -u admin -p password123 --authenticationDatabase admin
use serviceA
db.data.find().limit(5)
```

### Events Not Being Logged

```bash
# Check Redis is running
docker exec -it redis redis-cli ping

# Check Service B logs
docker-compose logs service-b

# Verify subscription
docker-compose logs service-b | grep "Subscribed"
```

## 📊 Sample Workflow

Here's a complete workflow to test all features:

```bash
# 1. Fetch data from API
curl -X POST http://localhost:3000/data/fetch \
  -H "Content-Type: application/json" \
  -d '{"url": "https://jsonplaceholder.typicode.com/users", "format": "json"}'

# 2. Wait a moment for event propagation
sleep 2

# 3. Check event was logged
curl "http://localhost:3001/logs?eventType=DATA_FETCHED&limit=1"

# 4. Search the data
curl "http://localhost:3000/search?query=&page=1&limit=5"

# 5. Get statistics
curl "http://localhost:3001/logs/stats"

# 6. Generate PDF report
curl "http://localhost:3001/reports/pdf" --output report.pdf

# 7. View the report
open report.pdf  # macOS
xdg-open report.pdf  # Linux
```

## 🎯 Next Steps

After getting started:

1. **Explore APIs**: Try all endpoints in Swagger
2. **Upload Files**: Create and upload JSON/Excel files
3. **Advanced Search**: Use filters and sorting
4. **Monitor Events**: Watch real-time event logging
5. **Generate Reports**: Create PDF reports with different date ranges
6. **Read Architecture**: Understand the system design
7. **Run Tests**: Execute the full test suite
8. **Modify Code**: Add your own features

## 💡 Tips

- Use Swagger UI for interactive API testing
- Check RedisInsight for visual data exploration
- Monitor logs in real-time: `docker-compose logs -f`
- Use Makefile commands for convenience
- Read TESTING.md for comprehensive test scenarios

## 🆘 Getting Help

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Review TROUBLESHOOTING section above
3. Consult TESTING.md for verification steps
4. Check ARCHITECTURE.md for system understanding
5. Review CONTRIBUTING.md for development setup

## 🎉 You're Ready!

You now have a fully functional microservices system running. Explore, experiment, and enjoy!

**Quick Links:**
- Service A API: http://localhost:3000/api
- Service B API: http://localhost:3001/api
- RedisInsight: http://localhost:8001

Happy coding! 🚀
