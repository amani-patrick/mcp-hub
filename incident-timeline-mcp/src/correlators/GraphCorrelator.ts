import { LogEvent } from "../models/event";
import { TimelineEvent } from "../models/timeline";
import { Correlator } from "../core/types";

const CORRELATION_KEYS = ["ip", "userId", "deviceId", "sessionId"] as const;

export class GraphCorrelator implements Correlator {
    async correlate(events: LogEvent[]): Promise<TimelineEvent[]> {
        const adj = new Map<string, Set<string>>();

        const addEdge = (u: string, v: string) => {
            if (!adj.has(u)) adj.set(u, new Set());
            if (!adj.has(v)) adj.set(v, new Set());
            adj.get(u)!.add(v);
            adj.get(v)!.add(u);
        };

        for (const event of events) {
            const eventNode = `Event:${event.id}`;
            // Ensure every event participates in the graph (even without metadata)
            if (!adj.has(eventNode)) adj.set(eventNode, new Set());

            if (event.metadata) {
                for (const [key, value] of Object.entries(event.metadata)) {
                    if (CORRELATION_KEYS.includes(key as typeof CORRELATION_KEYS[number])) {
                        const entityNode = `${key}:${value}`;
                        addEdge(eventNode, entityNode);
                    }
                }
            }
        }

        const visited = new Set<string>();
        const components: string[][] = [];

        for (const node of adj.keys()) {
            if (node.startsWith("Event:") && !visited.has(node)) {
                const component: string[] = [];
                const queue = [node];
                visited.add(node);

                while (queue.length > 0) {
                    const curr = queue.shift()!;
                    if (curr.startsWith("Event:")) {
                        component.push(curr.replace("Event:", ""));
                    }

                    for (const neighbor of adj.get(curr) || []) {
                        if (!visited.has(neighbor)) {
                            visited.add(neighbor);
                            queue.push(neighbor);
                        }
                    }
                }
                components.push(component);
            }
        }

        const eventMap = new Map(events.map(e => [e.id, e]));
        const timelineEvents: TimelineEvent[] = [];

        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            for (const eventId of component) {
                const originalEvent = eventMap.get(eventId);
                if (originalEvent) {
                    timelineEvents.push({
                        ...originalEvent,
                        relatedEvents: component.filter(id => id !== eventId),
                        tags: [`Cluster:${i}`],
                    });
                }
            }
        }

        return timelineEvents.sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
    }
}
