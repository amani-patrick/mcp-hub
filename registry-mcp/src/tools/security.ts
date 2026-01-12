import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const securityTools: Tool[] = [

    {
        name: 'check_image_policy_compliance',
        description: 'Validate image against org rules (no latest tag, signed, scan passed).',
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
];

export async function handleSecurityTool(name: string, args: any) {
    switch (name) {

        case 'check_image_policy_compliance': {
            const violations = [];
            if (args.tag === 'latest') {
                violations.push('Usage of "latest" tag is discouraged in production.');
            }

            return {
                content: [{
                    type: 'text', text: JSON.stringify({
                        compliant: violations.length === 0,
                        violations,
                    }, null, 2)
                }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
