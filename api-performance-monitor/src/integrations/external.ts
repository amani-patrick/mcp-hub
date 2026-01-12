import { PerformanceMetrics } from '../types/performance.js';
import { MemoryStorage } from '../storage/memory.js';

export interface ExternalMonitoringConfig {
  datadog?: {
    apiKey?: string;
    site?: string;
  };
  newrelic?: {
    licenseKey?: string;
    appName?: string;
  };
  prometheus?: {
    gateway?: string;
    job?: string;
  };
  slack?: {
    webhook?: string;
    channel?: string;
  };
}

export class ExternalMonitoringIntegration {
  private config: ExternalMonitoringConfig;
  private storage: MemoryStorage;

  constructor(config: ExternalMonitoringConfig) {
    this.config = config;
    this.storage = new MemoryStorage();
  }

  async sendToDatadog(metrics: PerformanceMetrics[]): Promise<void> {
    if (!this.config.datadog) return;

    const payload = {
      series: metrics.map(metric => ({
        metric: 'api.response_time',
        points: [{
          timestamp: new Date(metric.timestamp).getTime() / 1000,
          value: metric.responseTime,
          tags: [
            `endpoint:${metric.endpoint}`,
            `status:${metric.statusCode}`,
            `sla_compliant:${metric.slaCompliance}`
          ]
        }]
      }))
    };

    try {
      const response = await fetch(`https://api.datadoghq.com/api/v1/series?api_key=${this.config.datadog.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error('Failed to send to Datadog:', await response.text());
      }
    } catch (error) {
      console.error('Datadog integration error:', error);
    }
  }

  async sendToNewRelic(metrics: PerformanceMetrics[]): Promise<void> {
    if (!this.config.newrelic) return;

    const events = metrics.map(metric => ({
      eventType: 'ApiPerformance',
      timestamp: metric.timestamp,
      appName: this.config.newrelic.appName,
      attributes: {
        endpoint: metric.endpoint,
        responseTime: metric.responseTime,
        statusCode: metric.statusCode,
        slaCompliant: metric.slaCompliance
      }
    }));

    try {
      const response = await fetch(`https://insights-collector.newrelic.com/v1/accounts/events?api_key=${this.config.newrelic.licenseKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(events)
      });

      if (!response.ok) {
        console.error('Failed to send to New Relic:', await response.text());
      }
    } catch (error) {
      console.error('New Relic integration error:', error);
    }
  }

  async sendToPrometheus(metrics: PerformanceMetrics[]): Promise<void> {
    if (!this.config.prometheus) return;

    const endpointStats = this.calculateEndpointStats(metrics);
    const prometheusMetrics = Object.entries(endpointStats)
      .map(([endpoint, stats]) => 
        `# HELP api_response_time_seconds API response time in seconds
# TYPE api_response_time_seconds gauge
api_response_time_seconds{endpoint="${endpoint}",quantile="p50"} ${stats.p50 / 1000}
api_response_time_seconds{endpoint="${endpoint}",quantile="p95"} ${stats.p95 / 1000}
api_response_time_seconds{endpoint="${endpoint}",quantile="p99"} ${stats.p99 / 1000}
api_response_time_seconds_count{endpoint="${endpoint}"} ${stats.count}
api_error_rate{endpoint="${endpoint}"} ${stats.errorRate}`
      ).join('\n');

    try {
      const response = await fetch(this.config.prometheus.gateway, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: prometheusMetrics
      });

      if (!response.ok) {
        console.error('Failed to send to Prometheus:', await response.text());
      }
    } catch (error) {
      console.error('Prometheus integration error:', error);
    }
  }

  async sendSlackAlert(message: string, severity: 'info' | 'warning' | 'error' = 'warning'): Promise<void> {
    if (!this.config.slack) return;

    const color = severity === 'error' ? 'danger' : severity === 'warning' ? 'warning' : 'good';
    
    const payload = {
      text: message,
      attachments: [{
        color,
        fields: [{
          title: 'API Performance Monitor',
          value: new Date().toISOString(),
          short: true
        }]
      }]
    };

    try {
      const response = await fetch(this.config.slack.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error('Failed to send Slack alert:', await response.text());
      }
    } catch (error) {
      console.error('Slack integration error:', error);
    }
  }

  async sendSLAViolationAlert(violations: any[]): Promise<void> {
    if (violations.length === 0) return;

    const message = `🚨 SLA Violations Detected\\n\\n${violations.map(v => 
      `• ${v.endpoint}: ${v.responseTime}ms (threshold: ${v.threshold}ms)`
    ).join('\\n')}\\n\\nTotal violations: ${violations.length}`;

    await this.sendSlackAlert(message, 'error');
  }

  async sendPerformanceReport(analytics: any): Promise<void> {
    const message = `📊 Performance Report\\n\\n` +
      `• Total Requests: ${analytics.totalRequests}\\n` +
      `• Avg Response Time: ${analytics.averageResponseTime}ms\\n` +
      `• SLA Compliance: ${analytics.slaComplianceRate}%\\n` +
      `• Error Rate: ${analytics.errorRate}%`;

    await this.sendSlackAlert(message, 'info');
  }

  private calculateEndpointStats(metrics: PerformanceMetrics[]): Record<string, any> {
    const endpointGroups = metrics.reduce((groups, metric) => {
      if (!groups[metric.endpoint]) {
        groups[metric.endpoint] = [];
      }
      groups[metric.endpoint].push(metric);
      return groups;
    }, {} as Record<string, PerformanceMetrics[]>);

    return Object.entries(endpointGroups).reduce((stats, [endpoint, endpointMetrics]) => {
      const responseTimes = endpointMetrics.map(m => m.responseTime).sort((a, b) => a - b);
      const errorCount = endpointMetrics.filter(m => m.statusCode >= 400).length;
      
      stats[endpoint] = {
        count: endpointMetrics.length,
        p50: responseTimes[Math.floor(responseTimes.length * 0.5)] || 0,
        p95: responseTimes[Math.floor(responseTimes.length * 0.95)] || 0,
        p99: responseTimes[Math.floor(responseTimes.length * 0.99)] || 0,
        errorRate: (errorCount / endpointMetrics.length) * 100
      };
      
      return stats;
    }, {});
  }

  async integrateAll(): Promise<void> {
    const metrics = await this.storage.getMetrics();
    
    // Send to all configured integrations
    const promises = [];
    
    if (this.config.datadog) {
      promises.push(this.sendToDatadog(metrics));
    }
    
    if (this.config.newrelic) {
      promises.push(this.sendToNewRelic(metrics));
    }
    
    if (this.config.prometheus) {
      promises.push(this.sendToPrometheus(metrics));
    }

    await Promise.allSettled(promises);
  }

  async setupPeriodicIntegration(intervalMs: number = 60000): Promise<void> {
    setInterval(async () => {
      await this.integrateAll();
    }, intervalMs);

    console.log(`🔄 External monitoring integration started (interval: ${intervalMs}ms)`);
  }
}
