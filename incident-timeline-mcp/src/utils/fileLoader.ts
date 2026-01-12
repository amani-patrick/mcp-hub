import fs from "fs";
import { LogEvent } from "../models/event";

export function loadLogsFromFile(filePath: string): LogEvent[] {
    try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(raw);

        if (Array.isArray(data)) {
            return data as LogEvent[];
        }
        return [];
    } catch (error) {
        console.error(`Error loading logs from ${filePath}:`, error);
        return [];
    }
}
