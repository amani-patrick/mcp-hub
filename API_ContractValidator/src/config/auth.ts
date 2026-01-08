export interface AuthConfig {
  enabled: boolean;
  type: 'api_key' | 'jwt' | 'none';
  apiKey?: string;
  jwtSecret?: string;
}

export interface RateLimitConfig {
  enabled: boolean;
  requestsPerMinute: number;
  burstLimit: number;
}

export interface SecurityConfig {
  auth: AuthConfig;
  rateLimit: RateLimitConfig;
}

function loadEnvVar(key: string, defaultValue: any, type: 'boolean' | 'number' | 'string' = 'string'): any {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  
  switch (type) {
    case 'boolean':
      return value.toLowerCase() === 'true';
    case 'number':
      return parseInt(value, 10);
    default:
      return value;
  }
}

export function loadSecurityConfig(): SecurityConfig {
  return {
    auth: {
      enabled: loadEnvVar('MCP_AUTH_ENABLED', false, 'boolean'),
      type: (loadEnvVar('MCP_AUTH_TYPE', 'api_key') as 'api_key' | 'jwt' | 'none'),
      apiKey: loadEnvVar('MCP_API_KEY', ''),
      jwtSecret: loadEnvVar('MCP_JWT_SECRET', '')
    },
    rateLimit: {
      enabled: loadEnvVar('MCP_RATE_LIMIT_ENABLED', false, 'boolean'),
      requestsPerMinute: loadEnvVar('MCP_RPM', 1000, 'number'), // High default for local
      burstLimit: loadEnvVar('MCP_BURST_LIMIT', 100, 'number')
    }
  };
}
