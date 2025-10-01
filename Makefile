.PHONY: help install up down logs clean test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies for all services
	@echo "Installing Service A dependencies..."
	cd service-a && pnpm install
	@echo "Installing Service B dependencies..."
	cd service-b && pnpm install
	@echo "Downloading Go dependencies..."
	cd report-service && go mod download || echo "Go not installed, skipping"
	@echo "Done!"

up: ## Start all services with Docker Compose
	docker-compose up -d
	@echo "Services started!"
	@echo "Service A: http://localhost:3000/api"
	@echo "Service B: http://localhost:3001/api"
	@echo "RedisInsight: http://localhost:8001"

down: ## Stop all services
	docker-compose down

logs: ## View logs from all services
	docker-compose logs -f

logs-a: ## View logs from Service A
	docker-compose logs -f service-a

logs-b: ## View logs from Service B
	docker-compose logs -f service-b

restart: ## Restart all services
	docker-compose restart

restart-a: ## Restart Service A
	docker-compose restart service-a

restart-b: ## Restart Service B
	docker-compose restart service-b

ps: ## Show running services
	docker-compose ps

clean: ## Remove all containers, volumes, and generated files
	docker-compose down -v
	rm -rf service-a/node_modules service-b/node_modules
	rm -rf service-a/dist service-b/dist
	find . -name "*.log" -delete
	@echo "Cleaned up!"

test: ## Run tests for all services
	@echo "Testing Service A..."
	cd service-a && pnpm test || true
	@echo "Testing Service B..."
	cd service-b && pnpm test || true

build: ## Build all services
	docker-compose build

rebuild: ## Rebuild all services from scratch
	docker-compose build --no-cache

shell-a: ## Open shell in Service A container
	docker exec -it service-a sh

shell-b: ## Open shell in Service B container
	docker exec -it service-b sh

shell-mongo: ## Open MongoDB shell
	docker exec -it mongodb mongosh -u admin -p password123 --authenticationDatabase admin

shell-redis: ## Open Redis CLI
	docker exec -it redis redis-cli

dev-a: ## Run Service A in development mode (local)
	cd service-a && pnpm run start:dev

dev-b: ## Run Service B in development mode (local)
	cd service-b && pnpm run start:dev

format: ## Format code
	cd service-a && pnpm run lint || true
	cd service-b && pnpm run lint || true

health: ## Check health of all services
	@echo "Checking Service A..."
	@curl -s http://localhost:3000/api || echo "Service A not responding"
	@echo "\nChecking Service B..."
	@curl -s http://localhost:3001/api || echo "Service B not responding"
	@echo "\nChecking MongoDB..."
	@docker exec mongodb mongosh -u admin -p password123 --authenticationDatabase admin --eval "db.adminCommand('ping')" || echo "MongoDB not responding"
	@echo "\nChecking Redis..."
	@docker exec redis redis-cli ping || echo "Redis not responding"
