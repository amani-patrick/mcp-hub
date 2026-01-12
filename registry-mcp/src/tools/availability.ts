import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { registryAdapter } from '../config.js';

export const availabilityTools: Tool[] = [
    {
        name: 'check_image_exists',
        description: 'Verify whether an image:tag or digest exists in a registry.',
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

export async function handleAvailabilityTool(name: string, args: any) {
    switch (name) {
        case 'check_image_exists': {
            try {
                await registryAdapter.getManifest(args.namespace || '', args.repository, args.reference);
                return {
                    content: [{ type: 'text', text: 'true' }],
                };
            } catch (error) {
                return {
                    content: [{ type: 'text', text: 'false' }],
                };
            }
        }

        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
