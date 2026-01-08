interface SecurityVulnerability {
  type: 'injection' | 'xss' | 'auth' | 'data-exposure' | 'config';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
  path: string;
  cwe?: string; 
}

interface SecurityRule {
  id: string;
  name: string;
  check: (spec: any) => SecurityVulnerability[];
}

interface Operation {
    parameters?: any[];
    requestBody?: any;
    responses?: any;
    security?: any[];
}

export class SecurityScanner {
  private rules: SecurityRule[] = [];

  constructor() {
    this.initializeRules();
  }

  private initializeRules() {
    // SQL Injection detection
    this.rules.push({
      id: 'sql-injection',
      name: 'SQL Injection Risk',
      check: (spec: any) => this.checkSQLInjection(spec)
    });

    // XSS detection
    this.rules.push({
      id: 'xss-risk',
      name: 'Cross-Site Scripting Risk',
      check: (spec: any) => this.checkXSS(spec)
    });

    // Authentication issues
    this.rules.push({
      id: 'auth-issues',
      name: 'Authentication Issues',
      check: (spec: any) => this.checkAuthentication(spec)
    });

    // Data exposure
    this.rules.push({
      id: 'data-exposure',
      name: 'Sensitive Data Exposure',
      check: (spec: any) => this.checkDataExposure(spec)
    });

    // Configuration issues
    this.rules.push({
      id: 'config-issues',
      name: 'Security Configuration',
      check: (spec: any) => this.checkSecurityConfig(spec)
    });
  }

  scan(spec: any): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    for (const rule of this.rules) {
      try {
        const results = rule.check(spec);
        vulnerabilities.push(...results);
      } catch (error) {
        console.error(`Security rule ${rule.id} failed:`, error);
      }
    }
    
    return vulnerabilities.sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity));
  }

  private checkSQLInjection(spec: any): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];
    const sqlPatterns = [
      /\b(select|insert|update|delete|drop|create|alter)\s+/i,
      /\bunion\s+select\b/i,
      /['"]\s*;\s*\w+/i,
      /\b(or|and)\s+\d+\s*=\s*\d+/i
    ];

    if (spec.paths) {
      for (const [path, pathItem] of Object.entries(spec.paths)) {
        for (const [method, operation] of Object.entries(pathItem as any)) {
          const op = operation as Operation;
          if (op) {
            // Check parameters
            const params = op.parameters || [];
            for (const param of params) {
              if (param.name && param.schema && param.schema.description) {
                const description = param.schema.description.toLowerCase();
                if (sqlPatterns.some(pattern => pattern.test(description))) {
                  vulnerabilities.push({
                    type: 'injection',
                    severity: 'high',
                    description: `Parameter "${param.name}" may be vulnerable to SQL injection`,
                    recommendation: 'Use parameterized queries and input validation',
                    path: `${path}.${method}.parameters.${param.name}`,
                    cwe: 'CWE-89'
                  });
                }
              }
            }

            // Check request body
            if ((op as any).requestBody?.content) {
              for (const [contentType, content] of Object.entries((op as any).requestBody.content)) {
                const schema = (content as any).schema;
                if (schema && schema.properties) {
                  for (const [propName, prop] of Object.entries(schema.properties)) {
                    const propSchema = prop as any;
                    if (propSchema.description) {
                      const description = propSchema.description.toLowerCase();
                      if (sqlPatterns.some(pattern => pattern.test(description))) {
                        vulnerabilities.push({
                          type: 'injection',
                          severity: 'high',
                          description: `Property "${propName}" may be vulnerable to SQL injection`,
                          recommendation: 'Use parameterized queries and input validation',
                          path: `${path}.${method}.requestBody.content.${contentType}.schema.properties.${propName}`,
                          cwe: 'CWE-89'
                        });
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return vulnerabilities;
  }

  private checkXSS(spec: any): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];

    if (spec.paths) {
      for (const [path, pathItem] of Object.entries(spec.paths)) {
        for (const [method, operation] of Object.entries(pathItem as any)) {
          const op = operation as Operation;
          if (op) {
            // Check for HTML content types without sanitization
            if ((op as any).responses) {
              for (const [statusCode, response] of Object.entries((op as any).responses)) {
                const resp = response as any;
                if (resp.content) {
                  for (const [contentType, content] of Object.entries(resp.content)) {
                    if (contentType.includes('text/html') || contentType.includes('application/json')) {
                      const schema = (content as any).schema;
                      if (schema && schema.type === 'string') {
                        vulnerabilities.push({
                          type: 'xss',
                          severity: 'medium',
                          description: `Response may contain unescaped HTML content`,
                          recommendation: 'Implement proper output encoding and Content Security Policy',
                          path: `${path}.${method}.responses.${statusCode}.content.${contentType}`,
                          cwe: 'CWE-79'
                        });
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return vulnerabilities;
  }

  private checkAuthentication(spec: any): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    if (spec.paths) {
      for (const [path, pathItem] of Object.entries(spec.paths)) {
        for (const [method, operation] of Object.entries(pathItem as any)) {
          const op = operation as Operation;
          if (op) {
            // Check for missing authentication on sensitive operations
            const hasAuth = (op as any).security && (op as any).security.length > 0;
            const isSensitiveMethod = ['post', 'put', 'delete', 'patch'].includes(method.toLowerCase());
            
            if (isSensitiveMethod && !hasAuth) {
              vulnerabilities.push({
                type: 'auth',
                severity: 'high',
                description: `Sensitive operation ${method.toUpperCase()} ${path} lacks authentication`,
                recommendation: 'Implement proper authentication and authorization',
                path: `${path}.${method}.security`,
                cwe: 'CWE-306'
              });
            }

            // Check for weak authentication methods
            if (hasAuth && (op as any).security) {
              for (const securityScheme of (op as any).security) {
                const schemeNames = Object.keys(securityScheme);
                for (const schemeName of schemeNames) {
                  if (schemeName === 'basic') {
                    vulnerabilities.push({
                      type: 'auth',
                      severity: 'medium',
                      description: 'Using Basic Authentication without HTTPS',
                      recommendation: 'Use OAuth 2.0 or JWT with HTTPS',
                      path: `${path}.${method}.security.${schemeName}`,
                      cwe: 'CWE-525'
                    });
                  }
                }
              }
            }
          }
        }
      }
    }

    return vulnerabilities;
  }

  private checkDataExposure(spec: any): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];
    const sensitiveFields = [
      'password', 'passwd', 'secret', 'token', 'key', 'credit',
      'ssn', 'social', 'pin', 'cvv', 'expiry', 'account'
    ];

    if (spec.paths) {
      for (const [path, pathItem] of Object.entries(spec.paths)) {
        for (const [method, operation] of Object.entries(pathItem as any)) {
          const op = operation as Operation;
          if (op) {
            // Check responses for sensitive data exposure
            if ((op as any).responses) {
              for (const [statusCode, response] of Object.entries((op as any).responses)) {
                const resp = response as any;
                if (resp.content) {
                  for (const [contentType, content] of Object.entries(resp.content)) {
                    const schema = (content as any).schema;
                    if (schema && schema.properties) {
                      for (const [propName, prop] of Object.entries(schema.properties)) {
                        const lowerPropName = propName.toLowerCase();
                        if (sensitiveFields.some(field => lowerPropName.includes(field))) {
                          // Check if it's in a GET response (potential data leak)
                          if (method.toLowerCase() === 'get') {
                            vulnerabilities.push({
                              type: 'data-exposure',
                              severity: 'medium',
                              description: `Sensitive field "${propName}" exposed in GET response`,
                              recommendation: 'Remove sensitive data from GET responses or implement proper access controls',
                              path: `${path}.${method}.responses.${statusCode}.content.${contentType}.schema.properties.${propName}`,
                              cwe: 'CWE-200'
                            });
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return vulnerabilities;
  }

  private checkSecurityConfig(spec: any): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Check for HTTPS enforcement
    if (spec.schemes && !spec.schemes.includes('https')) {
      vulnerabilities.push({
        type: 'config',
        severity: 'high',
        description: 'API does not enforce HTTPS',
        recommendation: 'Enforce HTTPS for all API communications',
        path: 'schemes',
        cwe: 'CWE-319'
      });
    }

    // Check for security schemes
    if (!spec.components?.securitySchemes && !spec.securityDefinitions) {
      vulnerabilities.push({
        type: 'config',
        severity: 'medium',
        description: 'No security schemes defined',
        recommendation: 'Define proper security schemes (OAuth 2.0, JWT, API Keys)',
        path: 'components.securitySchemes',
        cwe: 'CWE-1188'
      });
    }

    // Check for rate limiting
    let hasRateLimiting = false;
    if (spec.paths) {
      for (const pathItem of Object.values(spec.paths)) {
        for (const operation of Object.values(pathItem as any)) {
          const op = operation as Operation;
          if (op) {
            const extensions = Object.keys(op).filter(key => key.startsWith('x-ratelimit'));
            if (extensions.length > 0) {
              hasRateLimiting = true;
              break;
            }
          }
        }
      }
    }

    if (!hasRateLimiting) {
      vulnerabilities.push({
        type: 'config',
        severity: 'low',
        description: 'No rate limiting configured',
        recommendation: 'Implement rate limiting to prevent abuse',
        path: 'global',
        cwe: 'CWE-770'
      });
    }

    return vulnerabilities;
  }

  private getSeverityWeight(severity: string): number {
    const weights = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    };
    return weights[severity as keyof typeof weights] || 0;
  }
}
