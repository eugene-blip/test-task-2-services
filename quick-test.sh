#!/bin/bash

echo "=========================================="
echo "Quick Test Script for Microservices"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if services are running
echo "Checking if services are running..."
if ! docker ps | grep -q service-a; then
    echo -e "${RED}❌ Service A is not running${NC}"
    echo "Please start services with: docker-compose up -d"
    exit 1
fi

if ! docker ps | grep -q service-b; then
    echo -e "${RED}❌ Service B is not running${NC}"
    echo "Please start services with: docker-compose up -d"
    exit 1
fi

echo -e "${GREEN}✅ Services are running${NC}"
echo ""

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 5

# Test 1: Fetch data from public API
echo -e "${YELLOW}Test 1: Fetching data from public API...${NC}"
response=$(curl -s -X POST http://localhost:3000/data/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "coinId": "bitcoin",
    "vsCurrency": "usd",
    "days": 30
  }')

if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✅ Data fetch successful${NC}"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
else
    echo -e "${RED}❌ Data fetch failed${NC}"
    echo "$response"
fi
echo ""

# Wait for event propagation
sleep 2

# Test 2: Check if event was logged in Service B
echo -e "${YELLOW}Test 2: Checking event logs in Service B...${NC}"
response=$(curl -s "http://localhost:3001/logs?eventType=DATA_FETCHED&limit=1")

if echo "$response" | grep -q "DATA_FETCHED"; then
    echo -e "${GREEN}✅ Event successfully logged in Service B${NC}"
    echo "$response" | jq '.logs[0] | {eventType, serviceId, recordCount, timestamp}' 2>/dev/null || echo "$response"
else
    echo -e "${RED}❌ Event not found in logs${NC}"
    echo "$response"
fi
echo ""

# Test 3: Search data
echo -e "${YELLOW}Test 3: Searching data...${NC}"
response=$(curl -s "http://localhost:3000/search?query=&page=1&limit=5")

if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✅ Search successful${NC}"
    count=$(echo "$response" | jq '.pagination.total' 2>/dev/null || echo "N/A")
    echo "Total records found: $count"
else
    echo -e "${RED}❌ Search failed${NC}"
    echo "$response"
fi
echo ""

# Wait for search event
sleep 2

# Test 4: Get log statistics
echo -e "${YELLOW}Test 4: Getting log statistics...${NC}"
response=$(curl -s "http://localhost:3001/logs/stats")

if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✅ Statistics retrieved${NC}"
    echo "$response" | jq '.data' 2>/dev/null || echo "$response"
else
    echo -e "${RED}❌ Failed to get statistics${NC}"
    echo "$response"
fi
echo ""

# Test 5: Get time series data
echo -e "${YELLOW}Test 5: Getting time series data...${NC}"
response=$(curl -s "http://localhost:3001/reports/timeseries")

if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✅ Time series data retrieved${NC}"
    keys=$(echo "$response" | jq '.data | keys' 2>/dev/null || echo "N/A")
    echo "Time series keys: $keys"
else
    echo -e "${RED}❌ Failed to get time series data${NC}"
    echo "$response"
fi
echo ""

# Test 6: Generate PDF report
echo -e "${YELLOW}Test 6: Generating PDF report...${NC}"
curl -s "http://localhost:3001/reports/pdf" --output test-report.pdf

if [ -f test-report.pdf ] && [ -s test-report.pdf ]; then
    size=$(wc -c < test-report.pdf)
    echo -e "${GREEN}✅ PDF report generated successfully${NC}"
    echo "File: test-report.pdf (${size} bytes)"
else
    echo -e "${RED}❌ Failed to generate PDF report${NC}"
fi
echo ""

# Test 7: Upload test data
echo -e "${YELLOW}Test 7: Uploading test data...${NC}"

# Create test file
cat > /tmp/test-upload.json << 'EOF'
[
  {
    "name": "Test User 1",
    "email": "test1@example.com",
    "phone": "111-111-1111"
  },
  {
    "name": "Test User 2",
    "email": "test2@example.com",
    "phone": "222-222-2222"
  }
]
EOF

response=$(curl -s -X POST http://localhost:3000/data/upload \
  -F "file=@/tmp/test-upload.json;type=application/json")

if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✅ File upload successful${NC}"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
else
    echo -e "${RED}❌ File upload failed${NC}"
    echo "$response"
fi

# Cleanup
rm -f /tmp/test-upload.json
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo ""
echo "All basic tests completed!"
echo ""
echo "Next steps:"
echo "1. Check Swagger documentation:"
echo "   - Service A: http://localhost:3000/api"
echo "   - Service B: http://localhost:3001/api"
echo ""
echo "2. View RedisInsight:"
echo "   - http://localhost:8001"
echo ""
echo "3. Check generated PDF report:"
echo "   - test-report.pdf"
echo ""
echo "4. View detailed logs:"
echo "   - docker-compose logs -f"
echo ""
echo "For more comprehensive testing, see TESTING.md"
echo ""
