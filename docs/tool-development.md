# Tool Development Guide

This guide explains how to add a new MCP tool to MCP Hub or extend an existing one.

## Standard tool layout

```
my-tool-mcp/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts          # MCP server entry
│   ├── config.ts         # Allowlists, env-based config
│   └── tools/
│       ├── readOnly.ts
│       ├── guarded.ts
│       └── destructive.ts
└── verify.mjs            # Optional local smoke tests
```

## Step-by-step: add a new tool

### 1. Create the package

```bash
mkdir my-tool-mcp
cd my-tool-mcp
npm init -y
```

Add dependencies:

```bash
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node
```

### 2. Implement the server

Follow the pattern in `docker-mcp/src/index.ts`:

- Create a `Server` with `name` and `version`
- Register `ListToolsRequestSchema` → return tool definitions
- Register `CallToolRequestSchema` → dispatch to handlers
- Connect `StdioServerTransport`

### 3. Define tools with JSON Schema

```typescript
export const readOnlyTools: Tool[] = [
  {
    name: "hello_world",
    description: "Returns a greeting",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Name to greet" },
      },
      required: ["name"],
    },
  },
];
```

### 4. Add safety guardrails

- **Allowlists** for paths, namespaces, or resource types
- **`confirm: true`** for destructive operations
- **Blocked resource types** for secrets, RBAC, etc.
- Validate inputs with **Zod** before acting

### 5. Register in the monorepo

Add the directory to root `package.json` workspaces:

```json
"workspaces": ["...", "my-tool-mcp"]
```

Add `"bin"` and scripts to your tool's `package.json`:

```json
{
  "name": "my-tool-mcp",
  "main": "build/index.js",
  "bin": { "my-tool-mcp": "./build/index.js" },
  "scripts": {
    "build": "tsc",
    "start": "node build/index.js"
  }
}
```

### 6. Register in the web hub

Add an entry to `mcp-hub/src/data/tools.tsx`:

```typescript
{
  id: "my-tool-mcp",
  title: "My Tool MCP",
  maturity: "beta",
  repoPath: "my-tool-mcp",
  entryPoint: "build/index.js",
  // ... description, features, etc.
}
```

### 7. Document and test

- Write a `README.md` in the tool directory
- Add entry to `scripts/verify-build.mjs` and `scripts/verify-mcp-servers.mjs`
- Add unit tests where logic is non-trivial

### 8. Verify locally

```bash
npm run build -w my-tool-mcp
npm run verify
```

## MCP SDK version note

Tools in this repo use `@modelcontextprotocol/sdk` ^0.6.0 to ^1.0.x. When adding a tool, prefer **^1.0.1** to match docker-mcp/kubernetes-mcp unless you have a reason not to.

## Code review checklist

- [ ] Destructive tools require explicit confirmation
- [ ] Sensitive resources are blocked or namespace-scoped
- [ ] Errors return helpful messages (no stack traces to client)
- [ ] README includes MCP config snippet with local path
- [ ] Build output path matches verify scripts
- [ ] No secrets committed; use `.env.example`

## Examples to copy from

| Pattern | Reference |
|---------|-----------|
| Tiered tools + allowlists | `docker-mcp`, `kubernetes-mcp` |
| Tests + sample data | `incident-timeline-mcp` |
| Docker + CI + auth | `API_ContractValidator` |
| Offline / no infra | `cloud-risk-scanner` |

## Getting help

- Open a [Discussion](https://github.com/amani-patrick/mcp-hub/discussions)
- See [Good First Issues](../GOOD_FIRST_ISSUES.md)
