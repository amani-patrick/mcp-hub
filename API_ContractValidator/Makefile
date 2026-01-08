# MCP API Contract Validator - Makefile

.PHONY: help build start dev prod test clean docker docker-build docker-run docker-dev docker-prod deploy

# Default target
help:
	@echo "MCP API Contract Validator - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make build      - Build the project"
	@echo "  make start      - Start the server"
	@echo "  make dev        - Start in development mode (security disabled)"
	@echo "  make prod       - Start in production mode (security enabled)"
	@echo "  make test       - Run tests"
	@echo "  make clean      - Clean build artifacts"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build - Build Docker image"
	@echo "  make docker-run   - Run Docker container"
	@echo "  make docker-dev   - Start development Docker compose"
	@echo "  make docker-prod  - Start production Docker compose"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy      - Full deployment pipeline"
	@echo ""

# Build targets
build:
	@echo "📦 Building project..."
	npm run build

start: build
	@echo "🚀 Starting server..."
	npm run start

dev:
	@echo "🛠️ Starting development server..."
	npm run start:dev

prod:
	@echo "🔐 Starting production server..."
	npm run start:prod

# Test targets
test:
	@echo "🧪 Running tests..."
	npm run test

test-watch:
	@echo "👀 Running tests in watch mode..."
	npm run test:watch

test-coverage:
	@echo "📊 Running tests with coverage..."
	npm run test:coverage

# Clean targets
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist
	rm -rf node_modules
	rm -rf logs
	rm -rf deployment

clean-docker:
	@echo "🐳 Cleaning Docker artifacts..."
	docker system prune -f
	docker volume prune -f

# Docker targets
docker-build:
	@echo "🐳 Building Docker image..."
	npm run docker:build

docker-run: docker-build
	@echo "🚀 Running Docker container..."
	npm run docker:run

docker-dev:
	@echo "🛠️ Starting development Docker compose..."
	npm run docker:dev

docker-prod:
	@echo "🔐 Starting production Docker compose..."
	npm run docker:prod

docker-stop:
	@echo "🛑 Stopping Docker containers..."
	docker-compose down

docker-logs:
	@echo "📋 Showing Docker logs..."
	docker-compose logs -f

# Deployment targets
deploy: build
	@echo "🚀 Deploying application..."
	npm run deploy

# Quick start targets
quick-dev:
	@echo "🚀 Quick development setup..."
	npm install
	cp .env.example .env
	make dev

quick-prod:
	@echo "🚀 Quick production setup..."
	npm install
	cp .env.example .env
	@echo "⚠️  Please edit .env with your production settings"
	@read -p "Press Enter to continue..."
	make prod

# Utility targets
install:
	@echo "📦 Installing dependencies..."
	npm install

lint:
	@echo "🔍 Running linter..."
	npm run lint

lint-fix:
	@echo "🔧 Fixing linting issues..."
	npm run lint:fix

# Health check
health:
	@echo "💓 Checking health..."
	curl -f http://localhost:3001/health || echo "❌ Service not healthy"

# Environment setup
env-dev:
	@echo "📝 Setting up development environment..."
	cp .env.example .env
	sed -i 's/MCP_AUTH_ENABLED=false/MCP_AUTH_ENABLED=false/' .env
	sed -i 's/MCP_RATE_LIMIT_ENABLED=false/MCP_RATE_LIMIT_ENABLED=false/' .env
	@echo "✅ Development environment configured"

env-prod:
	@echo "📝 Setting up production environment..."
	cp .env.example .env
	sed -i 's/MCP_AUTH_ENABLED=false/MCP_AUTH_ENABLED=true/' .env
	sed -i 's/MCP_RATE_LIMIT_ENABLED=false/MCP_RATE_LIMIT_ENABLED=true/' .env
	@echo "✅ Production environment configured"
	@echo "⚠️  Please edit .env with your API keys and secrets"
