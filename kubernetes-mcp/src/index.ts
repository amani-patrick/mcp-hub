#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { checkK8sConnection } from './k8s.js';
import { discoveryTools, handleDiscoveryTool } from './tools/discovery.js';
import { inspectionTools, handleInspectionTool } from './tools/inspection.js';
import { safeOperationsTools, handleSafeOperationsTool } from './tools/safeOperations.js';


class K8sServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: 'kubernetes-mcp',
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
                    ...discoveryTools,
                    ...inspectionTools,
                    ...safeOperationsTools,

                ],
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                if (discoveryTools.some(t => t.name === name)) {
                    return await handleDiscoveryTool(name, args);
                }
                if (inspectionTools.some(t => t.name === name)) {
                    return await handleInspectionTool(name, args);
                }
                if (safeOperationsTools.some(t => t.name === name)) {
                    return await handleSafeOperationsTool(name, args);
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
        const isConnected = await checkK8sConnection();
        if (!isConnected) {
            console.error('Failed to connect to Kubernetes cluster. Please ensure KUBECONFIG is set and valid.');
            // We don't exit here to allow the server to start even if the cluster is temporarily unreachable,
            // but tools will likely fail.
        }

        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Kubernetes MCP server running on stdio');
    }
}

const server = new K8sServer();
server.run().catch(console.error);
