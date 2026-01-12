import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { resolve } from 'path';

// Load environment variables from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../..') });

export interface EnvConfig {
  // Authentication
  enableAuth: boolean;
  apiKey?: string;
  basicAuthUsername?: string;
  basicAuthPassword?: string;
  jwtSecret?: string;

  // Rate Limiting
  rateLimitPerMinute: number;
  rateLimitWindowMs: number;

  // Dashboard
  dashboardPort: number;
  autoStartDashboard: boolean;

  // Storage
  storageType: 'memory' | 'file' | 'redis';
  fileStoragePath?: string;
  redisUrl?: string;
  redisPassword?: string;

  // Logging
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  logFile?: string;

  // Production
  nodeEnv: 'development' | 'production';
  host: string;

  // External Integrations
  datadogApiKey?: string;
  datadogSite?: string;
  newrelicLicenseKey?: string;
  newrelicAppName?: string;
  prometheusGateway?: string;
  prometheusJob?: string;
  slackWebhook?: string;
  slackChannel?: string;
}

export const env: EnvConfig = {
  // Authentication
  enableAuth: process.env.ENABLE_AUTH === 'true',
  apiKey: process.env.API_KEY,
  basicAuthUsername: process.env.BASIC_AUTH_USERNAME,
  basicAuthPassword: process.env.BASIC_AUTH_PASSWORD,
  jwtSecret: process.env.JWT_SECRET,

  // Rate Limiting
  rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '1000'),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),

  // Dashboard
  dashboardPort: parseInt(process.env.DASHBOARD_PORT || '3001'),
  autoStartDashboard: process.env.AUTO_START_DASHBOARD !== 'false',

  // Storage
  storageType: (process.env.STORAGE_TYPE as 'memory' | 'file' | 'redis') || 'file',
  fileStoragePath: process.env.FILE_STORAGE_PATH || './data/metrics.json',
  redisUrl: process.env.REDIS_URL,
  redisPassword: process.env.REDIS_PASSWORD,

  // Logging
  logLevel: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
  logFile: process.env.LOG_FILE,

  // Production
  nodeEnv: (process.env.NODE_ENV as 'development' | 'production') || 'development',
  host: process.env.HOST || '0.0.0.0',

  // External Integrations
  datadogApiKey: process.env.DATADOG_API_KEY,
  datadogSite: process.env.DATADOG_SITE,
  newrelicLicenseKey: process.env.NEWRELIC_LICENSE_KEY,
  newrelicAppName: process.env.NEWRELIC_APP_NAME,
  prometheusGateway: process.env.PROMETHEUS_GATEWAY,
  prometheusJob: process.env.PROMETHEUS_JOB,
  slackWebhook: process.env.SLACK_WEBHOOK,
  slackChannel: process.env.SLACK_CHANNEL,
};
