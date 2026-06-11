# MCP Hub

<div align="center">

![MCP Hub](https://img.shields.io/badge/MCP-Hub-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D18-blue?style=for-the-badge)

**A community collection of safety-focused MCP (Model Context Protocol) tools and documentation**

[⭐ Star this repo](https://github.com/amani-patrick/mcp-hub) • [🐛 Report Issues](https://github.com/amani-patrick/mcp-hub/issues) • [📖 Getting Started](./docs/getting-started.md) • [🌐 Live Docs](https://amani-patrick.github.io/mcp-hub/)

</div>

## About

MCP Hub is an open-source monorepo of MCP servers for DevOps, security, observability, and incident response — plus a documentation web app to explore and configure them.

All tools emphasize **safe, bounded operations** for AI agents (allowlists, confirmations, blocked resource types).

## Quick start

```bash
git clone https://github.com/amani-patrick/mcp-hub.git
cd mcp-hub
npm install
npm run build
```

**Recommended first tools** (no Docker/cloud required):

- `cloud-risk-scanner` — scan sample IaC files offline
- `incident-timeline-mcp` — build timelines from sample logs

See the full guide: **[docs/getting-started.md](./docs/getting-started.md)**

### Run the documentation site

```bash
npm run dev -w @amani-patrick/mcp-hub
# → http://localhost:8080
```

## Tools

| Tool | Maturity | Description |
|------|----------|-------------|
| [Kubernetes MCP](./kubernetes-mcp/README.md) | Beta | Bounded K8s operations |
| [Registry MCP](./registry-mcp/README.md) | Beta | Container registry governance |
| [Cloud Containers MCP](./cloud-containers-mcp/README.md) | Beta | AWS ECS management |
| [Docker MCP](./docker-mcp/README.md) | Beta | Safe local Docker ops |
| [API Contract Validator](./API_ContractValidator/README.md) | Stable | OpenAPI validation & breaking changes |
| [API Performance Monitor](./api-performance-monitor/README.md) | Stable | SLA monitoring & analytics |
| [Cloud Risk Scanner](./cloud-risk-scanner/README.md) | Stable | IaC misconfiguration scanning |
| [Incident Timeline MCP](./incident-timeline-mcp/README.md) | Stable | Forensic log timeline builder |

> **Install note:** Tools are installed **from source** today. Use local `node` paths in your MCP client config — see [Getting Started](./docs/getting-started.md). npm publishing is planned.

## Documentation

- [Getting Started](./docs/getting-started.md)
- [Architecture](./docs/architecture.md)
- [Tool Development](./docs/tool-development.md)
- [Best Practices](./docs/best-practices.md)
- [API Reference](./docs/api.md)
- [Contributing](./CONTRIBUTING.md)
- [Good First Issues](./GOOD_FIRST_ISSUES.md)

## Repository scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build all workspaces |
| `npm test` | Run tests in packages that have them |
| `npm run verify:build` | Check build artifacts exist |
| `npm run verify` | Smoke-test `tools/list` on each MCP server |
| `npm run dev -w @amani-patrick/mcp-hub` | Start docs site locally |

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

Starter tasks: [GOOD_FIRST_ISSUES.md](./GOOD_FIRST_ISSUES.md)

## License

MIT — see [LICENSE](./LICENSE)

---

<div align="center">

**Made with ❤️ by [Amani Patrick](https://github.com/amani-patrick) and contributors**

</div>
