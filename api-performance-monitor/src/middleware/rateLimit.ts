import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  middleware = (req: Request, res: Response, next: NextFunction) => {
    const key = this.getKey(req);
    const now = Date.now();
    
    if (!this.store[key] || now > this.store[key].resetTime) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs
      };
      return next();
    }

    if (this.store[key].count >= this.maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((this.store[key].resetTime - now) / 1000)
      });
    }

    this.store[key].count++;
    next();
  };

  private getKey(req: Request): string {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    });
  }
}

// MCP Tool Rate Limiting
export class MCPRateLimiter {
  private calls: Map<string, number[]> = new Map();
  private windowMs: number;
  public maxCalls: number; // Made public

  constructor(windowMs: number = 60000, maxCalls: number = 50) {
    this.windowMs = windowMs;
    this.maxCalls = maxCalls;
  }

  checkLimit(toolName: string, clientId: string = 'default'): boolean {
    const key = `${toolName}:${clientId}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.calls.has(key)) {
      this.calls.set(key, [now]);
      return true;
    }

    const timestamps = this.calls.get(key)!;
    const recentCalls = timestamps.filter(time => time > windowStart);

    if (recentCalls.length >= this.maxCalls) {
      return false;
    }

    recentCalls.push(now);
    this.calls.set(key, recentCalls);
    return true;
  }

  getRemainingCalls(toolName: string, clientId: string = 'default'): number {
    const key = `${toolName}:${clientId}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.calls.has(key)) {
      return this.maxCalls;
    }

    const timestamps = this.calls.get(key)!;
    const recentCalls = timestamps.filter(time => time > windowStart);
    
    return Math.max(0, this.maxCalls - recentCalls.length);
  }
}
