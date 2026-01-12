import { LogStreamProcessor } from "../utils/LogStreamProcessor";
import { GraphCorrelator } from "../correlators/GraphCorrelator";
import { RuleEngine, BruteForceRule } from "../engine/RuleEngine";
import { Timeline } from "../models/timeline";
import { LogEvent } from "../models/event";
import { v4 as uuidv4 } from 'uuid';

export async function buildTimeline(filePath: string): Promise<Timeline> {
    // 1. Load Events via Stream
    const processor = new LogStreamProcessor();
    const events: LogEvent[] = [];

    for await (const event of processor.process(filePath)) {
        events.push(event);
    }

    if (events.length === 0) {
        return {
            id: uuidv4(),
            title: "Empty Timeline",
            startTime: "",
            endTime: "",
            events: []
        };
    }

    // 2. Correlate Events via Graph
    const correlator = new GraphCorrelator();
    const correlatedEvents = await correlator.correlate(events);

    // 3. Apply Rules
    const ruleEngine = new RuleEngine();
    ruleEngine.registerRule(BruteForceRule);
    const findings = ruleEngine.evaluate(events);

    const startTime = correlatedEvents[0].timestamp;
    const endTime = correlatedEvents[correlatedEvents.length - 1].timestamp;

    return {
        id: uuidv4(),
        title: `Incident Timeline - ${filePath}`,
        startTime,
        endTime,
        events: correlatedEvents,
        summary: `Analyzed ${events.length} events. Findings: ${findings.join("; ")}`
    };
}
