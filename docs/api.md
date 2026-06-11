# API Reference

This document describes common patterns across MCP Hub tools. Each tool exposes MCP **tools** (callable functions) over stdio transport.

## Transport

All servers in this repo use **stdio** (standard input/output) via the official MCP SDK:

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
```

Clients spawn the server as a child process and exchange JSON-RPC messages.

## Tool tiers

Most infrastructure tools classify operations by risk:

| Tier | Description | Examples |
|------|-------------|----------|
| **Read-only** | Safe inspection, no mutations | `list_containers`, `get_pod_status` |
| **Guarded** | Mutations with allowlists / profiles | `build_image_from_path`, `scale_deployment` |
| **Destructive** | Requires explicit `confirm: true` | `delete_pod`, `delete_tag` |

## Common request shape

MCP clients call tools with a name and JSON arguments:

```json
{
  "name": "delete_pod",
  "arguments": {
    "namespace": "default",
    "podName": "my-pod",
    "confirm": true
  }
}
```

## Common response shape

Successful tool calls return MCP content blocks:

```json
{
  "content": [
    { "type": "text", "text": "Deployment scaled to 3 replicas." }
  ]
}
```

Errors return `isError: true` with a text message (pattern used in docker-mcp, kubernetes-mcp, etc.).

## Environment variables

| Variable | Tools | Purpose |
|----------|-------|---------|
| `KUBECONFIG` | kubernetes-mcp | Path to kubeconfig file |
| `ALLOWED_BUILD_PATHS` | docker-mcp | Comma-separated paths allowed for image builds |
| `REGISTRY_URL` | registry-mcp | Registry base URL |
| `REGISTRY_USERNAME` / `REGISTRY_PASSWORD` | registry-mcp | Auth credentials |
| `AWS_REGION` / `AWS_PROFILE` | cloud-containers-mcp | AWS configuration |
| `MCP_AUTH_ENABLED` | API Contract Validator, API Performance Monitor | Enable auth (default: off) |
| `MCP_RATE_LIMIT_ENABLED` | API Contract Validator, API Performance Monitor | Enable rate limiting (default: off) |

See each tool's README for the full list.

## Tool index

| Tool | Entry point | Key tools |
|------|-------------|-----------|
| docker-mcp | `build/index.js` | `list_containers`, `build_image_from_path` |
| kubernetes-mcp | `build/index.js` | `list_namespaces`, `scale_deployment`, `delete_resource` |
| registry-mcp | `build/index.js` | `list_repositories`, `delete_tag` |
| cloud-containers-mcp | `build/index.js` | `list_services`, `scale_service` |
| cloud-risk-scanner | `dist/src/server.js` | `scan_path`, `analyze_iam` |
| incident-timeline-mcp | `dist/server.js` | `build_timeline`, `summarize_incident` |
| api-performance-monitor | `dist/index.js` | `monitor_performance`, `get_analytics` |
| mcp-api-contract-validator | `dist/index.js` | `validate_response`, `detect_breaking_changes` |

## Listing tools programmatically

After building, run the shared verifier:

```bash
npm run verify
```

This sends `tools/list` to each server and reports how many tools are registered.

## HTTP endpoints (select tools)

Some tools also expose HTTP for dashboards or CI:

- **API Performance Monitor** — Express dashboard + WebSocket streaming (see tool README)
- **API Contract Validator** — Optional HTTP server for hosted deployments (see `DEPLOYMENT.md`)

MCP stdio remains the primary interface for AI clients.

## Further reading

- [MCP Specification](https://modelcontextprotocol.io)
- [Tool Development Guide](./tool-development.md)
- [Best Practices](./best-practices.md)
