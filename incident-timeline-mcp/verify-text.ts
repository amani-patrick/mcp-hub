import { buildTimeline } from "./src/tools/buildTimeline";
import path from "path";

async function main() {
    const samplePath = path.join(process.cwd(), "samples", "syslog.txt");
    console.log(`Analyzing ${samplePath}...`);

    try {
        const timeline = await buildTimeline(samplePath);
        console.log("Timeline Title:", timeline.title);
        console.log("Summary:", timeline.summary);

        console.log("\nEvents:");
        timeline.events.forEach(e => {
            console.log(`[${e.timestamp}] ${e.level} ${e.message} (IP: ${e.metadata?.ip})`);
        });

    } catch (error) {
        console.error("Error running verification:", error);
    }
}

main();
