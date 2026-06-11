# Git MCP

Safe, tiered Git operations for AI agents. Inspect history, stage changes, and perform destructive actions only with explicit confirmation and path allowlists.

**Maturity:** Beta · **Install:** Source only (see below)

## Prerequisites

- Node.js 18+
- Git 2.30+ on `PATH`

## Build & run

```bash
# From repo root
npm run build -w git-mcp
node git-mcp/build/index.js
```

## MCP configuration

```json
{
  "mcpServers": {
    "git": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-hub/git-mcp/build/index.js"],
      "env": {
        "ALLOWED_REPO_PATHS": "/path/to/your/projects,/path/to/mcp-hub"
      }
    }
  }
}
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ALLOWED_REPO_PATHS` | cwd, parent dir, `samples/` | Comma-separated repository roots agents may access |
| `PROTECTED_BRANCHES` | `main,master,develop` | Branches that cannot be deleted |
| `GIT_MAX_LOG_LINES` | `500` | Maximum commits returned by log tools |
| `GIT_MAX_DIFF_LINES` | `1000` | Maximum diff lines returned |

## Tool tiers

| Tier | Tools |
|------|-------|
| Read-only | `git_status`, `git_log`, `git_diff`, `git_branch_list`, `git_show_commit`, `git_remote_list`, `git_file_history` |
| Guarded | `git_checkout`, `git_stash`, `git_add`, `git_commit`, `git_fetch`, `git_pull` |
| Destructive | `git_reset`, `git_push`, `git_branch_delete`, `git_clean`, `git_stash_drop` (requires `confirm: true`) |

## Example prompts

- "Show git status for `/path/to/mcp-hub`."
- "List the last 10 commits touching `src/server.ts`."
- "Stage `README.md` and commit with message 'Update docs'."
- "Delete branch `feature/old-ui` (with confirmation)."

## Safety notes

- Repository paths must fall under `ALLOWED_REPO_PATHS`
- Protected branches (`main`, `master`, `develop` by default) cannot be deleted
- Force checkout, amend, hard reset, force push, and clean require explicit confirmation
- Git config overrides (`-c`) and shell metacharacters in arguments are blocked
- Diff and log output is truncated to configurable limits

## Verify locally

```bash
cd git-mcp && npm run verify
```
