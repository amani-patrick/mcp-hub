import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { isNamespaceAllowed, isResourceBlocked } from '../config.js';

export const advancedTools: Tool[] = [
    {
        name: 'delete_resource',
        description: 'Delete a Kubernetes resource. Blocked types (Secrets, RBAC) cannot be deleted. Requires confirmation.',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace of the resource' },
                resourceType: { type: 'string', description: 'Resource kind (e.g. Deployment, Pod)' },
                resourceName: { type: 'string', description: 'Name of the resource' },
                confirm: { type: 'boolean', description: 'Must be set to true to confirm deletion' },
            },
            required: ['namespace', 'resourceType', 'resourceName', 'confirm'],
        },
    },
];

export async function handleAdvancedTool(name: string, args: any) {
    if (!isNamespaceAllowed(args.namespace)) {
        throw new Error(`Access to namespace '${args.namespace}' is not allowed.`);
    }

    switch (name) {
        case 'delete_resource': {
            if (args.confirm !== true) {
                throw new Error('Operation cancelled: confirmation required (set confirm: true)');
            }

            if (isResourceBlocked(args.resourceType)) {
                throw new Error(`Deletion of ${args.resourceType} is blocked for safety.`);
            }

            return {
                content: [{
                    type: 'text',
                    text: `Resource ${args.resourceType}/${args.resourceName} in ${args.namespace} would be deleted (dry-run guard passed). Connect cluster API to enable live deletion.`,
                }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
