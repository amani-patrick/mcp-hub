import { LogEvent } from "../models/event";
import { TimelineEvent } from "../models/timeline";

export interface LogProcessor {
    process(filePath: string): AsyncGenerator<LogEvent, void, unknown>;
}

export interface Correlator {
    correlate(events: LogEvent[]): Promise<TimelineEvent[]>;
}

export interface Rule {
    id: string;
    name: string;
    description: string;
    evaluate(events: LogEvent[]): boolean;
}
