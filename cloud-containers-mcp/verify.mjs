import { existsSync } from "fs";

if (!existsSync("./build/index.js")) {
  console.error("❌ build/index.js missing — run npm run build");
  process.exit(1);
}
console.log("✅ cloud-containers-mcp build output present");
