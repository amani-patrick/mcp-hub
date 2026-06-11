import { existsSync } from "fs";

if (!existsSync("./dist/src/server.js")) {
  console.error("❌ dist/src/server.js missing — run npm run build");
  process.exit(1);
}
console.log("✅ cloud-risk-scanner build output present");
