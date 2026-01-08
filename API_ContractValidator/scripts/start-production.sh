#!/bin/bash

# Production startup script with security enabled

set -e

echo "🔐 Starting MCP API Contract Validator in production mode..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Enable security for production
export MCP_AUTH_ENABLED=${MCP_AUTH_ENABLED:-true}
export MCP_AUTH_TYPE=${MCP_AUTH_TYPE:-api_key}
export MCP_RATE_LIMIT_ENABLED=${MCP_RATE_LIMIT_ENABLED:-true}
export MCP_RPM=${MCP_RPM:-100}
export MCP_BURST_LIMIT=${MCP_BURST_LIMIT:-20}

echo "🔐 Authentication: ${MCP_AUTH_ENABLED}"
echo "⚡ Rate Limiting: ${MCP_RATE_LIMIT_ENABLED} (${MCP_RPM} RPM)"

# Start the server
node dist/index.js
