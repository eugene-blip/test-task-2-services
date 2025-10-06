#!/bin/bash

echo "=========================================="
echo "Microservices Setup Script"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies for Service A
echo "📦 Installing dependencies for Service A..."
cd service-a
if [ -f "package.json" ]; then
    pnpm install
    echo "✅ Service A dependencies installed"
else
    echo "⚠️  Service A package.json not found"
fi
cd ..
echo ""

# Install dependencies for Service B
echo "📦 Installing dependencies for Service B..."
cd service-b
if [ -f "package.json" ]; then
    pnpm install
    echo "✅ Service B dependencies installed"
else
    echo "⚠️  Service B package.json not found"
fi
cd ..
echo ""


echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "To start all services:"
echo "  docker-compose up -d"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop all services:"
echo "  docker-compose down"
echo ""
echo "Service URLs:"
echo "  - Service A: http://localhost:3000/api"
echo "  - Service B: http://localhost:3001/api"
echo "  - RedisInsight: http://localhost:8001"
echo ""
