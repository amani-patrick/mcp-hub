# Getting Started with MCP Hub

Welcome to MCP Hub. This guide walks you through running your first MCP server from source and connecting it to an AI client (Cursor, Claude Desktop, Windsurf, etc.).

## Prerequisites

- **Node.js 18+** and npm
- **Git**
- An MCP-compatible client (Cursor recommended)

Optional, depending on the tool:

| Tool | Extra requirement |
|------|-------------------|
| docker-mcp | Docker daemon running |
| kubernetes-mcp | Valid `KUBECONFIG` |
| registry-mcp | Registry credentials |
| cloud-containers-mcp | AWS credentials |
| cloud-risk-scanner | None (works offline) |
| incident-timeline-mcp | None (sample logs included) |

## 1. Clone and install

```bash
git clone https://github.com/amani-patrick/mcp-hub.git
cd mcp-hub
npm install
npm run build
```

This installs all workspaces and builds every MCP server plus the documentation site.

## 2. Pick a starter tool

**Recommended for first-time setup:** `cloud-risk-scanner` or `incident-timeline-mcp` — no cloud account or Docker required.

```bash
# Optional: build a single tool
npm run build -w cloud-risk-scanner
```

## 3. Configure your MCP client

Replace `/path/to/mcp-hub` with the absolute path where you cloned the repo.

### Cursor (`~/.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "cloud-risk-scanner": {
      "command": "node",
      "args": ["/path/to/mcp-hub/cloud-risk-scanner/dist/src/server.js"]
    }
  }
}
```

### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "cloud-risk-scanner": {
      "command": "node",
      "args": ["/path/to/mcp-hub/cloud-risk-scanner/dist/src/server.js"]
    }
  }
}
```

### Docker MCP example (requires Docker running)

```json
{
  "mcpServers": {
    "docker": {
      "command": "node",
      "args": ["/path/to/mcp-hub/docker-mcp/build/index.js"],
      "env": {
        "ALLOWED_BUILD_PATHS": "/path/to/your/projects"
      }
    }
  }
}
```

> **Note:** Packages are installed from source in this repo. They are not yet published to npm under `@modelcontextprotocol/*`. Always use the local `node` path shown above until publish status changes — see [Publishing status](#publishing-status).

## 4. Verify the server starts

```bash
# From repo root — checks all build outputs exist
npm run verify:build

# Smoke-test tools/list on each server (skips infra-dependent tools in CI)
npm run verify
```

Per-tool verification (when infrastructure is available):

```bash
cd kubernetes-mcp && npm run build && node verify.mjs
```

## 5. Try a prompt

After restarting your MCP client, try:

- **cloud-risk-scanner:** "Scan `./cloud-risk-scanner/samples` for security misconfigurations."
- **incident-timeline-mcp:** "Build an incident timeline from `./incident-timeline-mcp/samples/test-suite/4-bruteforce-text.txt`."
- **docker-mcp:** "List all running Docker containers."

## 6. Run the documentation site locally

```bash
npm run dev -w @amani-patrick/mcp-hub
```

Open [http://localhost:8080](http://localhost:8080). The live site is deployed to GitHub Pages when changes land on `main`.

## Publishing status

| Status | Meaning |
|--------|---------|
| **Source install (today)** | Clone repo, `npm run build`, point MCP client at local `node` entry |
| **npm publish (planned)** | Packages will be published under consistent names; watch releases |

Until npm packages are published, ignore any outdated `npx @modelcontextprotocol/server-*` references — the web hub and this doc use local paths.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot find module .../build/index.js` | Run `npm run build` from repo root |
| Docker MCP exits immediately | Start Docker Desktop / daemon |
| Kubernetes MCP tools fail | Set `KUBECONFIG` and ensure namespace is in allowlist |
| MCP client doesn't see tools | Restart client after editing config; check absolute paths |
| `npm ci` fails | Use Node 18+; delete `node_modules` and retry |

## Next steps

- [Tool Development Guide](./tool-development.md) — build your own MCP tool in this repo
- [Architecture](./architecture.md) — how tools are structured
- [Contributing](../CONTRIBUTING.md) — submit your first PR
- [Good First Issues](../GOOD_FIRST_ISSUES.md) — starter tasks
