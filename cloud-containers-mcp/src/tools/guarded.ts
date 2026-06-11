import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { isClusterAllowed, cloudAdapter } from '../config.js';

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
            if (!isClusterAllowed(args.environmentId)) {
                throw new Error(`Cluster not in allowlist: ${args.environmentId}`);
            }
            if (args.confirm !== true) {
                throw new Error('Operation cancelled: confirmation required (set confirm: true)');
            }

            await cloudAdapter.deleteService(args.environmentId, args.serviceName);
            return {
                content: [{
                    type: 'text',
                    text: `Service ${args.serviceName} deleted from ${args.environmentId}`,
                }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
