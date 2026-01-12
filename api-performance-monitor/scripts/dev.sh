#!/bin/bash

# =============================================================================
# API Performance Monitor Development Mode
# =============================================================================

set -e

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🛠️  Starting API Performance Monitor in Development Mode..."
echo "📁 Project directory: $PROJECT_DIR"

# Check if Node.js is installed
if ! command -v node &> /dev/null && ! command -v nodejs &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Change to project directory
cd "$PROJECT_DIR"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data logs

# Build the project
echo "🔨 Building TypeScript project..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

# Start in development mode
echo "🚀 Starting development server..."
echo "📝 Configuration: Development Mode"
echo "  - Authentication: DISABLED"
echo "  - Rate Limiting: DISABLED"
echo "  - Dashboard: http://localhost:3001"
echo "  - MCP Server: stdio"
echo ""

# Set development environment variables
export NODE_ENV=development
export ENABLE_AUTH=false
export RATE_LIMIT_PER_MINUTE=1000
export AUTO_START_DASHBOARD=true

# Start the application
node dist/index.js

echo ""
echo "🎯 Development server started!"
echo "📊 Dashboard: http://localhost:3001"
echo "🔧 To stop: Press Ctrl+C"
