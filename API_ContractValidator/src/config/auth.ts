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
  const authEnabled = loadEnvVar('MCP_AUTH_ENABLED', false, 'boolean');
  const authType = loadEnvVar('MCP_AUTH_TYPE', 'api_key') as 'api_key' | 'jwt' | 'none';
  const apiKey = loadEnvVar('MCP_API_KEY', '');
  const jwtSecret = loadEnvVar('MCP_JWT_SECRET', '');

  if (authEnabled && authType === 'api_key' && !apiKey) {
    console.warn('MCP_AUTH_ENABLED is true but MCP_API_KEY is empty; HTTP requests will be rejected unless MCP_AUTH_STRICT=false on stdio');
  }

  if (authEnabled && authType === 'jwt' && !jwtSecret) {
    console.warn('MCP_AUTH_ENABLED is true with JWT auth but MCP_JWT_SECRET is empty');
  }

  return {
    auth: {
      enabled: authEnabled,
      type: authType,
      apiKey,
      jwtSecret
    },
    rateLimit: {
      enabled: loadEnvVar('MCP_RATE_LIMIT_ENABLED', false, 'boolean'),
      requestsPerMinute: loadEnvVar('MCP_RPM', 1000, 'number'),
      burstLimit: loadEnvVar('MCP_BURST_LIMIT', 100, 'number')
    }
  };
}
