export interface PerformanceMetrics {
  endpoint: string;
  responseTime: number;
  statusCode: number;
  timestamp: string;
  slaCompliance: boolean;
}

export interface AnalyticsData {
  timeRange: string;
  totalRequests: number;
  averageResponseTime: number;
  slaComplianceRate: number;
  slowEndpoints: Array<{endpoint: string, avgResponseTime: number}>;
  errorRate: number;
  trends: Array<{
    timestamp: string;
    avgResponseTime: number;
    requestCount: number;
  }>;
}

export interface SLAViolation {
  endpoint: string;
  responseTime: number;
  timestamp: string;
  threshold: number;
  violationAmount: number;
}
