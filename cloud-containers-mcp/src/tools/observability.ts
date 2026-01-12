import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { cloudAdapter } from '../config.js';

export const observabilityTools: Tool[] = [
    {
        name: 'get_service_logs',
        description: 'Fetch bounded logs for a service or revision.',
        inputSchema: {
            type: 'object',
            properties: {
                environmentId: { type: 'string', description: 'Environment ID' },
                serviceName: { type: 'string', description: 'Name of the service' },
                tail: { type: 'number', description: 'Number of lines to tail (default 100)' },
            },
            required: ['environmentId', 'serviceName'],
        },
    },
];

export async function handleObservabilityTool(name: string, args: any) {
    switch (name) {
        case 'get_service_logs': {
            const logs = await cloudAdapter.getServiceLogs(args.environmentId, args.serviceName, args.tail);
            return {
                content: [{ type: 'text', text: logs.join('\n') }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
