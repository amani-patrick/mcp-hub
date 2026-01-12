import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { docker } from '../docker.js';

export const lifecycleTools: Tool[] = [
    {
        name: 'start_container',
        description: 'Start a Docker container by name or ID.',
        inputSchema: {
            type: 'object',
            properties: {
                containerId: { type: 'string', description: 'Container ID or name' },
            },
            required: ['containerId'],
        },
    },
    {
        name: 'stop_container',
        description: 'Stop a running Docker container by name or ID.',
        inputSchema: {
            type: 'object',
            properties: {
                containerId: { type: 'string', description: 'Container ID or name' },
            },
            required: ['containerId'],
        },
    },
    {
        name: 'restart_container',
        description: 'Restart a Docker container by name or ID.',
        inputSchema: {
            type: 'object',
            properties: {
                containerId: { type: 'string', description: 'Container ID or name' },
            },
            required: ['containerId'],
        },
    },
];

export async function handleLifecycleTool(name: string, args: any) {
    const container = docker.getContainer(args.containerId);

    switch (name) {
        case 'start_container': {
            await container.start();
            return {
                content: [{ type: 'text', text: `Container ${args.containerId} started` }],
            };
        }
        case 'stop_container': {
            await container.stop();
            return {
                content: [{ type: 'text', text: `Container ${args.containerId} stopped` }],
            };
        }
        case 'restart_container': {
            await container.restart();
            return {
                content: [{ type: 'text', text: `Container ${args.containerId} restarted` }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
