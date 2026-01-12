export interface SLAViolation {
  endpoint: string;
  responseTime: number;
  timestamp: string;
  threshold: number;
  violationAmount: number;
}

export interface AlertConfig {
  slaThreshold: number;
  timeWindow: string;
  endpoints: string[];
}