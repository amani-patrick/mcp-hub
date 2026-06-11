import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { cloudAdapter, isClusterAllowed } from '../config.js';

export const discoveryTools: Tool[] = [
    {
        name: 'list_environments',
        description: 'List cloud container environments (regions, projects, clusters).',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'list_services',
        description: 'List deployed container services with status and scaling info.',
        inputSchema: {
            type: 'object',
            properties: {
                environmentId: { type: 'string', description: 'Environment ID (e.g., Cluster ARN)' },
            },
            required: ['environmentId'],
        },
    },
    {
        name: 'get_service_details',
        description: 'Return service configuration (image, CPU, memory, env keys).',
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

export async function handleDiscoveryTool(name: string, args: any) {
    switch (name) {
        case 'list_environments': {
            const envs = await cloudAdapter.listEnvironments();
            return {
                content: [{ type: 'text', text: JSON.stringify(envs, null, 2) }],
            };
        }
        case 'list_services': {
            if (!isClusterAllowed(args.environmentId)) {
                throw new Error(`Cluster not in allowlist: ${args.environmentId}`);
            }
            const services = await cloudAdapter.listServices(args.environmentId);
            return {
                content: [{ type: 'text', text: JSON.stringify(services, null, 2) }],
            };
        }
        case 'get_service_details': {
            if (!isClusterAllowed(args.environmentId)) {
                throw new Error(`Cluster not in allowlist: ${args.environmentId}`);
            }
            const service = await cloudAdapter.getServiceDetails(args.environmentId, args.serviceName);
            return {
                content: [{ type: 'text', text: JSON.stringify(service, null, 2) }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
