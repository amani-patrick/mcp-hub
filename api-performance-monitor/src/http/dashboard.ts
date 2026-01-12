import express from 'express';
import { Server } from 'http';
import { MemoryStorage } from '../storage/memory.js';
import { PerformanceAnalytics } from '../tools/analytics.js';
import { SLAAlerts } from '../tools/alerts.js';
import { RateLimiter } from '../middleware/rateLimit.js';
import { AuthMiddleware, AuthConfig } from '../middleware/auth.js';
import { env } from '../config/env.js';

export class DashboardServer {
  private app: express.Application;
  private server: Server;
  private storage: MemoryStorage;
  private analytics: PerformanceAnalytics;
  private alerts: SLAAlerts;
  private rateLimiter: RateLimiter;
  private auth: AuthMiddleware;

  constructor(port: number = 3001, authConfig?: AuthConfig) {
    this.app = express();
    this.storage = new MemoryStorage();
    this.analytics = new PerformanceAnalytics();
    this.alerts = new SLAAlerts();
    
    // Use environment config with override
    this.rateLimiter = new RateLimiter(
      env.rateLimitWindowMs, 
      env.rateLimitPerMinute
    );
    
    // Use environment config with override
    this.auth = new AuthMiddleware(authConfig || {
      enableAuth: env.enableAuth,
      apiKey: env.apiKey,
      basicAuth: env.basicAuthUsername ? {
        username: env.basicAuthUsername,
        password: env.basicAuthPassword || ''
      } : undefined,
      jwtSecret: env.jwtSecret
    });
    
    this.setupMiddleware();
    this.setupRoutes();
    
    this.server = this.app.listen(port, () => {
      console.log(`🚀 Performance Dashboard running on http://localhost:${port}`);
      if (authConfig?.enableAuth || env.enableAuth) {
        console.log(`🔐 Authentication enabled`);
      }
      console.log(`📊 Rate limiting: ${env.rateLimitPerMinute} requests/minute`);
    });
  }

  private setupMiddleware() {
    this.app.use(express.json());
    this.app.use(this.auth.middleware);
    this.app.use(this.rateLimiter.middleware);
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-API-Key, Authorization');
      next();
    });
  }

  private setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Dashboard HTML
    this.app.get('/', (req, res) => {
      res.send(this.generateDashboardHTML());
    });

    // API Routes
    this.app.get('/api/metrics', async (req, res) => {
      try {
        const metrics = await this.storage.getMetrics();
        res.json(metrics);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch metrics' });
      }
    });

    this.app.get('/api/analytics', async (req, res) => {
      try {
        const { timeRange = '24h', endpoint } = req.query;
        const analytics = await this.analytics.getAnalytics({ 
          timeRange: timeRange as string, 
          endpoint: endpoint as string 
        });
        res.json(analytics);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics' });
      }
    });

    this.app.get('/api/sla', async (req, res) => {
      try {
        const { slaThreshold = 1000, timeWindow = '24h' } = req.query;
        const metrics = await this.storage.getMetrics();
        const endpoints = [...new Set(metrics.map(m => m.endpoint))];
        
        const slaCheck = await this.alerts.checkSLA({
          slaThreshold: Number(slaThreshold),
          timeWindow: timeWindow as string,
          endpoints
        });
        
        res.json(slaCheck);
      } catch (error) {
        res.status(500).json({ error: 'Failed to check SLA' });
      }
    });

    this.app.get('/api/stats', async (req, res) => {
      try {
        const stats = await this.storage.getStats();
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
      }
    });

    // POST endpoint for recording metrics (MCP tool simulation)
    this.app.post('/api/metrics', async (req, res) => {
      try {
        const metric = req.body;
        await this.storage.store(metric);
        
        res.json({ 
          success: true, 
          message: `Performance recorded for ${metric.endpoint}`,
          metric: metric,
          totalMetrics: (await this.storage.getStats()).totalMetrics
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to record metric' });
      }
    });
  }

  private generateDashboardHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>API Performance Monitor</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .metric { text-align: center; }
        .metric h3 { margin: 0; color: #666; }
        .metric .value { font-size: 2em; font-weight: bold; color: #333; }
        .chart-container { height: 400px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 API Performance Monitor</h1>
        
        <div class="card">
            <h2>Real-time Metrics</h2>
            <div class="metrics" id="metrics">
                <div class="metric">
                    <h3>Total Requests</h3>
                    <div class="value" id="totalRequests">-</div>
                </div>
                <div class="metric">
                    <h3>Avg Response Time</h3>
                    <div class="value" id="avgResponseTime">-</div>
                </div>
                <div class="metric">
                    <h3>SLA Compliance</h3>
                    <div class="value" id="slaCompliance">-</div>
                </div>
                <div class="metric">
                    <h3>Error Rate</h3>
                    <div class="value" id="errorRate">-</div>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>Response Time Trends</h2>
            <div class="chart-container">
                <canvas id="responseTimeChart"></canvas>
            </div>
        </div>

        <div class="card">
            <h2>SLA Violations</h2>
            <div class="chart-container">
                <canvas id="slaChart"></canvas>
            </div>
        </div>
    </div>

    <script>
        async function updateDashboard() {
            try {
                const [analytics, slaData] = await Promise.all([
                    fetch('/api/analytics').then(r => r.json()),
                    fetch('/api/sla').then(r => r.json())
                ]);

                document.getElementById('totalRequests').textContent = analytics.totalRequests;
                document.getElementById('avgResponseTime').textContent = analytics.averageResponseTime.toFixed(2) + 'ms';
                document.getElementById('slaCompliance').textContent = analytics.slaComplianceRate.toFixed(1) + '%';
                document.getElementById('errorRate').textContent = analytics.errorRate.toFixed(1) + '%';

                updateCharts(analytics, slaData);
            } catch (error) {
                console.error('Failed to update dashboard:', error);
            }
        }

        function updateCharts(analytics, slaData) {
            // Response Time Chart
            const responseTimeCtx = document.getElementById('responseTimeChart').getContext('2d');
            new Chart(responseTimeCtx, {
                type: 'line',
                data: {
                    labels: analytics.trends.map(t => t.timestamp),
                    datasets: [{
                        label: 'Response Time (ms)',
                        data: analytics.trends.map(t => t.avgResponseTime),
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    }]
                }
            });

            // SLA Chart
            const slaCtx = document.getElementById('slaChart').getContext('2d');
            new Chart(slaCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Compliant', 'Violations'],
                    datasets: [{
                        data: [slaData.complianceRate, 100 - slaData.complianceRate],
                        backgroundColor: ['#4CAF50', '#F44336']
                    }]
                }
            });
        }

        // Update every 5 seconds
        setInterval(updateDashboard, 5000);
        updateDashboard();
    </script>
</body>
</html>`;
  }

  close() {
    if (this.server) {
      this.server.close();
    }
  }
}
