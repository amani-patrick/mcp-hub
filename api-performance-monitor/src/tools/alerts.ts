import { AlertConfig, SLAViolation } from '../types/alerts.js';
import { MemoryStorage } from '../storage/memory.js';

export class SLAAlerts {
  private storage: MemoryStorage;

  constructor() {
    this.storage = new MemoryStorage();
  }

  async checkSLA(args: AlertConfig): Promise<{
    success: boolean;
    violations: SLAViolation[];
    complianceRate: number;
    recommendations: string[];
  }> {
    const violations: SLAViolation[] = [];
    let totalRequests = 0;

    for (const endpoint of args.endpoints) {
      // Get actual metrics for this endpoint from storage
      const endpointMetrics = await this.storage.getMetrics(endpoint, args.timeWindow);
      totalRequests += endpointMetrics.length;
      
      // Find actual SLA violations
      const endpointViolations = endpointMetrics
        .filter(m => m.responseTime > args.slaThreshold)
        .map(m => ({
          endpoint: m.endpoint,
          responseTime: m.responseTime,
          timestamp: m.timestamp,
          threshold: args.slaThreshold,
          violationAmount: m.responseTime - args.slaThreshold
        }));
      
      violations.push(...endpointViolations);
    }

    const complianceRate = totalRequests > 0 
      ? ((totalRequests - violations.length) / totalRequests) * 100 
      : 100;

    const recommendations = this.generateRecommendations(violations);

    return {
      success: true,
      violations,
      complianceRate: Math.round(complianceRate * 100) / 100,
      recommendations
    };
  }

  private generateRecommendations(violations: SLAViolation[]): string[] {
    const recommendations: string[] = [];

    if (violations.length > 0) {
      recommendations.push('Consider implementing response caching');
      recommendations.push('Optimize database queries');
      recommendations.push('Add CDN for static assets');
      recommendations.push('Review endpoint performance bottlenecks');
    }

    if (violations.some(v => v.violationAmount > 1000)) {
      recommendations.push('URGENT: Critical performance issues detected');
    }

    return recommendations;
  }

  async getActiveAlerts(): Promise<SLAViolation[]> {
    const allMetrics = await this.storage.getMetrics();
    const threshold = 1000; // Default SLA threshold
    
    return allMetrics
      .filter(m => m.responseTime > threshold)
      .map(m => ({
        endpoint: m.endpoint,
        responseTime: m.responseTime,
        timestamp: m.timestamp,
        threshold,
        violationAmount: m.responseTime - threshold
      }))
      .filter(v => 
        new Date(v.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
      );
  }
}