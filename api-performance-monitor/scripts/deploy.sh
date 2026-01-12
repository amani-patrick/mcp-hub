#!/bin/bash

# =============================================================================
# API Performance Monitor Deployment Script
# =============================================================================

set -e

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Deploying API Performance Monitor..."
echo "📁 Project directory: $PROJECT_DIR"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null compose; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Change to project directory
cd "$PROJECT_DIR"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data logs

# Build the project first
echo "🔨 Building TypeScript project..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

# Build and deploy
echo "🐳 Building Docker image..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for health check
echo "⏳ Waiting for service to be healthy..."
sleep 10

# Check if service is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ API Performance Monitor is running!"
    echo "🌐 Dashboard: http://localhost:3001"
    echo "📊 Health Check: http://localhost:3001/health"
    echo ""
    echo "🔧 Management Commands:"
    echo "  View logs: docker-compose logs -f"
    echo "  Stop service: docker-compose down"
    echo "  Restart: docker-compose restart"
    echo ""
    echo "📝 Configuration:"
    echo "  Self-hosting: .env (auth disabled, rate limiting disabled)"
    echo "  Public hosting: cp .env.production .env (auth enabled, rate limiting enabled)"
else
    echo "❌ Failed to start API Performance Monitor"
    echo "📋 Check logs: docker-compose logs"
    exit 1
fi
