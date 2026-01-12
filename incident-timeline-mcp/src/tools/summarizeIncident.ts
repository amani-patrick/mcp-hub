import { buildTimeline } from "./buildTimeline";

export async function summarizeIncident(filePath: string): Promise<string> {
    const timeline = await buildTimeline(filePath);

    const criticalEvents = timeline.events.filter(e => e.tags?.includes("CRITICAL"));
    const uniqueIPs = new Set(timeline.events.map(e => e.metadata?.ip).filter(Boolean));

    return `
# Incident Summary: ${timeline.title}

**Duration:** ${timeline.startTime} to ${timeline.endTime}
**Total Events:** ${timeline.events.length}
**Critical Events:** ${criticalEvents.length}
**Unique IPs Involved:** ${uniqueIPs.size}

## Key Findings
${criticalEvents.map(e => `- [${e.timestamp}] ${e.message} (Source: ${e.source})`).join("\n")}

## Recommendations
${criticalEvents.length > 0 ? "- Investigate source IPs for potential brute force or unauthorized access." : "- No critical events detected."}
    `.trim();
}
