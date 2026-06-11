import { existsSync } from "fs";

if (!existsSync("./dist/server.js")) {
  console.error("❌ dist/server.js missing — run npm run build");
  process.exit(1);
}
console.log("✅ incident-timeline-mcp build output present");
