import 'dotenv/config';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { startHttpServer } from "./http/server.js";

// Start server with stdio transport
async function main() {
  if (process.env.DEMO_HTTP === "true") {
    console.log("Starting demo HTTP server...");
    startHttpServer();
  } else {
    console.log("Starting MCP server...");
    const { createServer } = await import("./server.js");
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
}

main().catch(console.error);