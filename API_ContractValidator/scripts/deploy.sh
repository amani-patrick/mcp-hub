#!/bin/bash

# Deployment script for MCP API Contract Validator

set -e

echo "🚀 Starting deployment..."

# Build the project
echo "📦 Building project..."
npm run build

# Create deployment directory
echo "📁 Creating deployment directory..."
mkdir -p deployment
cp -r dist deployment/
cp package.json deployment/
cp package-lock.json deployment/
cp .env.example deployment/.env

# Create production Docker image
echo "🐳 Building Docker image..."
docker build -t mcp-api-contract-validator:latest .

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy deployment/.env to deployment/.env.local and configure your values"
echo "2. Run: docker run -p 3000:3000 --env-file deployment/.env.local mcp-api-contract-validator:latest"
echo "3. Or use docker-compose: docker-compose up -d"
