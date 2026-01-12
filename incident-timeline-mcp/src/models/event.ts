export interface LogEvent {
    id: string;
    timestamp: string;
    level: "INFO" | "WARN" | "ERROR" | "DEBUG";
    source: string;
    message: string;
    metadata?: Record<string, any>;
}
