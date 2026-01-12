import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { PerformanceMonitor } from './tools/monitor.js';
import { PerformanceAnalytics } from './tools/analytics.js';
import { SLAAlerts } from './tools/alerts.js';
import { DashboardServer } from './http/dashboard.js';
import { StreamingServer } from './websocket/streaming.js';
import { ExternalMonitoringIntegration } from './integrations/external.js';
import { MCPRateLimiter } from './middleware/rateLimit.js';
import { MCPAuth } from './middleware/auth.js';
import { env } from './config/env.js';

const server = new McpServer({
  name: 'API Performance Monitor',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// Initialize enterprise features with environment config
let dashboardServer: DashboardServer | null = null;
let streamingServer: StreamingServer | null = null;
let externalIntegration: ExternalMonitoringIntegration | null = null;

// Rate limiting from environment
const rateLimiter = new MCPRateLimiter(
  env.rateLimitWindowMs, 
  env.rateLimitPerMinute
);

// Authentication from environment
const auth = new MCPAuth({
  enableAuth: env.enableAuth,
  apiKey: env.apiKey,
  basicAuth: env.basicAuthUsername ? {
    username: env.basicAuthUsername,
    password: env.basicAuthPassword || ''
  } : undefined,
  jwtSecret: env.jwtSecret
});

// Rate limiting and auth wrapper for MCP tools
function wrapTool(toolName: string, handler: Function) {
  return async (args: any, context?: any) => {
    // Check authentication
    if (!auth.authenticate({ toolName, args }, context)) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: 'Authentication required' }, null, 2)
        }]
      };
    }

    // Check rate limiting
    if (!rateLimiter.checkLimit(toolName, context?.clientId || 'default')) {
      const remaining = rateLimiter.getRemainingCalls(toolName, context?.clientId || 'default');
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ 
            error: 'Rate limit exceeded',
            remainingCalls: remaining,
            message: 'Please wait before making more requests'
          }, null, 2)
        }]
      };
    }

    return await handler(args, context);
  };
}

// Register performance monitoring tools
server.registerTool('monitor_performance', {
  description: 'Monitor real-time API performance metrics and response times',
  inputSchema: z.object({
    endpoint: z.string().describe('API endpoint to monitor'),
    responseTime: z.number().describe('Response time in milliseconds'),
    statusCode: z.number().describe('HTTP status code'),
    timestamp: z.string().describe('ISO timestamp of request'),
  }),
}, wrapTool('monitor_performance', async (args: any, context?: any) => {
  const monitor = new PerformanceMonitor();
  const result = await monitor.recordMetrics(args as any);
  
  // Trigger external integration
  if (externalIntegration) {
    await externalIntegration.integrateAll();
  }
  
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2)
    }]
  };
}));

server.registerTool('get_analytics', {
  description: 'Get historical performance analytics and trends',
  inputSchema: z.object({
    timeRange: z.string().describe('Time range for analytics (1h, 24h, 7d)'),
    endpoint: z.string().optional().describe('Specific endpoint to analyze'),
  }),
}, wrapTool('get_analytics', async (args: any, context?: any) => {
  const analytics = new PerformanceAnalytics();
  const result = await analytics.getAnalytics(args as any);
  
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2)
    }]
  };
}));

server.registerTool('check_sla', {
  description: 'Check SLA compliance and generate alerts for violations',
  inputSchema: z.object({
    slaThreshold: z.number().describe('SLA threshold in milliseconds'),
    timeWindow: z.string().describe('Time window for SLA check'),
    endpoints: z.array(z.string()).describe('List of endpoints to check'),
  }),
}, wrapTool('check_sla', async (args: any, context?: any) => {
  const alerts = new SLAAlerts();
  const result = await alerts.checkSLA(args as any);
  
  // Send SLA violation alerts
  if (externalIntegration && result.violations.length > 0) {
    await externalIntegration.sendSLAViolationAlert(result.violations);
  }
  
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2)
    }]
  };
}));

// New enterprise tools
server.registerTool('start_dashboard', {
  description: 'Start HTTP dashboard server for real-time monitoring',
  inputSchema: z.object({
    port: z.number().optional().describe('Port for dashboard server (default: 3001)'),
  }),
}, wrapTool('start_dashboard', async (args: any, context?: any) => {
  const port = args.port || env.dashboardPort;
  
  // Create auth config from environment
  const authConfig = {
    enableAuth: env.enableAuth,
    apiKey: env.apiKey,
    basicAuth: env.basicAuthUsername ? {
      username: env.basicAuthUsername,
      password: env.basicAuthPassword || ''
    } : undefined
  };
  
  dashboardServer = new DashboardServer(port, authConfig);
  
  // Start WebSocket streaming
  if (!streamingServer) {
    const httpServer = (dashboardServer as any).server;
    streamingServer = new StreamingServer(httpServer);
  }
  
  return {
    content: [{
      type: 'text',
      text: `Dashboard started on http://localhost:${port}${env.enableAuth ? ' (authentication enabled)' : ''}`
    }]
  };
}));

server.registerTool('setup_external_monitoring', {
  description: 'Configure external monitoring integrations (Datadog, New Relic, Prometheus, Slack)',
  inputSchema: z.object({
    datadog: z.object({
      apiKey: z.string().optional(),
      site: z.string().optional()
    }).optional(),
    newrelic: z.object({
      licenseKey: z.string().optional(),
      appName: z.string().optional()
    }).optional(),
    prometheus: z.object({
      gateway: z.string().optional(),
      job: z.string().optional()
    }).optional(),
    slack: z.object({
      webhook: z.string().optional(),
      channel: z.string().optional()
    }).optional()
  }),
}, wrapTool('setup_external_monitoring', async (args: any, context?: any) => {
  // Use environment variables as defaults, allow override
  const config = {
    datadog: {
      apiKey: args.datadog?.apiKey || env.datadogApiKey,
      site: args.datadog?.site || env.datadogSite
    },
    newrelic: {
      licenseKey: args.newrelic?.licenseKey || env.newrelicLicenseKey,
      appName: args.newrelic?.appName || env.newrelicAppName
    },
    prometheus: {
      gateway: args.prometheus?.gateway || env.prometheusGateway,
      job: args.prometheus?.job || env.prometheusJob
    },
    slack: {
      webhook: args.slack?.webhook || env.slackWebhook,
      channel: args.slack?.channel || env.slackChannel
    }
  };
  
  externalIntegration = new ExternalMonitoringIntegration(config);
  await externalIntegration.setupPeriodicIntegration();
  
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        message: 'External monitoring integrations configured',
        integrations: {
          datadog: !!config.datadog.apiKey,
          newrelic: !!config.newrelic.licenseKey,
          prometheus: !!config.prometheus.gateway,
          slack: !!config.slack.webhook
        }
      }, null, 2)
    }]
  };
}));

server.registerTool('configure_auth', {
  description: 'Configure authentication and rate limiting',
  inputSchema: z.object({
    enableAuth: z.boolean().optional().describe('Enable authentication'),
    apiKey: z.string().optional().describe('API key for authentication'),
    rateLimitPerMinute: z.number().optional().describe('Rate limit per minute per tool'),
  }),
}, wrapTool('configure_auth', async (args: any, context?: any) => {
  // Update auth configuration (runtime override)
  if (args.enableAuth !== undefined) {
    auth.config.enableAuth = args.enableAuth;
  }
  if (args.apiKey) {
    auth.config.apiKey = args.apiKey;
  }
  
  // Update rate limiting (runtime override)
  if (args.rateLimitPerMinute !== undefined) {
    rateLimiter.maxCalls = args.rateLimitPerMinute;
  }
  
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        message: 'Authentication and rate limiting configured',
        currentConfig: {
          authEnabled: auth.config.enableAuth,
          hasApiKey: !!auth.config.apiKey,
          rateLimitPerMinute: rateLimiter.maxCalls,
          environmentConfig: {
            authEnabled: env.enableAuth,
            rateLimitPerMinute: env.rateLimitPerMinute
          }
        }
      }, null, 2)
    }]
  };
}));

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('API Performance Monitor MCP server running on stdio');
  console.error(`🔧 Configuration:`);
  console.error(`  - Authentication: ${env.enableAuth ? 'ENABLED' : 'DISABLED'}`);
  console.error(`  - Rate Limiting: ${env.rateLimitPerMinute} requests/minute`);
  console.error(`  - Storage: ${env.storageType}`);
  console.error(`  - Dashboard Port: ${env.dashboardPort}`);
  
  // Auto-start dashboard if configured
  if (env.autoStartDashboard) {
    const authConfig = {
      enableAuth: env.enableAuth,
      apiKey: env.apiKey,
      basicAuth: env.basicAuthUsername ? {
        username: env.basicAuthUsername,
        password: env.basicAuthPassword || ''
      } : undefined
    };
    
    dashboardServer = new DashboardServer(env.dashboardPort, authConfig);
    console.error(`🚀 Dashboard auto-started on http://localhost:${env.dashboardPort}`);
    
    // Start WebSocket streaming
    if (!streamingServer) {
      const httpServer = (dashboardServer as any).server;
      streamingServer = new StreamingServer(httpServer);
    }
  }
  
  // Auto-configure external monitoring if environment variables are set
  if (env.datadogApiKey || env.newrelicLicenseKey || env.slackWebhook) {
    const config = {
      datadog: env.datadogApiKey ? {
        apiKey: env.datadogApiKey,
        site: env.datadogSite
      } : undefined,
      newrelic: env.newrelicLicenseKey ? {
        licenseKey: env.newrelicLicenseKey,
        appName: env.newrelicAppName
      } : undefined,
      prometheus: env.prometheusGateway ? {
        gateway: env.prometheusGateway,
        job: env.prometheusJob
      } : undefined,
      slack: env.slackWebhook ? {
        webhook: env.slackWebhook,
        channel: env.slackChannel
      } : undefined
    };
    
    externalIntegration = new ExternalMonitoringIntegration(config);
    await externalIntegration.setupPeriodicIntegration();
    console.error('📡 External monitoring integrations auto-configured');
  }
}

main().catch(console.error);
