# Deployment Guide

This guide covers various deployment options for the MCP API Contract Validator.

## 🚀 Quick Start

### Docker (Recommended)

```bash
# Development (security disabled)
npm run docker:dev

# Production (security enabled)
npm run docker:prod
```

### Local Deployment

```bash
# Development mode
npm run start:dev

# Production mode  
npm run start:prod
```

## 📦 Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- `.env` file configured

### Development Deployment

```bash
# Start with security disabled for development
docker-compose -f docker-compose.dev.yml up --build
```

### Production Deployment

```bash
# Configure environment variables first
cp .env.example .env
# Edit .env with your production values

# Start with security enabled
docker-compose up -d --build
```

### Custom Docker Build

```bash
# Build image
npm run docker:build

# Run with custom environment
docker run -p 3000:3000 \
  --env-file .env \
  mcp-api-contract-validator:latest
```

## 🔧 Environment Configuration

### Security Settings

```bash
# Authentication (disabled by default for local)
MCP_AUTH_ENABLED=false
MCP_AUTH_TYPE=api_key          # Options: api_key, jwt
MCP_API_KEY=your-secret-key
MCP_JWT_SECRET=your-jwt-secret

# Rate Limiting (disabled by default for local)
MCP_RATE_LIMIT_ENABLED=false
MCP_RPM=1000                   # Requests per minute
MCP_BURST_LIMIT=100            # Burst capacity
```

### Production Defaults

When deploying to production, enable security:

```bash
# Production .env example
MCP_AUTH_ENABLED=true
MCP_AUTH_TYPE=api_key
MCP_API_KEY=prod-api-key-12345
MCP_RATE_LIMIT_ENABLED=true
MCP_RPM=100
MCP_BURST_LIMIT=20
NODE_ENV=production
```

## 📋 Deployment Scripts

### Automated Deployment

```bash
# Full deployment pipeline
npm run deploy
```

This script:
1. Builds the project
2. Creates deployment directory
3. Builds Docker image
4. Provides next steps

### Production Startup

```bash
# Start in production mode with security
npm run start:prod
```

### Development Startup

```bash
# Start in development mode without security
npm run start:dev
```

## 🐳 Docker Compose Options

### Development Compose
- Security disabled
- Hot reload enabled
- Source code mounted

### Production Compose
- Security enabled by default
- Redis for rate limiting (optional)
- Health checks
- Non-root user
- Log persistence

## 🔒 Security Considerations

### Production Deployment Checklist

✅ **Authentication Enabled**
- Set `MCP_AUTH_ENABLED=true`
- Configure `MCP_API_KEY` or `MCP_JWT_SECRET`

✅ **Rate Limiting Enabled**  
- Set `MCP_RATE_LIMIT_ENABLED=true`
- Adjust `MCP_RPM` based on expected load

✅ **Environment Security**
- Use strong API keys/JWT secrets
- Don't commit `.env` files
- Use secrets management in production

✅ **Docker Security**
- Non-root user (configured)
- Minimal base image (Alpine)
- Health checks enabled

## 🌐 Cloud Deployment

### AWS ECS

```bash
# Build and push to ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-west-2.amazonaws.com
docker build -t mcp-validator .
docker tag mcp-validator:latest <account-id>.dkr.ecr.us-west-2.amazonaws.com/mcp-validator:latest
docker push <account-id>.dkr.ecr.us-west-2.amazonaws.com/mcp-validator:latest
```

### Google Cloud Run

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/mcp-validator
gcloud run deploy mcp-validator --image gcr.io/PROJECT-ID/mcp-validator --platform managed
```

### Azure Container Instances

```bash
# Deploy to ACI
az container create \
  --resource-group myResourceGroup \
  --name mcp-validator \
  --image mcp-validator:latest \
  --dns-name-label mcp-validator-unique \
  --ports 3000
```

## 📊 Monitoring and Logging

### Health Checks

The Docker image includes health checks:

```bash
# Manual health check
curl http://localhost:3000/health
```

### Logs

```bash
# View logs
docker-compose logs -f mcp-api-contract-validator

# Production logs
docker logs <container-id>
```

## 🔄 Scaling

### Horizontal Scaling

Use a load balancer with multiple instances:

```yaml
# docker-compose.scale.yml
services:
  mcp-api-contract-validator:
    build: .
    deploy:
      replicas: 3
    # ... other config
```

### Rate Limiting with Redis

For distributed deployments, enable Redis:

```bash
# Start with Redis
docker-compose --profile production up -d
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :3000
   # Use different port
   docker run -p 8080:3000 mcp-api-contract-validator
   ```

2. **Permission Errors**
   ```bash
   # Fix script permissions
   chmod +x scripts/*.sh
   ```

3. **Build Failures**
   ```bash
   # Clean build
   rm -rf dist node_modules
   npm install
   npm run build
   ```

4. **Environment Issues**
   ```bash
   # Verify environment
   docker run --rm --env-file .env mcp-api-contract-validator env
   ```

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Test health endpoint
4. Review this guide for common solutions
