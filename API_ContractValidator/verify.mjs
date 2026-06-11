import { existsSync } from "fs";

if (!existsSync("./dist/index.js")) {
  console.error("❌ dist/index.js missing — run npm run build");
  process.exit(1);
}
console.log("✅ mcp-api-contract-validator build output present");
