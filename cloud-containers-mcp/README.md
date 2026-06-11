# Cloud Containers MCP

Abstracted management for serverless container platforms (AWS ECS). Deploy, scale, and observe services with operational limits.

**Maturity:** Beta · **Install:** Source only

## Prerequisites

- Node.js 18+
- AWS credentials configured (`AWS_PROFILE` or default chain)
- ECS permissions in target account/region

## Build & run

```bash
npm run build -w cloud-containers-mcp
node cloud-containers-mcp/build/index.js
```

## MCP configuration

```json
{
  "mcpServers": {
    "cloud-containers": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-hub/cloud-containers-mcp/build/index.js"],
      "env": {
        "AWS_REGION": "us-east-1",
        "AWS_PROFILE": "default"
      }
    }
  }
}
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `AWS_REGION` | AWS region for ECS operations |
| `AWS_PROFILE` | Named AWS profile (optional) |

## Example prompts

- "List ECS services in the default cluster."
- "Scale service `payment-api` to 5 tasks."

## Safety notes

- Service deletion and scaling include guardrails (see `src/config.ts`)
- CloudWatch log access is scoped to configured services

## Verify locally

```bash
cd cloud-containers-mcp && npm run build && npm run verify
```

Skipped in CI when AWS credentials are unavailable.
