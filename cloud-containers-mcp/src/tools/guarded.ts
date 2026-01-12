import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const guardedTools: Tool[] = [
    {
        name: 'delete_service',
        description: 'Delete a container service. Disabled by default, confirmation mandatory.',
        inputSchema: {
            type: 'object',
            properties: {
                environmentId: { type: 'string', description: 'Environment ID' },
                serviceName: { type: 'string', description: 'Name of the service' },
                confirm: { type: 'boolean', description: 'Must be set to true to confirm deletion' },
            },
            required: ['environmentId', 'serviceName', 'confirm'],
        },
    },
];

export async function handleGuardedTool(name: string, args: any) {
    switch (name) {
        case 'delete_service': {
            if (args.confirm !== true) {
                throw new Error('Operation cancelled: confirmation required (set confirm: true)');
            }
            // In a real implementation, we would call cloudAdapter.deleteService here.
            // For safety in this demo, we just return a message.
            return {
                content: [{ type: 'text', text: `Service ${args.serviceName} deletion simulated (not fully implemented for safety).` }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
