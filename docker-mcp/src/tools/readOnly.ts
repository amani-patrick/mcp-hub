import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { docker } from '../docker.js';

export const readOnlyTools: Tool[] = [
    {
        name: 'list_containers',
        description: 'List Docker containers (running by default, optional flag to include stopped containers).',
        inputSchema: {
            type: 'object',
            properties: {
                all: { type: 'boolean', description: 'Include stopped containers' },
            },
        },
    },
    {
        name: 'get_container_status',
        description: 'Return the current status of a container (running, exited, paused, etc.).',
        inputSchema: {
            type: 'object',
            properties: {
                containerId: { type: 'string', description: 'Container ID or name' },
            },
            required: ['containerId'],
        },
    },
    {
        name: 'get_container_logs',
        description: 'Fetch recent logs from a Docker container.',
        inputSchema: {
            type: 'object',
            properties: {
                containerId: { type: 'string', description: 'Container ID or name' },
                tail: { type: 'number', description: 'Number of lines to show from the end of the logs. Default is 100.' },
            },
            required: ['containerId'],
        },
    },
    {
        name: 'inspect_container',
        description: 'Return structured metadata about a container.',
        inputSchema: {
            type: 'object',
            properties: {
                containerId: { type: 'string', description: 'Container ID or name' },
            },
            required: ['containerId'],
        },
    },
    {
        name: 'list_images',
        description: 'List locally available Docker images.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'get_container_ports',
        description: 'Show port mappings for a container.',
        inputSchema: {
            type: 'object',
            properties: {
                containerId: { type: 'string', description: 'Container ID or name' },
            },
            required: ['containerId'],
        },
    },
    {
        name: 'get_container_resource_usage',
        description: 'Return CPU and memory usage snapshot for a running container.',
        inputSchema: {
            type: 'object',
            properties: {
                containerId: { type: 'string', description: 'Container ID or name' },
            },
            required: ['containerId'],
        },
    },
];

export async function handleReadOnlyTool(name: string, args: any) {
    switch (name) {
        case 'list_containers': {
            const containers = await docker.listContainers({ all: args.all });
            return {
                content: [{ type: 'text', text: JSON.stringify(containers, null, 2) }],
            };
        }
        case 'get_container_status': {
            const container = docker.getContainer(args.containerId);
            const info = await container.inspect();
            return {
                content: [{ type: 'text', text: info.State.Status }],
            };
        }
        case 'get_container_logs': {
            const container = docker.getContainer(args.containerId);
            const logs = await container.logs({
                stdout: true,
                stderr: true,
                tail: args.tail || 100,
            });
            return {
                content: [{ type: 'text', text: logs.toString() }],
            };
        }
        case 'inspect_container': {
            const container = docker.getContainer(args.containerId);
            const info = await container.inspect();
            return {
                content: [{ type: 'text', text: JSON.stringify(info, null, 2) }],
            };
        }
        case 'list_images': {
            const images = await docker.listImages();
            return {
                content: [{ type: 'text', text: JSON.stringify(images, null, 2) }],
            };
        }
        case 'get_container_ports': {
            const container = docker.getContainer(args.containerId);
            const info = await container.inspect();
            const ports = info.NetworkSettings.Ports;
            return {
                content: [{ type: 'text', text: JSON.stringify(ports, null, 2) }],
            };
        }
        case 'get_container_resource_usage': {
            const container = docker.getContainer(args.containerId);
            const stats = await container.stats({ stream: false });
            // Calculate CPU usage percentage (simplified)
            const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
            const systemCpuDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
            const numberCpus = stats.cpu_stats.online_cpus;
            const cpuPercent = (cpuDelta / systemCpuDelta) * numberCpus * 100.0;

            // Memory usage
            const memoryUsage = stats.memory_stats.usage;
            const memoryLimit = stats.memory_stats.limit;
            const memoryPercent = (memoryUsage / memoryLimit) * 100.0;

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            cpuPercent: cpuPercent.toFixed(2) + '%',
                            memoryUsage: (memoryUsage / 1024 / 1024).toFixed(2) + 'MB',
                            memoryLimit: (memoryLimit / 1024 / 1024).toFixed(2) + 'MB',
                            memoryPercent: memoryPercent.toFixed(2) + '%',
                        }, null, 2),
                    },
                ],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
