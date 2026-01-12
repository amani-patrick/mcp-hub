#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { checkDockerAvailability } from './docker.js';
import { readOnlyTools, handleReadOnlyTool } from './tools/readOnly.js';
import { lifecycleTools, handleLifecycleTool } from './tools/lifecycle.js';
import { guardedTools, handleGuardedTool } from './tools/guarded.js';
import { destructiveTools, handleDestructiveTool } from './tools/destructive.js';

class DockerServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: 'docker-mcp',
                version: '0.1.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupToolHandlers();

        // Error handling
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
                    ...readOnlyTools,
                    ...lifecycleTools,
                    ...guardedTools,
                    ...destructiveTools,
                ],
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                // Dispatch to appropriate handler
                if (readOnlyTools.some(t => t.name === name)) {
                    return await handleReadOnlyTool(name, args);
                }
                if (lifecycleTools.some(t => t.name === name)) {
                    return await handleLifecycleTool(name, args);
                }
                if (guardedTools.some(t => t.name === name)) {
                    return await handleGuardedTool(name, args);
                }
                if (destructiveTools.some(t => t.name === name)) {
                    return await handleDestructiveTool(name, args);
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
        const isDockerAvailable = await checkDockerAvailability();
        if (!isDockerAvailable) {
            console.error('Failed to connect to Docker daemon. Please ensure Docker is running.');
            process.exit(1);
        }

        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Docker MCP server running on stdio');
    }
}

const server = new DockerServer();
server.run().catch(console.error);
