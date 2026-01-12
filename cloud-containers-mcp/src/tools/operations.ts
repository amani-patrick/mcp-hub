import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { cloudAdapter, MAX_SCALE_LIMIT } from '../config.js';

export const operationsTools: Tool[] = [
    {
        name: 'scale_service',
        description: 'Adjust min/max instances within allowed bounds.',
        inputSchema: {
            type: 'object',
            properties: {
                environmentId: { type: 'string', description: 'Environment ID' },
                serviceName: { type: 'string', description: 'Name of the service' },
                count: { type: 'number', description: 'Target number of instances' },
            },
            required: ['environmentId', 'serviceName', 'count'],
        },
    },
    {
        name: 'restart_service',
        description: 'Trigger a service restart without configuration changes.',
        inputSchema: {
            type: 'object',
            properties: {
                environmentId: { type: 'string', description: 'Environment ID' },
                serviceName: { type: 'string', description: 'Name of the service' },
            },
            required: ['environmentId', 'serviceName'],
        },
    },
];

export async function handleOperationsTool(name: string, args: any) {
    switch (name) {
        case 'scale_service': {
            if (args.count > MAX_SCALE_LIMIT) {
                throw new Error(`Scaling limit exceeded. Max allowed: ${MAX_SCALE_LIMIT}`);
            }
            await cloudAdapter.scaleService(args.environmentId, args.serviceName, args.count);
            return {
                content: [{ type: 'text', text: `Service ${args.serviceName} scaled to ${args.count}.` }],
            };
        }
        case 'restart_service': {
            await cloudAdapter.restartService(args.environmentId, args.serviceName);
            return {
                content: [{ type: 'text', text: `Service ${args.serviceName} restart triggered.` }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
