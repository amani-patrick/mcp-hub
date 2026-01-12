import { PerformanceMetrics } from '../types/performance.js';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export class FileStorage {
  private filePath: string;
  private backupPath: string;

  constructor(dataDir: string = './data') {
    // Ensure data directory exists
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    
    this.filePath = join(dataDir, 'performance-metrics.json');
    this.backupPath = join(dataDir, 'performance-metrics.backup.json');
  }

  async store(metric: PerformanceMetrics): Promise<void> {
    const metrics = await this.loadMetrics();
    metrics.push(metric);
    
    //Last 50000 metrics to prevent file size issues
    if (metrics.length > 50000) {
      metrics.splice(0, metrics.length - 50000);
    }
    
    await this.saveMetrics(metrics);
  }

  async getMetrics(endpoint?: string, timeRange?: string): Promise<PerformanceMetrics[]> {
    const metrics = await this.loadMetrics();
    let filtered = metrics;

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
    const metrics = await this.loadMetrics();
    const cutoff = this.getTimeRangeCutoff(timeRange);
    return metrics.filter(m => new Date(m.timestamp) >= cutoff);
  }

  async getSlowEndpoints(limit: number = 5): Promise<Array<{endpoint: string, avgResponseTime: number}>> {
    const metrics = await this.loadMetrics();
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
      .slice(0, limit);
  }

  async getSLAViolations(threshold: number): Promise<PerformanceMetrics[]> {
    const metrics = await this.loadMetrics();
    return metrics.filter(m => m.responseTime > threshold);
  }

  async getErrorMetrics(): Promise<PerformanceMetrics[]> {
    const metrics = await this.loadMetrics();
    return metrics.filter(m => m.statusCode >= 400);
  }

  async clear(): Promise<void> {
    // Create backup before clearing
    if (existsSync(this.filePath)) {
      try {
        const backup = readFileSync(this.filePath, 'utf8');
        writeFileSync(this.backupPath, backup);
      } catch (error) {
        console.error('Failed to create backup:', error);
      }
    }
    
    await this.saveMetrics([]);
  }

  async getStats(): Promise<{
    totalMetrics: number;
    uniqueEndpoints: number;
    oldestMetric?: string;
    newestMetric?: string;
    fileSize: number;
  }> {
    const metrics = await this.loadMetrics();
    const uniqueEndpoints = new Set(metrics.map(m => m.endpoint)).size;
    const sortedMetrics = [...metrics].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let fileSize = 0;
    if (existsSync(this.filePath)) {
      const stats = require('fs').statSync(this.filePath);
      fileSize = stats.size;
    }

    return {
      totalMetrics: metrics.length,
      uniqueEndpoints,
      oldestMetric: sortedMetrics[0]?.timestamp,
      newestMetric: sortedMetrics[sortedMetrics.length - 1]?.timestamp,
      fileSize
    };
  }

  async exportToCSV(): Promise<string> {
    const metrics = await this.loadMetrics();
    
    const headers = ['endpoint', 'responseTime', 'statusCode', 'timestamp', 'slaCompliance'];
    const csvRows = [headers.join(',')];
    
    for (const metric of metrics) {
      const row = [
        `"${metric.endpoint}"`,
        metric.responseTime.toString(),
        metric.statusCode.toString(),
        `"${metric.timestamp}"`,
        metric.slaCompliance.toString()
      ];
      csvRows.push(row.join(','));
    }
    
    return csvRows.join('\n');
  }

  async importFromCSV(csvData: string): Promise<number> {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    
    const metrics: PerformanceMetrics[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',');
      const metric: PerformanceMetrics = {
        endpoint: values[0].replace(/"/g, ''),
        responseTime: parseFloat(values[1]),
        statusCode: parseInt(values[2]),
        timestamp: values[3].replace(/"/g, ''),
        slaCompliance: values[4] === 'true'
      };
      
      metrics.push(metric);
    }
    
    await this.saveMetrics(metrics);
    return metrics.length;
  }

  private async loadMetrics(): Promise<PerformanceMetrics[]> {
    try {
      if (!existsSync(this.filePath)) {
        return [];
      }
      
      const data = readFileSync(this.filePath, 'utf8');
      return JSON.parse(data) as PerformanceMetrics[];
    } catch (error) {
      console.error('Failed to load metrics:', error);
      return [];
    }
  }

  private async saveMetrics(metrics: PerformanceMetrics[]): Promise<void> {
    try {
      writeFileSync(this.filePath, JSON.stringify(metrics, null, 2));
    } catch (error) {
      console.error('Failed to save metrics:', error);
      throw error;
    }
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