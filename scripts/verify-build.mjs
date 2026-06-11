#!/usr/bin/env node
/**
 * Verifies that all MCP workspace packages have expected build output.
 */
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const packages = [
  { name: "docker-mcp", entry: "docker-mcp/build/index.js" },
  { name: "kubernetes-mcp", entry: "kubernetes-mcp/build/index.js" },
  { name: "registry-mcp", entry: "registry-mcp/build/index.js" },
  { name: "cloud-containers-mcp", entry: "cloud-containers-mcp/build/index.js" },
  { name: "cloud-risk-scanner", entry: "cloud-risk-scanner/dist/src/server.js" },
  { name: "incident-timeline-mcp", entry: "incident-timeline-mcp/dist/server.js" },
  { name: "api-performance-monitor", entry: "api-performance-monitor/dist/index.js" },
  { name: "mcp-api-contract-validator", entry: "API_ContractValidator/dist/index.js" },
];

let failed = 0;

for (const pkg of packages) {
  const path = join(root, pkg.entry);
  if (existsSync(path)) {
    console.log(`✅ ${pkg.name}: ${pkg.entry}`);
  } else {
    console.error(`❌ ${pkg.name}: missing ${pkg.entry} — run npm run build`);
    failed++;
  }
}

process.exit(failed > 0 ? 1 : 0);
