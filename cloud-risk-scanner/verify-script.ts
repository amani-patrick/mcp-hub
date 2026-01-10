import { scanConfigPath } from "./src/tools/scanPath";
import path from "path";

async function main() {
    const samplesDir = path.join(process.cwd(), "samples");
    console.log(`Scanning ${samplesDir}...`);
    const findings = await scanConfigPath(samplesDir);
    console.log("Findings:", JSON.stringify(findings, null, 2));
}

main().catch(console.error);
