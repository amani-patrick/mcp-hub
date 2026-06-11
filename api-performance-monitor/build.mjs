import esbuild from "esbuild";
import { mkdirSync } from "fs";

mkdirSync("dist", { recursive: true });

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "dist/index.js",
  sourcemap: true,
  packages: "external",
  logLevel: "info",
});

console.log("✅ api-performance-monitor built → dist/index.js");
