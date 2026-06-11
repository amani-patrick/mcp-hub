# Cloud Risk Scanner

Static analysis for cloud infrastructure misconfigurations. Scans Terraform, Kubernetes YAML, and IAM JSON policies offline.

**Maturity:** Stable · **Install:** Source only · **Best starter tool**

## Prerequisites

- Node.js 18+
- No cloud account required

## Build & run

```bash
npm run build -w cloud-risk-scanner
node cloud-risk-scanner/dist/src/server.js
```

## MCP configuration

```json
{
  "mcpServers": {
    "cloud-risk-scanner": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-hub/cloud-risk-scanner/dist/src/server.js"]
    }
  }
}
```

## Sample data

Try scanning bundled samples:

```bash
ls cloud-risk-scanner/samples/
# vulnerable-k8s.yaml, iam samples, etc.
```

## Supported formats

| Extension | Analyzer |
|-----------|----------|
| `.yaml`, `.yml` | Kubernetes security checks |
| `.json` | IAM policy analysis |
| `.tf` | Network / Terraform checks |

## Example prompts

- "Scan `./cloud-risk-scanner/samples` for security risks."
- "Analyze this IAM policy JSON for overly permissive statements."

## Verify locally

```bash
cd cloud-risk-scanner && npm run build && npm run verify
```
