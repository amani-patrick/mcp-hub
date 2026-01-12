import { buildTimeline } from "./src/tools/buildTimeline";
import path from "path";
import fs from "fs";

async function runSuite() {
    const suiteDir = path.join(process.cwd(), "samples", "test-suite");
    const files = fs.readdirSync(suiteDir).sort();

    console.log(`Running Test Suite (${files.length} files)...\n`);

    for (const file of files) {
        const filePath = path.join(suiteDir, file);
        console.log(`--- Analyzing ${file} ---`);
        try {
            const timeline = await buildTimeline(filePath);
            console.log(`Title: ${timeline.title}`);
            console.log(`Summary: ${timeline.summary}`);

            // Check for findings
            const findings = timeline.summary?.split("Findings: ")[1];
            if (findings) {
                console.log(`\x1b[31m[ALERT] ${findings}\x1b[0m`); // Red color for alerts
            } else {
                console.log(`\x1b[32m[OK] No incidents detected.\x1b[0m`); // Green for OK
            }
        } catch (error) {
            console.error(`Error analyzing ${file}:`, error);
        }
        console.log(""); // Empty line
    }
}

runSuite();
