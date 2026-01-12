import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const advancedTools: Tool[] = [];

export async function handleAdvancedTool(name: string, args: any) {
    throw new Error(`Unknown tool: ${name}`);
}
