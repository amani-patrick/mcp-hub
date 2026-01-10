import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { scanConfigPath } from "./tools/scanPath";
import { generateReport } from "./utils/reporter";

const server = new Server(
    {
        name: "cloud-misconfig-risk-server",
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
                name: "scan_config_path",
                description: "Scan a directory for cloud misconfigurations",
                inputSchema: {
                    type: "object",
                    properties: {
                        path: {
                            type: "string",
                            description: "Absolute path to the directory to scan",
                        },
                        reportFormat: {
                            type: "string",
                            description: "Optional report format (json or md). Defaults to json output in content.",
                            enum: ["json", "md"]
                        }
                    },
                    required: ["path"],
                },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "scan_config_path") {
        const args = request.params.arguments as { path: string; reportFormat?: "json" | "md" };
        if (!args.path) {
            throw new Error("Path is required");
        }
        const findings = await scanConfigPath(args.path);

        if (args.reportFormat === "md") {
            const report = generateReport(findings, "md");
            return {
                content: [
                    {
                        type: "text",
                        text: report
                    }
                ]
            };
        }

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(findings, null, 2),
                },
            ],
        };
    }
    throw new Error(`Tool ${request.params.name} not found`);
});

async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Cloud Risk Scanner Server running on stdio");
}

run().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});