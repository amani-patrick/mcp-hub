import { AnalyticsData, PerformanceMetrics } from '../types/performance.js';
import { PerformanceMonitor } from './monitor.js';
import { MemoryStorage } from '../storage/memory.js';

export class PerformanceAnalytics {
  private storage: MemoryStorage;
  private slaThreshold: number = 1000;

  constructor() {
    this.storage = new MemoryStorage();
  }

  async getAnalytics(args: {
    timeRange: string;
    endpoint?: string;
  }): Promise<AnalyticsData> {
    const metrics = await this.storage.getMetrics(args.endpoint, args.timeRange);
    return this.generateAnalytics(metrics, args.timeRange);
  }

  private calculateSlowEndpoints(metrics: PerformanceMetrics[]): Array<{endpoint: string, avgResponseTime: number}> {
    const endpointGroups = metrics.reduce((groups, metric) => {
      if (!groups[metric.endpoint]) {
        groups[metric.endpoint] = [];
      }
      groups[metric.endpoint].push(metric);
      return groups;
    }, {} as Record<string, PerformanceMetrics[]>);

    return Object.entries(endpointGroups)
      .map(([endpoint, endpointMetrics]) => ({
        endpoint,
        avgResponseTime: endpointMetrics.reduce((sum, m) => sum + m.responseTime, 0) / endpointMetrics.length
      }))
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
      .slice(0, 5);
  }

  private generateAnalytics(metrics: PerformanceMetrics[], timeRange: string): AnalyticsData {
    const totalRequests = metrics.length;
    
    if (totalRequests === 0) {
      return {
        timeRange,
        totalRequests: 0,
        averageResponseTime: 0,
        slaComplianceRate: 100,
        slowEndpoints: [],
        errorRate: 0,
        trends: []
      };
    }

    const averageResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
    const slaViolations = metrics.filter(m => m.responseTime > this.slaThreshold);
    const slaComplianceRate = ((totalRequests - slaViolations.length) / totalRequests) * 100;
    
    const errorCount = metrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errorCount / totalRequests) * 100;

    const slowEndpoints = this.calculateSlowEndpoints(metrics);
    const trends = this.generateTrends(metrics);

    return {
      timeRange,
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      slaComplianceRate: Math.round(slaComplianceRate * 100) / 100,
      slowEndpoints,
      errorRate: Math.round(errorRate * 100) / 100,
      trends
    };
  }

  private generateTrends(metrics: PerformanceMetrics[]): Array<{timestamp: string, avgResponseTime: number, requestCount: number}> {
    const timeGroups = metrics.reduce((groups, metric) => {
      const hour = new Date(metric.timestamp).toISOString().slice(0, 13); // YYYY-MM-DDTHH
      if (!groups[hour]) {
        groups[hour] = [];
      }
      groups[hour].push(metric);
      return groups;
    }, {} as Record<string, PerformanceMetrics[]>);

    return Object.entries(timeGroups).map(([timestamp, hourMetrics]) => ({
      timestamp,
      avgResponseTime: hourMetrics.reduce((sum, m) => sum + m.responseTime, 0) / hourMetrics.length,
      requestCount: hourMetrics.length
    }));
  }

  async generatePerformanceReport(): Promise<string> {
    const analytics = await this.getAnalytics({ timeRange: '24h' });
    
    return `
Performance Analytics Report (${analytics.timeRange})
==========================================

📊 Overall Metrics:
- Total Requests: ${analytics.totalRequests}
- Average Response Time: ${analytics.averageResponseTime.toFixed(2)}ms
- SLA Compliance Rate: ${analytics.slaComplianceRate}%
- Error Rate: ${analytics.errorRate}%

🐌 Slowest Endpoints:
${analytics.slowEndpoints.map((ep, i) => 
  `${i + 1}. ${ep.endpoint}: ${ep.avgResponseTime.toFixed(2)}ms`
).join('\n')}

📈 Performance Trends:
${analytics.trends.slice(-6).map(trend => 
  `${trend.timestamp}: ${trend.avgResponseTime.toFixed(2)}ms (${trend.requestCount} requests)`
).join('\n')}
    `.trim();
  }
}
