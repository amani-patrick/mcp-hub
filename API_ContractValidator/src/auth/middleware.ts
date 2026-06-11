import crypto from 'crypto';
import { AuthConfig } from '../config/auth.js';
import { shouldBypassStdioAuth } from '../utils/transport.js';

export interface AuthContext {
  authenticated: boolean;
  clientId: string;
  userId?: string;
  error?: string;
}

export class AuthMiddleware {
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  async authenticate(headers: Record<string, string>): Promise<AuthContext> {
    if (!this.config.enabled) {
      return {
        authenticated: true,
        clientId: this.generateClientId(headers)
      };
    }

    if (shouldBypassStdioAuth(this.config.enabled)) {
      return {
        authenticated: true,
        clientId: 'stdio-local',
        userId: 'stdio-user'
      };
    }

    switch (this.config.type) {
      case 'api_key':
        return this.authenticateApiKey(headers);
      case 'jwt':
        return this.authenticateJwt(headers);
      case 'none':
      default:
        return {
          authenticated: true,
          clientId: this.generateClientId(headers)
        };
    }
  }

  private authenticateApiKey(headers: Record<string, string>): AuthContext {
    if (!this.config.apiKey) {
      return {
        authenticated: false,
        clientId: 'anonymous',
        error: 'API key not configured (set MCP_API_KEY)'
      };
    }

    const authHeader = headers['authorization'] || headers['x-api-key'];

    if (!authHeader) {
      return {
        authenticated: false,
        clientId: 'anonymous',
        error: 'API key required'
      };
    }

    const apiKey = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (apiKey !== this.config.apiKey) {
      return {
        authenticated: false,
        clientId: 'anonymous',
        error: 'Invalid API key'
      };
    }

    return {
      authenticated: true,
      clientId: `api-key-${apiKey.slice(0, 8)}`,
      userId: 'api-user'
    };
  }

  private authenticateJwt(headers: Record<string, string>): AuthContext {
    const authHeader = headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        authenticated: false,
        clientId: 'anonymous',
        error: 'JWT token required'
      };
    }

    const token = authHeader.slice(7);
    const parts = token.split('.');

    if (parts.length !== 3) {
      return {
        authenticated: false,
        clientId: 'anonymous',
        error: 'Invalid JWT token'
      };
    }

    if (!this.config.jwtSecret) {
      return {
        authenticated: false,
        clientId: 'anonymous',
        error: 'JWT secret not configured (set MCP_JWT_SECRET)'
      };
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.config.jwtSecret)
        .update(`${parts[0]}.${parts[1]}`)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      if (parts[2] !== expectedSignature) {
        return {
          authenticated: false,
          clientId: 'anonymous',
          error: 'Invalid JWT signature'
        };
      }

      const payload = JSON.parse(
        Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
      );

      return {
        authenticated: true,
        clientId: `jwt-${payload.sub || payload.user_id || 'user'}`,
        userId: payload.sub || payload.user_id
      };
    } catch {
      return {
        authenticated: false,
        clientId: 'anonymous',
        error: 'Invalid JWT token'
      };
    }
  }

  private generateClientId(headers: Record<string, string>): string {
    const userAgent = headers['user-agent'] || 'unknown';
    const forwarded = headers['x-forwarded-for'] || headers['x-real-ip'] || 'localhost';

    return `client-${Buffer.from(`${forwarded}-${userAgent}`).toString('base64').slice(0, 16)}`;
  }
}
