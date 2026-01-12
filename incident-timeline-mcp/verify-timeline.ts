import { summarizeIncident } from "./src/tools/summarizeIncident";
import path from "path";

const samplePath = path.join(process.cwd(), "samples", "sample-auth-logs.json");
console.log(`Analyzing ${samplePath}...`);

try {
    const summary = summarizeIncident(samplePath);
    console.log(summary);
} catch (error) {
    console.error("Error running verification:", error);
}
