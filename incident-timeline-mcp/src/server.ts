import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { loadLogs } from "./tools/loadLogs";
import { buildTimeline } from "./tools/buildTimeline";
import { summarizeIncident } from "./tools/summarizeIncident";

const server = new Server(
    {
        name: "incident-timeline-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "load_logs",
                description: "Load raw logs from a file",
                inputSchema: {
                    type: "object",
                    properties: {
                        filePath: { type: "string", description: "Path to the log file" }
                    },
                    required: ["filePath"]
                }
            },
            {
                name: "build_timeline",
                description: "Build a correlated timeline from logs",
                inputSchema: {
                    type: "object",
                    properties: {
                        filePath: { type: "string", description: "Path to the log file" }
                    },
                    required: ["filePath"]
                }
            },
            {
                name: "summarize_incident",
                description: "Generate a summary report of the incident",
                inputSchema: {
                    type: "object",
                    properties: {
                        filePath: { type: "string", description: "Path to the log file" }
                    },
                    required: ["filePath"]
                }
            }
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const filePath = (args as { filePath: string }).filePath;

    if (!filePath) {
        throw new Error("filePath is required");
    }

    switch (name) {
        case "load_logs":
            return {
                content: [{ type: "text", text: JSON.stringify(loadLogs(filePath), null, 2) }]
            };
        case "build_timeline":
            return {
                content: [{ type: "text", text: JSON.stringify(await buildTimeline(filePath), null, 2) }]
            };
        case "summarize_incident":
            return {
                content: [{ type: "text", text: await summarizeIncident(filePath) }]
            };
        default:
            throw new Error(`Tool ${name} not found`);
    }
});

async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Incident Timeline MCP Server running on stdio");
}

run().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
