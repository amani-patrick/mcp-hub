import { PerformanceMetrics } from '../types/performance.js';

export class MemoryStorage {
  private metrics: PerformanceMetrics[] = [];
  private maxSize: number = 10000; // max number of metrics to store

  async store(metric: PerformanceMetrics): Promise<void> {
    this.metrics.push(metric);
    
    //limiting storage size
    if (this.metrics.length > this.maxSize) {
      this.metrics = this.metrics.slice(-this.maxSize);
    }
  }

  async getMetrics(endpoint?: string, timeRange?: string): Promise<PerformanceMetrics[]> {
    let filtered = this.metrics;

    if (endpoint) {
      filtered = filtered.filter(m => m.endpoint === endpoint);
    }

    if (timeRange) {
      const cutoff = this.getTimeRangeCutoff(timeRange);
      filtered = filtered.filter(m => new Date(m.timestamp) >= cutoff);
    }

    return filtered;
  }

  async getMetricsByTimeRange(timeRange: string): Promise<PerformanceMetrics[]> {
    const cutoff = this.getTimeRangeCutoff(timeRange);
    return this.metrics.filter(m => new Date(m.timestamp) >= cutoff);
  }

  async getSlowEndpoints(limit: number = 5): Promise<Array<{endpoint: string, avgResponseTime: number}>> {
    const endpointGroups = this.metrics.reduce((groups, metric) => {
      if (!groups[metric.endpoint]) {
        groups[metric.endpoint] = [];
      }
      groups[metric.endpoint].push(metric);
      return groups;
    }, {} as Record<string, PerformanceMetrics[]>);

    return Object.entries(endpointGroups)
      .map(([endpoint, metrics]) => ({
        endpoint,
        avgResponseTime: metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length
      }))
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
      .slice(0, limit);
  }

  async getSLAViolations(threshold: number): Promise<PerformanceMetrics[]> {
    return this.metrics.filter(m => m.responseTime > threshold);
  }

  async getErrorMetrics(): Promise<PerformanceMetrics[]> {
    return this.metrics.filter(m => m.statusCode >= 400);
  }

  async clear(): Promise<void> {
    this.metrics = [];
  }

  async getStats(): Promise<{
    totalMetrics: number;
    uniqueEndpoints: number;
    oldestMetric?: string;
    newestMetric?: string;
  }> {
    const uniqueEndpoints = new Set(this.metrics.map(m => m.endpoint)).size;
    const sortedMetrics = [...this.metrics].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return {
      totalMetrics: this.metrics.length,
      uniqueEndpoints,
      oldestMetric: sortedMetrics[0]?.timestamp,
      newestMetric: sortedMetrics[sortedMetrics.length - 1]?.timestamp
    };
  }

  private getTimeRangeCutoff(timeRange: string): Date {
    const now = new Date();
    
    switch (timeRange) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 60 * 60 * 1000);
    }
  }
}