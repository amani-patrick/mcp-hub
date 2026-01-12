import { loadLogsFromFile } from "../utils/fileLoader";
import { LogEvent } from "../models/event";

export function loadLogs(filePath: string): LogEvent[] {
    return loadLogsFromFile(filePath);
}
