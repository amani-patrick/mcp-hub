import { buildTimeline } from "./src/tools/buildTimeline";
import path from "path";

async function main() {
    const samplePath = path.join(process.cwd(), "samples", "complex-attack.json");
    console.log(`Analyzing ${samplePath}...`);

    try {
        const timeline = await buildTimeline(samplePath);
        console.log("Timeline Title:", timeline.title);
        console.log("Summary:", timeline.summary);

        console.log("\nEvents:");
        timeline.events.forEach(e => {
            console.log(`[${e.timestamp}] ${e.message} (Tags: ${e.tags?.join(", ")})`);
            if (e.relatedEvents?.length) {
                console.log(`  -> Related to: ${e.relatedEvents.join(", ")}`);
            }
        });

    } catch (error) {
        console.error("Error running verification:", error);
    }
}

main();
