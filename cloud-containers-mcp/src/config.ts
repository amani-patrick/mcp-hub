import { AwsEcsAdapter } from './adapters/AwsEcsAdapter.js';
import { CloudPlatformAdapter } from './adapters/CloudPlatformAdapter.js';

// Configuration
export const CLOUD_CONFIG = {
    region: process.env.AWS_REGION || 'us-east-1',
    allowedClusters: (process.env.ALLOWED_CLUSTERS || 'default,dev,staging').split(','),
};

// Initialize Adapter
// We export a singleton for simplicity
export const cloudAdapter: CloudPlatformAdapter = new AwsEcsAdapter(CLOUD_CONFIG.region);

// Safety Config
export const MAX_SCALE_LIMIT = 10; // Safety cap for scaling
