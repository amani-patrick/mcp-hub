import { AuthConfig } from '../config/auth.js';

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
    // If auth is disabled, allow all requests
    if (!this.config.enabled) {
      return {
        authenticated: true,
        clientId: this.generateClientId(headers)
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
    // Simple JWT validation (in production, use a proper JWT library)
    const authHeader = headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        authenticated: false,
        clientId: 'anonymous',
        error: 'JWT token required'
      };
    }

    const token = authHeader.slice(7);
    
    try {
      // This is a simplified validation - use proper JWT verification in production
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      return {
        authenticated: true,
        clientId: `jwt-${payload.sub || payload.user_id}`,
        userId: payload.sub || payload.user_id
      };
    } catch (error) {
      return {
        authenticated: false,
        clientId: 'anonymous',
        error: 'Invalid JWT token'
      };
    }
  }

  private generateClientId(headers: Record<string, string>): string {
    // Generate a client ID from request headers for rate limiting
    const userAgent = headers['user-agent'] || 'unknown';
    const forwarded = headers['x-forwarded-for'] || headers['x-real-ip'] || 'localhost';
    
    // Simple hash for client identification
    return `client-${Buffer.from(`${forwarded}-${userAgent}`).toString('base64').slice(0, 16)}`;
  }
}
