import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { docker } from '../docker.js';
import { ALLOWED_BUILD_PATHS, RUN_PROFILES, ALLOWED_IMAGE_TAGS_REGEX } from '../config.js';
import path from 'path';
import fs from 'fs-extra';

export const guardedTools: Tool[] = [
    {
        name: 'build_image_from_path',
        description: 'Build a Docker image from a known local directory containing a Dockerfile.',
        inputSchema: {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'Absolute path to the directory containing the Dockerfile' },
                tag: { type: 'string', description: 'Tag for the image (e.g., my-app:latest)' },
            },
            required: ['path', 'tag'],
        },
    },
    {
        name: 'run_container_from_image',
        description: 'Run a container from an image using a predefined run template.',
        inputSchema: {
            type: 'object',
            properties: {
                image: { type: 'string', description: 'Docker image to run' },
                profile: { type: 'string', description: 'Run profile to use (e.g., web-service, db-service)' },
                containerName: { type: 'string', description: 'Name for the container' },
            },
            required: ['image', 'profile'],
        },
    },
];

export async function handleGuardedTool(name: string, args: any) {
    switch (name) {
        case 'build_image_from_path': {
            const buildPath = path.resolve(args.path);

            // Safety Check: Whitelist
            const isAllowed = ALLOWED_BUILD_PATHS.some(allowed =>
                buildPath === allowed || buildPath.startsWith(allowed + path.sep)
            );

            if (!isAllowed) {
                throw new Error(`Build path not allowed: ${buildPath}`);
            }

            // Safety Check: Tag format
            if (!ALLOWED_IMAGE_TAGS_REGEX.test(args.tag)) {
                throw new Error(`Invalid image tag format: ${args.tag}`);
            }

            // Check if Dockerfile exists
            if (!await fs.pathExists(path.join(buildPath, 'Dockerfile'))) {
                throw new Error(`Dockerfile not found in ${buildPath}`);
            }

            // Perform build
            const stream = await docker.buildImage({
                context: buildPath,
                src: ['.'],
            }, {
                t: args.tag,
            });

            // Wait for build to finish and capture output
            await new Promise((resolve, reject) => {
                docker.modem.followProgress(stream, (err: any, res: any) => {
                    if (err) return reject(err);
                    resolve(res);
                });
            });

            return {
                content: [{ type: 'text', text: `Image built successfully: ${args.tag}` }],
            };
        }
        case 'run_container_from_image': {
            const profile = RUN_PROFILES[args.profile];
            if (!profile) {
                throw new Error(`Unknown run profile: ${args.profile}`);
            }

            const createOptions: any = {
                Image: args.image,
                name: args.containerName,
                HostConfig: {
                    Memory: profile.memoryLimit ? parseMemory(profile.memoryLimit) : undefined,
                    RestartPolicy: profile.restart ? { Name: profile.restart } : undefined,
                    PortBindings: {},
                    NetworkMode: profile.network,
                },
                Env: [],
            };

            // Apply ports
            if (profile.ports) {
                profile.ports.forEach(p => {
                    const [host, container] = p.split(':');
                    createOptions.HostConfig.PortBindings[`${container}/tcp`] = [{ HostPort: host }];
                });
            }

            // Apply Env (only keys allowed, values from host env or empty)
            if (profile.envKeys) {
                profile.envKeys.forEach(key => {
                    // In a real app, we might want to pass values from args if allowed, 
                    // or strictly from host env. Here we just set the key.
                    // For this demo, let's assume we pass the key through if it exists in process.env
                    if (process.env[key]) {
                        createOptions.Env.push(`${key}=${process.env[key]}`);
                    }
                });
            }

            const container = await docker.createContainer(createOptions);
            await container.start();

            return {
                content: [{ type: 'text', text: `Container started: ${container.id} (Profile: ${args.profile})` }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}

// Helper to parse memory strings like '512m', '1g' to bytes
function parseMemory(mem: string): number {
    const unit = mem.slice(-1).toLowerCase();
    const value = parseInt(mem.slice(0, -1), 10);
    switch (unit) {
        case 'k': return value * 1024;
        case 'm': return value * 1024 * 1024;
        case 'g': return value * 1024 * 1024 * 1024;
        default: return value;
    }
}
