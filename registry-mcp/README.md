# Registry MCP

Secure governance for container registries. Inspect images, verify policy compliance, and manage tags with allowlists and confirmation gates.

**Maturity:** Beta · **Install:** Source only

## Prerequisites

- Node.js 18+
- Access to a V2-compliant registry (Docker Hub, GHCR, etc.)

## Build & run

```bash
npm run build -w registry-mcp
node registry-mcp/build/index.js
```

## MCP configuration

```json
{
  "mcpServers": {
    "registry": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-hub/registry-mcp/build/index.js"],
      "env": {
        "REGISTRY_URL": "https://index.docker.io",
        "REGISTRY_USERNAME": "your-username",
        "REGISTRY_PASSWORD": "your-password"
      }
    }
  }
}
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `REGISTRY_URL` | Registry base URL |
| `REGISTRY_USERNAME` | Registry username |
| `REGISTRY_PASSWORD` | Registry password or token |

## Safety notes

- Tag deletion requires `confirm: true`
- Namespace allowlist enforced for deletions
- Blocked tags (e.g. `latest`) cannot be deleted

## Example prompts

- "List tags for repository `nginx`."
- "Check if image `alpine:3.19` is compliant with our policy."

## Verify locally

```bash
cd registry-mcp && npm run build && npm run verify
```
