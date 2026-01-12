import path from 'path';

// Whitelisted paths for building images
// In a real scenario, this might be loaded from a config file or env var
export const ALLOWED_BUILD_PATHS = [
    path.resolve(process.cwd(), 'services'), // Example: allow building from a 'services' directory in the current project
    // Add other allowed absolute paths here
];

// Predefined run profiles for safety
export const RUN_PROFILES: Record<string, {
    ports?: string[];
    restart?: string;
    envKeys?: string[];
    memoryLimit?: string;
    network?: string;
}> = {
    'web-service': {
        ports: ['8080:80'],
        restart: 'unless-stopped',
        envKeys: ['NODE_ENV', 'API_KEY'],
        memoryLimit: '512m',
    },
    'db-service': {
        ports: ['5432:5432'],
        restart: 'always',
        envKeys: ['POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB'],
        memoryLimit: '1g',
    },
    'minimal': {
        memoryLimit: '128m',
        network: 'none'
    }
};

export const ALLOWED_IMAGE_TAGS_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*:[a-zA-Z0-9_.-]+$/;
