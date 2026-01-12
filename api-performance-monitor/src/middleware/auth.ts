import { Request, Response, NextFunction } from 'express';

export interface AuthConfig {
  apiKey?: string;
  jwtSecret?: string;
  basicAuth?: { username: string; password: string };
  enableAuth: boolean;
}

export class AuthMiddleware {
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  middleware = (req: Request, res: Response, next: NextFunction) => {
    if (!this.config.enableAuth) {
      return next();
    }

    // API Key Authentication
    if (this.config.apiKey) {
      const apiKey = req.headers['x-api-key'] as string;
      if (apiKey !== this.config.apiKey) {
        return res.status(401).json({ error: 'Invalid API key' });
      }
      return next();
    }

    // Basic Authentication
    if (this.config.basicAuth) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Basic auth required' });
      }

      const credentials = Buffer.from(authHeader.slice(6), 'base64').toString();
      const [username, password] = credentials.split(':');

      if (username !== this.config.basicAuth.username || 
          password !== this.config.basicAuth.password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      return next();
    }

    // JWT Authentication (simplified)
    if (this.config.jwtSecret) {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'JWT token required' });
      }
      
      // In production, use proper JWT library
      try {
        // Verify JWT token here
        return next();
      } catch (error) {
        return res.status(401).json({ error: 'Invalid JWT token' });
      }
    }

    next();
  };
}

// MCP Tool Authentication
export class MCPAuth {
  public config: AuthConfig; // Made public

  constructor(config: AuthConfig) {
    this.config = config;
  }

  authenticate(toolCall: any, context?: any): boolean {
    if (!this.config.enableAuth) {
      return true;
    }

    // Check for API key in context
    if (this.config.apiKey && context?.apiKey === this.config.apiKey) {
      return true;
    }

    // Check for user authentication
    if (context?.authenticated === true) {
      return true;
    }

    return false;
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    return headers;
  }
}
