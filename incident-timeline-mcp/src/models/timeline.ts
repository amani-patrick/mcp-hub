import { LogEvent } from "./event";

export interface TimelineEvent extends LogEvent {
    relatedEvents?: string[]; // IDs of related events
    tags?: string[];
}

export interface Timeline {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    events: TimelineEvent[];
    summary?: string;
}
