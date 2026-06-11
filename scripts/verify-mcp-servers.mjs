#!/usr/bin/env node
/**
 * Shared MCP server smoke test: spawns each built server and calls tools/list via stdio.
 * Servers that require Docker/K8s/AWS are marked as skipped when infra is unavailable.
 */
import { spawn } from "child_process";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const servers = [
  { name: "docker-mcp", entry: "docker-mcp/build/index.js", skipPatterns: ["Docker"] },
  { name: "git-mcp", entry: "git-mcp/build/index.js", skipPatterns: ["git", "Not a git repository"] },
  { name: "kubernetes-mcp", entry: "kubernetes-mcp/build/index.js", skipPatterns: ["Kubernetes", "KUBECONFIG"] },
  { name: "registry-mcp", entry: "registry-mcp/build/index.js", skipPatterns: [] },
  { name: "cloud-containers-mcp", entry: "cloud-containers-mcp/build/index.js", skipPatterns: ["AWS", "credentials"] },
  { name: "cloud-risk-scanner", entry: "cloud-risk-scanner/dist/src/server.js", skipPatterns: [] },
  { name: "incident-timeline-mcp", entry: "incident-timeline-mcp/dist/server.js", skipPatterns: [] },
  { name: "api-performance-monitor", entry: "api-performance-monitor/dist/index.js", skipPatterns: [] },
  { name: "mcp-api-contract-validator", entry: "API_ContractValidator/dist/index.js", skipPatterns: [] },
];

function sendMessage(proc, message) {
  proc.stdin.write(JSON.stringify(message) + "\n");
}

function waitForResponse(proc, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Timeout waiting for MCP response"));
    }, timeoutMs);

    const onData = (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.result !== undefined || msg.error !== undefined) {
            cleanup();
            resolve(msg);
            return;
          }
        } catch {
          // keep buffering
        }
      }
    };

    const onExit = (code, signal) => {
      cleanup();
      reject(new Error(`Process exited (code=${code}, signal=${signal})`));
    };

    const cleanup = () => {
      clearTimeout(timer);
      proc.stdout?.off("data", onData);
      proc.off("exit", onExit);
    };

    proc.stdout.on("data", onData);
    proc.on("exit", onExit);
  });
}

async function testServer(server) {
  const entryPath = join(root, server.entry);
  if (!existsSync(entryPath)) {
    console.error(`❌ ${server.name}: build output missing (${server.entry})`);
    return "fail";
  }

  const proc = spawn("node", [entryPath], {
    cwd: dirname(entryPath),
    stdio: ["pipe", "pipe", "pipe"],
  });

  let stderr = "";
  proc.stderr.on("data", (d) => {
    stderr += d.toString();
  });

  try {
    sendMessage(proc, {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "mcp-hub-verify", version: "1.0.0" },
      },
    });

    await waitForResponse(proc, 5000);

    sendMessage(proc, { jsonrpc: "2.0", method: "notifications/initialized" });
    sendMessage(proc, { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });

    const toolsResponse = await waitForResponse(proc, 5000);
    proc.kill();

    const tools = toolsResponse.result?.tools;
    if (!Array.isArray(tools) || tools.length === 0) {
      console.error(`❌ ${server.name}: tools/list returned no tools`);
      return "fail";
    }

    console.log(`✅ ${server.name}: ${tools.length} tools registered`);
    return "pass";
  } catch (err) {
    proc.kill();
    const combined = `${stderr} ${err.message}`;
    if (server.skipPatterns.some((p) => combined.includes(p))) {
      console.log(`⏭️  ${server.name}: skipped (infrastructure not available in CI)`);
      return "skip";
    }
    console.error(`❌ ${server.name}: ${err.message}`);
    if (stderr) console.error(`   stderr: ${stderr.trim().slice(0, 200)}`);
    return "fail";
  }
}

async function main() {
  let failed = 0;
  let passed = 0;
  let skipped = 0;

  for (const server of servers) {
    const result = await testServer(server);
    if (result === "fail") failed++;
    else if (result === "pass") passed++;
    else skipped++;
  }

  console.log(`\nSummary: ${passed} passed, ${skipped} skipped, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
