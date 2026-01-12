import fs from "fs";
import readline from "readline";
import { LogEvent } from "../models/event";
import { LogProcessor } from "../core/types";
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/StreamArray";
import { chain } from "stream-chain";
import { v4 as uuidv4 } from 'uuid';

export class LogStreamProcessor implements LogProcessor {
    async *process(filePath: string): AsyncGenerator<LogEvent, void, unknown> {
        if (filePath.endsWith(".json")) {
            const pipeline = chain([
                fs.createReadStream(filePath),
                parser(),
                streamArray()
            ]);

            for await (const { value } of pipeline) {
                yield value as LogEvent;
            }
        } else {
            // Text file processing
            const fileStream = fs.createReadStream(filePath);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });

            for await (const line of rl) {
                if (!line.trim()) continue;
                yield this.parseLine(line);
            }
        }
    }

    private parseLine(line: string): LogEvent {
        // Match ISO8601 or Syslog-style timestamps
        const timestampRegex = /(\d{4}-\d{2}-\d{2}T?\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)|([A-Z][a-z]{2} \d{1,2} \d{2}:\d{2}:\d{2})/;
        const levelRegex = /(INFO|WARN|ERROR|DEBUG|CRITICAL|FATAL)/i;

        const timestampMatch = line.match(timestampRegex);
        const levelMatch = line.match(levelRegex);

        const timestamp = timestampMatch ? timestampMatch[0] : new Date().toISOString();
        const level = levelMatch ? levelMatch[0].toUpperCase() : "INFO";

        // Clean message
        let message = line;
        if (timestampMatch) message = message.replace(timestampMatch[0], "").trim();
        if (levelMatch) message = message.replace(levelMatch[0], "").trim();
        // Remove extra separators like " - " or ": " at the start
        message = message.replace(/^[-:]+\s+/, "");

        // Extract IP if present
        const ipMatch = line.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
        const metadata: any = {};
        if (ipMatch) metadata.ip = ipMatch[0];

        return {
            id: uuidv4(),
            timestamp,
            level: level as any,
            source: "text-log",
            message,
            metadata
        };
    }
}
