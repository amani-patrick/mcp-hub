# Docker MCP

Safe, local Docker management for AI agents. Build images, run containers, and inspect resources with path allowlists and run profiles.

**Maturity:** Beta · **Install:** Source only (see below)

## Prerequisites

- Node.js 18+
- Docker daemon running

## Build & run

```bash
# From repo root
npm run build -w docker-mcp
node docker-mcp/build/index.js
```

## MCP configuration

```json
{
  "mcpServers": {
    "docker": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-hub/docker-mcp/build/index.js"],
      "env": {
        "ALLOWED_BUILD_PATHS": "/path/to/your/projects"
      }
    }
  }
}
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ALLOWED_BUILD_PATHS` | `./services` under cwd | Comma-separated paths allowed for `build_image_from_path` |

## Tool tiers

| Tier | Tools |
|------|-------|
| Read-only | `list_containers`, `list_images`, `inspect_container` |
| Guarded | `build_image_from_path`, `run_container_from_image` |
| Destructive | `remove_container`, `remove_image` (requires `confirm: true`) |

## Example prompts

- "List all running Docker containers."
- "Build an image tagged `my-app:dev` from `/path/to/project`."

## Safety notes

- Build paths must match `ALLOWED_BUILD_PATHS`
- Container runs use predefined profiles (`web-service`, `db-service`, `minimal`)
- Destructive actions require explicit confirmation

## Verify locally

```bash
cd docker-mcp && npm run build && npm run verify
```
