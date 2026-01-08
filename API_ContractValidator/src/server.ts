import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { validateResponse } from './tools/validate.js';
import { detectBreakingChanges } from './tools/breaking.js';
import { 
  enhancedValidateResponse,
  enhancedBreakingChanges
} from './tools/enhanced-validate.js';
import { loadSecurityConfig } from './config/auth.js';
import { AuthMiddleware } from './auth/middleware.js';
import { RateLimiter } from './auth/rate-limiter.js';

// Tool schemas
const ValidateResponseSchema = z.object({
  schema: z.any(),
  response: z.any()
});

const DetectBreakingChangesSchema = z.object({
  oldSpec: z.string(),
  newSpec: z.string()
});

export function createServer() {
  const securityConfig = loadSecurityConfig();
  const authMiddleware = new AuthMiddleware(securityConfig.auth);
  const rateLimiter = new RateLimiter(securityConfig.rateLimit);

  const server = new McpServer(
    {
      name: "api-contract-validator",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Helper function to check auth and rate limits
  async function checkSecurity(request: any): Promise<{ allowed: boolean; error?: string; context?: any }> {
    // Extract headers from request context (this may vary based on MCP transport)
    const headers = request.headers || {};
    
    // Check authentication
    const authContext = await authMiddleware.authenticate(headers);
    if (!authContext.authenticated) {
      return {
        allowed: false,
        error: authContext.error || 'Authentication failed'
      };
    }

    // Check rate limits
    const rateLimitResult = await rateLimiter.checkRateLimit(authContext.clientId);
    if (!rateLimitResult.allowed) {
      return {
        allowed: false,
        error: `Rate limit exceeded. Retry after ${rateLimitResult.retryAfter} seconds`
      };
    }

    return {
      allowed: true,
      context: { authContext, rateLimitResult }
    };
  }

  // Register basic validation tools
  server.registerTool("validate_response", {
    description: "Validate API response against a JSON schema",
    inputSchema: ValidateResponseSchema,
  }, async (args: any, extra: any) => {
    const securityCheck = await checkSecurity({ headers: extra });
    if (!securityCheck.allowed) {
      return {
        content: [{
          type: "text" as const,
          text: securityCheck.error || "Access denied"
        }],
        isError: true
      };
    }
    
    const { schema, response } = args;
    const result = validateResponse(schema, response);
    
    return {
      content: [{
        type: "text" as const,
        text: result.valid ? "Validation passed" : `Validation failed: ${result.errors.length} errors found`
      }],
      isError: !result.valid
    };
  });

  server.registerTool("detect_breaking_changes", {
    description: "Detect breaking changes between two OpenAPI specifications",
    inputSchema: DetectBreakingChangesSchema,
  }, async (args: any, extra: any) => {
    const securityCheck = await checkSecurity({ headers: extra });
    if (!securityCheck.allowed) {
      return {
        content: [{
          type: "text" as const,
          text: securityCheck.error || "Access denied"
        }],
        isError: true
      };
    }
    
    const { oldSpec, newSpec } = args;
    const result = detectBreakingChanges(oldSpec, newSpec);
    
    return {
      content: [{
        type: "text" as const,
        text: result.breaking ? 
          `Breaking changes detected: ${result.summary.breaking} breaking changes found` :
          `No breaking changes detected. ${result.summary.nonBreaking} non-breaking changes found`
      }],
      isError: false
    };
  });

  console.log(`🔐 Security: ${securityConfig.auth.enabled ? 'ENABLED' : 'DISABLED'}`);
  console.log(`⚡ Rate Limiting: ${securityConfig.rateLimit.enabled ? 'ENABLED' : 'DISABLED'}`);

  // Register enhanced validation tools
  server.registerTool(enhancedValidateResponse.name, {
    description: enhancedValidateResponse.description,
    inputSchema: enhancedValidateResponse.inputSchema,
  }, async (args: any, extra: any) => {
    const securityCheck = await checkSecurity({ headers: extra });
    if (!securityCheck.allowed) {
      return {
        content: [{
          type: "text" as const,
          text: securityCheck.error || "Access denied"
        }],
        isError: true
      };
    }
    return enhancedValidateResponse.handler(args) as any;
  });

  server.registerTool(enhancedBreakingChanges.name, {
    description: enhancedBreakingChanges.description,
    inputSchema: enhancedBreakingChanges.inputSchema,
  }, async (args: any, extra: any) => {
    const securityCheck = await checkSecurity({ headers: extra });
    if (!securityCheck.allowed) {
      return {
        content: [{
          type: "text" as const,
          text: securityCheck.error || "Access denied"
        }],
        isError: true
      };
    }
    return enhancedBreakingChanges.handler(args) as any;
  });
  
  return server;
}
