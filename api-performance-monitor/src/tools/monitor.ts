import { PerformanceMetrics } from '../types/performance.js';
import { MemoryStorage } from '../storage/memory.js';

export class PerformanceMonitor {
  private storage: MemoryStorage;
  private slaThreshold: number = 1000; // Default 1 second SLA

  constructor() {
    this.storage = new MemoryStorage();
  }

  async recordMetrics(args: {
    endpoint: string;
    responseTime: number;
    statusCode: number;
    timestamp: string;
  }) {
    const metric: PerformanceMetrics = {
      endpoint: args.endpoint,
      responseTime: args.responseTime,
      statusCode: args.statusCode,
      timestamp: args.timestamp,
      slaCompliance: args.responseTime <= this.slaThreshold
    };

    await this.storage.store(metric);
    
    return {
      success: true,
      message: `Performance recorded for ${args.endpoint}`,
      metric: metric,
      totalMetrics: (await this.storage.getStats()).totalMetrics
    };
  }

  async getMetrics(): Promise<PerformanceMetrics[]> {
    return await this.storage.getMetrics();
  }

  setSLAThreshold(threshold: number) {
    this.slaThreshold = threshold;
  }

  async getSLAViolations(): Promise<PerformanceMetrics[]> {
    return await this.storage.getSLAViolations(this.slaThreshold);
  }

  async getAverageResponseTime(endpoint?: string): Promise<number> {
    const metrics = await this.storage.getMetrics(endpoint);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, m) => acc + m.responseTime, 0);
    return sum / metrics.length;
  }

  async getSlowEndpoints(limit: number = 5): Promise<Array<{endpoint: string, avgResponseTime: number}>> {
    return await this.storage.getSlowEndpoints(limit);
  }
}
