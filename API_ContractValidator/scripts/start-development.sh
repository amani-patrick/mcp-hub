#!/bin/bash

# Development startup script with security disabled

set -e

echo "🛠️ Starting MCP API Contract Validator in development mode..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Disable security for development
export MCP_AUTH_ENABLED=${MCP_AUTH_ENABLED:-false}
export MCP_RATE_LIMIT_ENABLED=${MCP_RATE_LIMIT_ENABLED:-false}

echo "🔐 Authentication: ${MCP_AUTH_ENABLED}"
echo "⚡ Rate Limiting: ${MCP_RATE_LIMIT_ENABLED}"

# Start the server with nodemon for hot reload
if command -v nodemon &> /dev/null; then
    nodemon --exec "npm run build && node dist/index.js" src/
else
    echo "⚠️  Nodemon not found. Install with: npm install -g nodemon"
    npm run build && node dist/index.js
fi
