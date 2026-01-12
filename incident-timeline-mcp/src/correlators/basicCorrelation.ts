import { LogEvent } from "../models/event";
import { TimelineEvent } from "../models/timeline";

export function correlateEvents(events: LogEvent[]): TimelineEvent[] {
    // Sort by timestamp
    const sortedEvents = [...events].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const timelineEvents: TimelineEvent[] = sortedEvents.map(e => ({
        ...e,
        relatedEvents: [],
        tags: []
    }));

    // Simple correlation: Group by IP address if present in metadata
    const ipGroups: Record<string, string[]> = {};

    timelineEvents.forEach(event => {
        if (event.metadata?.ip) {
            const ip = event.metadata.ip;
            if (!ipGroups[ip]) {
                ipGroups[ip] = [];
            }
            ipGroups[ip].push(event.id);
            event.tags?.push(`IP:${ip}`);
        }

        if (event.level === "ERROR") {
            event.tags?.push("CRITICAL");
        }
    });

    // Link related events
    timelineEvents.forEach(event => {
        if (event.metadata?.ip) {
            const ip = event.metadata.ip;
            event.relatedEvents = ipGroups[ip].filter(id => id !== event.id);
        }
    });

    return timelineEvents;
}
