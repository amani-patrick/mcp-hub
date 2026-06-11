# Kubernetes MCP

Production-oriented interface for bounded Kubernetes operations — inspect clusters, scale deployments, and manage pods with namespace guards.

**Maturity:** Beta · **Install:** Source only

## Prerequisites

- Node.js 18+
- Valid kubeconfig (`KUBECONFIG` env var or `~/.kube/config`)
- Cluster access to allowed namespaces

## Build & run

```bash
npm run build -w kubernetes-mcp
node kubernetes-mcp/build/index.js
```

## MCP configuration

```json
{
  "mcpServers": {
    "kubernetes": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-hub/kubernetes-mcp/build/index.js"],
      "env": {
        "KUBECONFIG": "/path/to/kubeconfig"
      }
    }
  }
}
```

## Allowed namespaces

Default allowlist (edit `src/config.ts` or contribute env-based config):

- `default`, `dev`, `staging`

## Blocked resources

Secrets, Roles, RoleBindings, ClusterRoles, ClusterRoleBindings, and ServiceAccounts cannot be deleted via `delete_resource`.

## Tool tiers

| Tier | Tools |
|------|-------|
| Discovery | `list_namespaces`, `list_deployments` |
| Inspection | `get_pod_status`, `get_pod_logs` |
| Safe ops | `scale_deployment`, `restart_deployment`, `delete_pod` |
| Advanced | `delete_resource` (blocked types enforced) |

## Example prompts

- "List pods in the default namespace."
- "Scale deployment `my-api` to 3 replicas in dev."

## Verify locally

```bash
cd kubernetes-mcp && npm run build && npm run verify
```

Requires a cluster for full integration; safety guards can be tested without one.
