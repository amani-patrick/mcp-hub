import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { docker } from '../docker.js';

export const destructiveTools: Tool[] = [
    {
        name: 'remove_container',
        description: 'Remove a stopped container. Requires explicit confirmation.',
        inputSchema: {
            type: 'object',
            properties: {
                containerId: { type: 'string', description: 'Container ID or name' },
                confirm: { type: 'boolean', description: 'Must be set to true to confirm deletion' },
            },
            required: ['containerId', 'confirm'],
        },
    },
    {
        name: 'remove_image',
        description: 'Remove a Docker image. Requires explicit confirmation.',
        inputSchema: {
            type: 'object',
            properties: {
                imageId: { type: 'string', description: 'Image ID or name' },
                confirm: { type: 'boolean', description: 'Must be set to true to confirm deletion' },
            },
            required: ['imageId', 'confirm'],
        },
    },
];

export async function handleDestructiveTool(name: string, args: any) {
    if (args.confirm !== true) {
        throw new Error('Operation cancelled: confirmation required (set confirm: true)');
    }

    switch (name) {
        case 'remove_container': {
            const container = docker.getContainer(args.containerId);
            await container.remove();
            return {
                content: [{ type: 'text', text: `Container ${args.containerId} removed` }],
            };
        }
        case 'remove_image': {
            const image = docker.getImage(args.imageId);
            await image.remove();
            return {
                content: [{ type: 'text', text: `Image ${args.imageId} removed` }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
