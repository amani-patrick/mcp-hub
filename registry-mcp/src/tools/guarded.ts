import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { registryAdapter, ALLOWED_DELETE_NAMESPACES, BLOCKED_TAGS } from '../config.js';

export const guardedTools: Tool[] = [
    {
        name: 'delete_tag',
        description: 'Delete a specific image tag. Requires confirmation and checks against allowlists.',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace of the repository' },
                repository: { type: 'string', description: 'Name of the repository' },
                tag: { type: 'string', description: 'Tag name' },
                confirm: { type: 'boolean', description: 'Must be set to true to confirm deletion' },
            },
            required: ['repository', 'tag', 'confirm'],
        },
    },
];

export async function handleGuardedTool(name: string, args: any) {
    switch (name) {
        case 'delete_tag': {
            if (args.confirm !== true) {
                throw new Error('Operation cancelled: confirmation required (set confirm: true)');
            }

            const namespace = args.namespace || '';

            // Safety Check: Namespace Allowlist
            if (!ALLOWED_DELETE_NAMESPACES.includes(namespace)) {
                throw new Error(`Deletion not allowed in namespace '${namespace}'. Allowed: ${ALLOWED_DELETE_NAMESPACES.join(', ')}`);
            }

            // Safety Check: Blocked Tags
            if (BLOCKED_TAGS.includes(args.tag)) {
                throw new Error(`Deletion of tag '${args.tag}' is blocked.`);
            }

            await registryAdapter.deleteTag(namespace, args.repository, args.tag);
            return {
                content: [{ type: 'text', text: `Tag ${args.tag} deleted from ${namespace}/${args.repository}` }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
