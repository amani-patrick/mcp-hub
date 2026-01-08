# API Contract Validator

A powerful MCP tool and CLI for validating API responses and detecting breaking OpenAPI changes with severity levels and comprehensive reporting.

## Features

### 🔍 Core Functionality
- **Response Validation**: Validate API responses against OpenAPI specifications
- **Breaking Change Detection**: Compare OpenAPI specs and detect breaking changes
- **Severity Levels**: Categorize changes by severity (Critical, Major, Minor, Info)
- **Non-breaking Warnings**: Identify additions and improvements
- **Multiple Formats**: Support for JSON, YAML, and YML OpenAPI specs

### 🚀 Power-ups
- **CLI Wrapper**: Command-line interface for easy integration
- **GitHub Actions**: Automated contract validation in CI/CD
- **Batch Processing**: Analyze multiple specs at once
- **Detailed Reporting**: Comprehensive change analysis with summaries

## 🔐 Security & Rate Limiting

**Authentication and rate limiting are optional and disabled by default. They are recommended when exposing the MCP server publicly.**

### Configuration Options

#### Authentication
- **Default (local/self-hosted)**: ❌ No auth required
- **Hosted/public deployment**: ✅ Auth enabled (API key or JWT)

```bash
# Environment variables
MCP_AUTH_ENABLED=false          # Default: disabled
MCP_AUTH_TYPE=api_key        # Options: api_key, jwt
MCP_API_KEY=your-secret-key   # Required if auth_type=api_key
MCP_JWT_SECRET=your-jwt-secret # Required if auth_type=jwt
```

#### Rate Limiting
- **Default (local)**: Disabled or very high limits
- **Hosted**: Enabled with sane defaults

```bash
# Environment variables
MCP_RATE_LIMIT_ENABLED=false   # Default: disabled
MCP_RPM=1000               # Requests per minute (default: 1000 for local)
MCP_BURST_LIMIT=100         # Burst limit (default: 100)
```

### Why This Approach

✅ **Protects public deployments** from abuse and runaway agent loops  
✅ **Keeps it easy for developers** - no friction for local development  
✅ **Follows OSS best practices** - same pattern as Redis, Elasticsearch, Supabase  
✅ **Configurable security** - enable only when needed  

## Installation

### As MCP Tool
```bash
npm install mcp-api-contract-validator
```

### As CLI Tool
```bash
npm install -g mcp-api-contract-validator
```

## 🚀 Quick Start

### Docker (Recommended)
```bash
# Development (security disabled)
npm run docker:dev

# Production (security enabled)  
npm run docker:prod
```

### Local Development
```bash
# Clone and install
git clone <repo-url>
cd api-contract-validator
npm install

# Start development server
npm run start:dev
```

### Production Deployment
```bash
# Configure environment
cp .env.example .env
# Edit .env with your settings

# Deploy
npm run deploy
```

## 📦 Deployment Options

### Docker Deployment
- ✅ **Development**: `npm run docker:dev` - Security disabled, hot reload
- ✅ **Production**: `npm run docker:prod` - Security enabled, health checks
- ✅ **Custom**: `npm run docker:build && npm run docker:run`

### Local Scripts
- ✅ **Development**: `npm run start:dev` - Security disabled
- ✅ **Production**: `npm run start:prod` - Security enabled
- ✅ **Deploy**: `npm run deploy` - Full deployment pipeline

### Cloud Deployment
- ✅ **AWS ECS**: ECR deployment guide
- ✅ **Google Cloud Run**: Container deployment
- ✅ **Azure Container Instances**: ACI deployment

📖 **See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions**

## Usage

### CLI Commands

#### Compare OpenAPI Specs (Breaking Changes)
```bash
# Basic comparison
api-contract-validator diff --old old-spec.yaml --new new-spec.yaml

# Filter by severity
api-contract-validator diff --old old-spec.yaml --new new-spec.yaml --severity critical

# JSON output
api-contract-validator diff --old old-spec.yaml --new new-spec.yaml --format json

# Filter by change type
api-contract-validator diff --old old-spec.yaml --new new-spec.yaml --type breaking
```

#### Validate API Response
```bash
api-contract-validator validate \
  --spec openapi.yaml \
  --response response.json \
  --path /users \
  --method GET
```

#### Batch Processing
```bash
api-contract-validator batch \
  --directory ./specs \
  --baseline baseline.yaml \
  --pattern "**/*.yaml"
```

### Severity Levels

| Severity | Description | Examples |
|----------|-------------|----------|
| **Critical** | Endpoint removal, method removal | `Endpoint removed: /users` |
| **Major** | Required property changes, type changes | `Required properties added: [email]` |
| **Minor** | Property removal, response status removal | `Property removed: User.age` |
| **Info** | New endpoints, new properties | `New endpoint added: /products` |

### Change Types

| Type | Description |
|------|-------------|
| **Breaking** | Changes that will break existing clients |
| **Non-breaking** | Additions and improvements that won't break clients |

## GitHub Actions Integration

Add this to your `.github/workflows/api-contract-validation.yml`:

```yaml
name: API Contract Validation

on:
  pull_request:
    paths:
      - '**/*.yaml'
      - '**/*.yml'
      - '**/*.json'

jobs:
  validate-contracts:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    
    - uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - run: npm ci
    - run: npm run build
    
    - name: Check for breaking changes
      run: |
        # Compare with base branch
        git fetch origin ${{ github.base_ref }}
        BASE_BRANCH="origin/${{ github.base_ref }}"
        
        # Find changed specs
        CHANGED_SPECS=$(git diff --name-only $BASE_BRANCH HEAD | grep -E '\.(yaml|yml|json)$')
        
        for spec in $CHANGED_SPECS; do
          git show $BASE_BRANCH:$spec > /tmp/old_spec.yaml
          npx api-contract-validator diff \
            --old /tmp/old_spec.yaml \
            --new "$spec" \
            --severity critical \
            --severity major
        done
```

## Output Examples

### Table Format
```
📊 API Contract Change Analysis

Summary:
  Critical: 1
  Major: 2
  Minor: 1
  Info: 3
  Breaking: 3
  Non-breaking: 4

📋 Changes:
  ❌ Endpoint removed: /users [CRITICAL]
     📍 GET /users
  ❌ Required properties added: GET /users 200 [email] [MAJOR]
     📍 GET /users
  ✅ New endpoint added: /products [INFO]
     📍 POST /products

⚠️  Breaking changes detected!
```

### JSON Format
```json
{
  "breaking": true,
  "summary": {
    "critical": 1,
    "major": 2,
    "minor": 1,
    "info": 3,
    "breaking": 3,
    "nonBreaking": 4
  },
  "changes": [
    {
      "type": "breaking",
      "severity": "critical",
      "message": "Endpoint removed: /users",
      "path": "/users",
      "method": "GET"
    }
  ]
}
```

## Development

### Setup
```bash
git clone <repository>
cd api-contract-validator
npm install
```

### Build
```bash
npm run build
```

### CLI Development
```bash
npm run cli -- --help
```

### Testing
```bash
# Test CLI commands
npm run cli:build
node dist/cli/index.js diff --old test-old.yaml --new test-new.yaml

# Test batch processing
node dist/cli/index.js batch --directory ./test-specs --baseline baseline.yaml
```

## Authentication and Rate Limiting

Authentication and rate limiting are optional and disabled by default.
They are recommended when exposing the MCP server publicly.

### Authentication

When enabled, the server requires an API key to be passed in the `x-api-key` header.

To enable authentication, set the following environment variables:

```
MCP_AUTH_ENABLED=true
MCP_API_KEY=your-secret-api-key
```

### Rate Limiting

When enabled, the server will limit the number of requests per minute.

To enable rate limiting, set the following environment variables:

```
MCP_RATE_LIMIT_ENABLED=true
MCP_RPM=60
```

## Configuration

### Environment Variables
- `NODE_ENV`: Environment (development/production)
- `LOG_LEVEL`: Logging level (error/warn/info/debug)

### CLI Configuration
The CLI can be configured via:
- Command-line arguments
- Environment variables
- Configuration files (planned)

## API Reference

### detectBreakingChanges(oldSpec, newSpec)
Detect breaking changes between two OpenAPI specifications.

**Parameters:**
- `oldSpec` (string): Old OpenAPI spec content
- `newSpec` (string): New OpenAPI spec content

**Returns:**
```typescript
interface ChangeResult {
  breaking: boolean;
  changes: Change[];
  summary: {
    critical: number;
    major: number;
    minor: number;
    info: number;
    breaking: number;
    nonBreaking: number;
  };
}
```

### validateResponse(spec, response, path?, method?)
Validate API response against OpenAPI specification.

**Parameters:**
- `spec` (object): Parsed OpenAPI specification
- `response` (any): Response data to validate
- `path` (string, optional): API path
- `method` (string, optional): HTTP method

**Returns:**
```typescript
interface ValidationResult {
  valid: boolean;
  errors?: string[];
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Changelog

### v0.1.0
- Initial release
- Breaking change detection
- Response validation
- CLI wrapper
- GitHub Actions integration
- Severity levels
- Non-breaking warnings
- Batch processing

## 🚀 Enterprise Features

For professional teams and organizations, we offer an Enterprise edition with advanced capabilities:

### Enhanced Validation
- **Custom Rule Engine**: Define company-specific validation rules
- **Security Scanning**: Detect SQL injection, XSS, and other vulnerabilities  
- **Performance Analysis**: Analyze API complexity and performance bottlenecks
- **Visual Diff**: Side-by-side comparison with migration suggestions

### Team Collaboration
- **Team Workspaces**: Isolated environments for different teams
- **Review Workflows**: Code review processes for API changes
- **Audit Trails**: Complete history of all API changes
- **Shared Rule Libraries**: Reusable validation rules across teams

### CI/CD Integration
- **Multi-Platform Support**: GitHub Actions, GitLab CI, Jenkins, Azure DevOps
- **Automated Validation**: Pre-commit and pre-deployment validation
- **Failure Notifications**: Automatic notifications on validation failures
- **Gatekeeping**: Prevent deployment of invalid specifications

### Governance & Compliance
- **Policy Management**: Support for SOC2, ISO27001, GDPR compliance
- **Exception Handling**: Process for handling policy exceptions
- **Compliance Reporting**: Generate compliance reports
- **Risk Assessment**: Automated risk scoring

### Pricing Tiers
- **Free**: Basic validation, 100 API calls/month
- **Professional ($29/mo)**: Custom rules, security scanning, 10K calls/month
- **Team ($99/mo)**: Team collaboration, CI/CD integration, 100K calls/month  
- **Enterprise ($499/mo)**: SSO, priority support, unlimited calls

📖 **[Enterprise Documentation](docs/ENTERPRISE-FEATURES.md)**

## 🛠️ Production Deployment

### Docker Deployment
```bash
# Production deployment with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
```bash
# Using the deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh v1.0.0 production
```

### Database Setup
```bash
# Initialize PostgreSQL database
psql -d api_validator -f scripts/init.sql
```

## Roadmap

- [x] Custom rule engine
- [x] Security vulnerability scanning
- [x] Performance analysis
- [x] Visual diff generator
- [x] Team collaboration features
- [x] CI/CD integration
- [x] Web dashboard
- [x] Enterprise authentication
- [x] Stripe payment integration
- [ ] Configuration file support
- [ ] More output formats (HTML, PDF)
- [ ] Performance optimizations
- [ ] Integration with more CI/CD platforms
- [ ] API versioning support
- [ ] Mock data generation
- [ ] Contract testing integration
