import { LogEvent } from "../models/event";
import { TimelineEvent } from "../models/timeline";
import { Correlator } from "../core/types";

export class GraphCorrelator implements Correlator {
    async correlate(events: LogEvent[]): Promise<TimelineEvent[]> {
        // Adjacency list: Node -> Set of connected Nodes
        // Nodes can be Event IDs or Entity IDs (e.g., "IP:1.2.3.4", "User:alice")
        const adj = new Map<string, Set<string>>();

        const addEdge = (u: string, v: string) => {
            if (!adj.has(u)) adj.set(u, new Set());
            if (!adj.has(v)) adj.set(v, new Set());
            adj.get(u)!.add(v);
            adj.get(v)!.add(u);
        };

        // Build the graph
        for (const event of events) {
            const eventNode = `Event:${event.id}`;

            // Link Event to its Entities
            if (event.metadata) {
                for (const [key, value] of Object.entries(event.metadata)) {
                    // Only correlate on specific keys to avoid noise
                    if (["ip", "userId", "deviceId", "sessionId"].includes(key)) {
                        const entityNode = `${key}:${value}`;
                        addEdge(eventNode, entityNode);
                    }
                }
            }
        }

        // Find connected components (BFS/DFS)
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

                    const neighbors = adj.get(curr) || new Set();
                    for (const neighbor of neighbors) {
                        if (!visited.has(neighbor)) {
                            visited.add(neighbor);
                            queue.push(neighbor);
                        }
                    }
                }
                components.push(component);
            }
        }

        // Map events to TimelineEvents with relationships
        const eventMap = new Map(events.map(e => [e.id, e]));
        const timelineEvents: TimelineEvent[] = [];

        for (const component of components) {
            // All events in this component are related
            for (const eventId of component) {
                const originalEvent = eventMap.get(eventId);
                if (originalEvent) {
                    timelineEvents.push({
                        ...originalEvent,
                        relatedEvents: component.filter(id => id !== eventId),
                        tags: [`Cluster:${components.indexOf(component)}`]
                    });
                }
            }
        }

        // Sort by timestamp
        return timelineEvents.sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
    }
}
