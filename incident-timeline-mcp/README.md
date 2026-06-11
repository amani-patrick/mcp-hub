# Incident Timeline MCP

Forensic log analysis for incident response. Ingests logs, correlates events, and builds structured timelines with rule-based detection.

**Maturity:** Stable · **Install:** Source only · **Best starter tool**

## Prerequisites

- Node.js 18+
- No external services required

## Build & run

```bash
npm run build -w incident-timeline-mcp
node incident-timeline-mcp/dist/server.js
```

## MCP configuration

```json
{
  "mcpServers": {
    "incident-timeline": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-hub/incident-timeline-mcp/dist/server.js"]
    }
  }
}
```

## Sample data

Test files live in `samples/test-suite/`:

- `1-normal-json.json` — benign activity
- `4-bruteforce-text.txt` — brute force pattern
- `7-lateral-movement.json` — lateral movement scenario

## Run tests

```bash
npm test -w incident-timeline-mcp
```

## Example prompts

- "Build a timeline from `./incident-timeline-mcp/samples/test-suite/4-bruteforce-text.txt`."
- "Summarize the incident from these correlated events."

## Features

- Stream-based JSON log processing
- Graph correlator for related events
- Rule engine (e.g. brute force detection)

## Verify locally

```bash
cd incident-timeline-mcp && npm run build && npm run verify
```
