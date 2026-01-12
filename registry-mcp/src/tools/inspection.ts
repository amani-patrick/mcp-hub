import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { registryAdapter } from '../config.js';

export const inspectionTools: Tool[] = [
    {
        name: 'list_tags',
        description: 'List tags for a repository, sorted by creation time or semantic version.',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace of the repository' },
                repository: { type: 'string', description: 'Name of the repository' },
            },
            required: ['repository'],
        },
    },
    {
        name: 'get_tag_metadata',
        description: 'Return creation time, digest, size, and architecture for a tag.',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace of the repository' },
                repository: { type: 'string', description: 'Name of the repository' },
                tag: { type: 'string', description: 'Tag name' },
            },
            required: ['repository', 'tag'],
        },
    },
    {
        name: 'get_manifest',
        description: 'Retrieve image manifest (schema, layers, platform info).',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace of the repository' },
                repository: { type: 'string', description: 'Name of the repository' },
                reference: { type: 'string', description: 'Tag or digest' },
            },
            required: ['repository', 'reference'],
        },
    },
];

export async function handleInspectionTool(name: string, args: any) {
    switch (name) {
        case 'list_tags': {
            const tags = await registryAdapter.listTags(args.namespace || '', args.repository);
            return {
                content: [{ type: 'text', text: JSON.stringify(tags, null, 2) }],
            };
        }
        case 'get_tag_metadata': {
            // For now, we fetch the manifest to get metadata as V2 API doesn't have a direct lightweight metadata endpoint for tags
            const manifest = await registryAdapter.getManifest(args.namespace || '', args.repository, args.tag);
            const metadata = {
                tag: args.tag,
                schemaVersion: manifest.schemaVersion,
                layers: manifest.layers?.length,
                architecture: manifest.architecture, // V1 compatibility
            };
            return {
                content: [{ type: 'text', text: JSON.stringify(metadata, null, 2) }],
            };
        }
        case 'get_manifest': {
            const manifest = await registryAdapter.getManifest(args.namespace || '', args.repository, args.reference);
            return {
                content: [{ type: 'text', text: JSON.stringify(manifest, null, 2) }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
