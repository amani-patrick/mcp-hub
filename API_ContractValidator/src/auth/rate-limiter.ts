import { RateLimitConfig } from '../config/auth.js';

interface RequestRecord {
  count: number;
  resetTime: number;
  lastRequest: number;
}

export class RateLimiter {
  private config: RateLimitConfig;
  private clients: Map<string, RequestRecord> = new Map();

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async checkRateLimit(clientId: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    retryAfter?: number;
  }> {
    // If rate limiting is disabled, always allow
    if (!this.config.enabled) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: new Date(Date.now() + 60000)
      };
    }

    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window

    let record = this.clients.get(clientId);
    
    if (!record || now > record.resetTime) {
      // New client or window expired
      record = {
        count: 0,
        resetTime: now + 60000,
        lastRequest: now
      };
      this.clients.set(clientId, record);
    }

    // Clean up old records periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      this.cleanup();
    }

    const allowed = record.count < this.config.requestsPerMinute;
    const remaining = Math.max(0, this.config.requestsPerMinute - record.count);

    if (allowed) {
      record.count++;
      record.lastRequest = now;
    }

    return {
      allowed,
      remaining,
      resetTime: new Date(record.resetTime),
      retryAfter: allowed ? undefined : Math.ceil((record.resetTime - now) / 1000)
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [clientId, record] of this.clients.entries()) {
      if (now > record.resetTime) {
        this.clients.delete(clientId);
      }
    }
  }
}
