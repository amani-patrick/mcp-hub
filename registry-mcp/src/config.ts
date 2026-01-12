import { GenericV2Adapter } from './adapters/GenericV2Adapter.js';
import { RegistryAdapter } from './adapters/RegistryAdapter.js';

// Configuration
export const REGISTRY_CONFIG = {
    // Default to Docker Hub public registry for demo purposes
    // In a real app, this would come from env vars
    url: process.env.REGISTRY_URL || 'https://registry-1.docker.io',
    username: process.env.REGISTRY_USERNAME,
    password: process.env.REGISTRY_PASSWORD,
};

// Initialize Adapter
// We export a singleton for simplicity in this demo
export const registryAdapter: RegistryAdapter = new GenericV2Adapter(
    REGISTRY_CONFIG.url,
    REGISTRY_CONFIG.username,
    REGISTRY_CONFIG.password
);

// Safety Config
export const ALLOWED_DELETE_NAMESPACES = ['dev', 'staging']; // Only allow deletion in these namespaces
export const BLOCKED_TAGS = ['latest', 'stable', 'prod']; // Never allow deleting these tags
