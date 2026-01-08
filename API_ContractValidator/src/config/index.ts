import dotenv from 'dotenv';

dotenv.config();

export const authConfig = {
  enabled: process.env.MCP_AUTH_ENABLED === 'true',
  apiKey: process.env.MCP_API_KEY,
};

export const rateLimitConfig = {
  enabled: process.env.MCP_RATE_LIMIT_ENABLED === 'true',
  requestsPerMinute: process.env.MCP_RPM ? parseInt(process.env.MCP_RPM, 10) : 60,
};
