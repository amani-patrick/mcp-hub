import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { registryAdapter, REGISTRY_CONFIG } from '../config.js';

export const discoveryTools: Tool[] = [
    {
        name: 'list_registries',
        description: 'List configured container registries accessible to this MCP instance.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'list_repositories',
        description: 'List repositories in a registry, optionally filtered by namespace or prefix.',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace to filter by (e.g., "library")' },
            },
        },
    },
    {
        name: 'get_repository_info',
        description: 'Return repository metadata (visibility, size, tag count, retention rules).',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace of the repository' },
                repository: { type: 'string', description: 'Name of the repository' },
            },
            required: ['repository'],
        },
    },
];

export async function handleDiscoveryTool(name: string, args: any) {
    switch (name) {
        case 'list_registries': {
            return {
                content: [{ type: 'text', text: JSON.stringify([{ url: REGISTRY_CONFIG.url, type: 'generic-v2' }], null, 2) }],
            };
        }
        case 'list_repositories': {
            const repos = await registryAdapter.listRepositories(args.namespace);
            return {
                content: [{ type: 'text', text: JSON.stringify(repos, null, 2) }],
            };
        }
        case 'get_repository_info': {
            const info = await registryAdapter.getRepositoryInfo(args.namespace || '', args.repository);
            return {
                content: [{ type: 'text', text: JSON.stringify(info, null, 2) }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
