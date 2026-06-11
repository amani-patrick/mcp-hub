#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { checkGitAvailability } from './git.js';
import { readOnlyTools, handleReadOnlyTool } from './tools/readOnly.js';
import { guardedTools, handleGuardedTool } from './tools/guarded.js';
import { destructiveTools, handleDestructiveTool } from './tools/destructive.js';

class GitMcpServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: 'git-mcp',
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
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                ...readOnlyTools,
                ...guardedTools,
                ...destructiveTools,
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                if (readOnlyTools.some((tool) => tool.name === name)) {
                    return await handleReadOnlyTool(name, args);
                }
                if (guardedTools.some((tool) => tool.name === name)) {
                    return await handleGuardedTool(name, args);
                }
                if (destructiveTools.some((tool) => tool.name === name)) {
                    return await handleDestructiveTool(name, args);
                }

                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
            } catch (error: any) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error: ${error.message}`,
                    }],
                    isError: true,
                };
            }
        });
    }

    async run() {
        const gitAvailable = await checkGitAvailability();
        if (!gitAvailable) {
            console.error('Git is not available on PATH. Install git before running git-mcp.');
            process.exit(1);
        }

        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Git MCP server running on stdio');
    }
}

const server = new GitMcpServer();
server.run().catch(console.error);
