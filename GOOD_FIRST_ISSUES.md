# Good First Issues

These are starter tasks for new contributors. Comment on an issue to claim it, or open a PR referencing the task number.

## Documentation

- [ ] **#1** Add environment variable tables to each tool README
- [ ] **#2** Add a "Troubleshooting" section to `docs/getting-started.md`
- [ ] **#3** Record a 2-minute GIF of connecting `cloud-risk-scanner` to Cursor

## Testing

- [ ] **#4** Add Jest smoke tests for `registry-mcp` guarded tool handlers
- [ ] **#5** Add Jest smoke tests for `docker-mcp` path allowlist guards
- [ ] **#6** Extend `scripts/verify-mcp-servers.mjs` with tool name assertions

## Web Hub

- [ ] **#7** Add search/filter to the tools sidebar
- [ ] **#8** Add dark mode toggle to DocsLayout
- [ ] **#9** Link each tool page to its GitHub source directory

## Tools

- [ ] **#10** Add `scale_deployment` min/max replica bounds in `kubernetes-mcp`
- [ ] **#11** Load `ALLOWED_BUILD_PATHS` from env in `docker-mcp`
- [ ] **#12** Add Azure ECS adapter stub in `cloud-containers-mcp`

## Labels to use on GitHub

When creating issues from this list, apply:

- `good first issue` — safe for newcomers
- `help wanted` — maintainers want community help
- `documentation` / `testing` / `enhancement` — area tag

Maintainers: copy items from this file into GitHub Issues and replace `#N` with real issue numbers.
