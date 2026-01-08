# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2025-01-08

### ✨ Added
- **Configurable Authentication System**
  - API Key authentication support
  - JWT authentication support  
  - Disabled by default for local development
  - Environment variable configuration

- **Configurable Rate Limiting**
  - In-memory rate limiting with sliding windows
  - Configurable requests per minute (RPM)
  - Burst limit support
  - Disabled by default for local development

- **Enhanced Security Features**
  - Middleware-based architecture
  - Client identification for rate limiting
  - Graceful error handling for auth/rate limit failures
  - Production-ready security defaults

- **Docker Support**
  - Multi-stage Dockerfile with Alpine Linux
  - Non-root user execution
  - Health checks included
  - Production and development compose files

- **Deployment Scripts**
  - Automated deployment pipeline
  - Production and development startup scripts
  - Environment configuration helpers
  - Docker build and run scripts

- **Comprehensive Documentation**
  - Detailed deployment guide
  - Security configuration documentation
  - Docker deployment instructions
  - Cloud deployment examples

### 🔧 Technical Improvements
- **MCP SDK Integration**
  - Updated to use McpServer class
  - Proper tool registration with security wrappers
  - Type-safe handler signatures
  - Enhanced error handling

- **Build System**
  - TypeScript compilation fixes
  - Enhanced validation tools re-integrated
  - Proper module resolution
  - Development and production build targets

- **Package Management**
  - Added dotenv dependency
  - Updated npm scripts for deployment
  - Docker ignore file for optimized builds
  - Makefile for easy operations

### 🛡️ Security Enhancements
- **Zero-Friction Development**
  - Authentication disabled by default locally
  - Rate limiting disabled by default locally
  - Clear security status logging
  - Environment-based configuration

- **Production-Ready Security**
  - Authentication enabled by default in production
  - Rate limiting enabled by default in production
  - Secure defaults (100 RPM, 20 burst)
  - API key and JWT support

### 📦 Deployment Options
- **Docker Deployment**
  - `npm run docker:dev` - Development with hot reload
  - `npm run docker:prod` - Production with security
  - `docker-compose.yml` - Production setup
  - `docker-compose.dev.yml` - Development setup

- **Local Deployment**
  - `npm run start:dev` - Development mode
  - `npm run start:prod` - Production mode
  - `npm run deploy` - Full pipeline

- **Cloud Deployment**
  - AWS ECS deployment guide
  - Google Cloud Run support
  - Azure Container Instances support

### 📋 Environment Variables
```bash
# Authentication
MCP_AUTH_ENABLED=false          # Default: disabled
MCP_AUTH_TYPE=api_key        # Options: api_key, jwt
MCP_API_KEY=your-secret-key
MCP_JWT_SECRET=your-jwt-secret

# Rate Limiting
MCP_RATE_LIMIT_ENABLED=false   # Default: disabled
MCP_RPM=1000               # Default: 1000 for local, 100 for prod
MCP_BURST_LIMIT=100         # Default: 100 for local, 20 for prod
```

### 🐳 Docker Features
- **Multi-stage Build**: Optimized image size
- **Security**: Non-root user, minimal base image
- **Health Checks**: Built-in health monitoring
- **Environment**: Production and development configurations
- **Persistence**: Log volume mounting
- **Scaling**: Redis support for distributed rate limiting

### 📚 Documentation
- **DEPLOYMENT.md**: Comprehensive deployment guide
- **README.md**: Updated with quick start and deployment options
- **CHANGELOG.md**: This file
- **Makefile**: Command reference and quick commands

### 🎯 Key Principles
- **Developer Experience**: Zero friction for local development
- **Security First**: Production deployments protected by default
- **OSS Best Practices**: Follows patterns from Redis, Elasticsearch, Supabase
- **Flexible Configuration**: Environment-based settings
- **Container Ready**: Docker-first deployment approach

---

## Migration Notes

### From Previous Version
If upgrading from a version without authentication/rate limiting:

1. **No Breaking Changes**: Existing functionality preserved
2. **Security Opt-In**: Enable security when ready for production
3. **Environment Setup**: Copy `.env.example` to `.env` and configure
4. **Deployment**: Use new Docker compose files or deployment scripts

### Production Migration
1. Set `MCP_AUTH_ENABLED=true` in production
2. Configure `MCP_API_KEY` or `MCP_JWT_SECRET`
3. Set `MCP_RATE_LIMIT_ENABLED=true` with appropriate limits
4. Use `npm run docker:prod` for containerized deployment

---

## Support

For deployment issues:
1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Verify environment variables
3. Test health endpoint: `curl http://localhost:3001/health`
4. Review logs: `docker-compose logs -f`
