import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { authConfig, rateLimitConfig } from '../config/index.js';

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!authConfig.enabled) {
    return next();
  }

  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === authConfig.apiKey) {
    return next();
  }

  res.status(401).json({ error: 'Unauthorized' });
};

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: rateLimitConfig.requestsPerMinute,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests, please try again later.',
    });
  },
  skip: () => !rateLimitConfig.enabled,
});
