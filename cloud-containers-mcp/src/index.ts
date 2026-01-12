#!/usr/bin/env node
import {Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { discoveryTools, handleDiscoveryTool } from './tools/discovery.js';
import { operationsTools, handleOperationsTool } from './tools/operations.js';
import { observabilityTools, handleObservabilityTool } from './tools/observability.js';
import { guardedTools, handleGuardedTool } from './tools/guarded.js';

class CloudServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: 'cloud-containers-mcp',
                version: '0.1.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupToolHandlers();

        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }

    private setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    ...discoveryTools,
                    ...operationsTools,
                    ...observabilityTools,
                    ...guardedTools,
                ],
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                if (discoveryTools.some(t => t.name === name)) {
                    return await handleDiscoveryTool(name, args);
                }
                if (operationsTools.some(t => t.name === name)) {
                    return await handleOperationsTool(name, args);
                }
                if (observabilityTools.some(t => t.name === name)) {
                    return await handleObservabilityTool(name, args);
                }
                if (guardedTools.some(t => t.name === name)) {
                    return await handleGuardedTool(name, args);
                }

                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Cloud Containers MCP server running on stdio');
    }
}

const server = new CloudServer();
server.run().catch(console.error);
