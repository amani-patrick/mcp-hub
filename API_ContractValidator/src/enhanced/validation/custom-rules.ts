interface CustomRule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  validate: (spec: any) => RuleResult[];
}

interface RuleResult {
  rule: string;
  message: string;
  path: string;
  severity: 'error' | 'warning' | 'info';
}

interface CompanyStandards {
  namingConvention: 'camelCase' | 'snake_case' | 'kebab-case';
  requiredFields: string[];
  maxResponseTime: number; // ms
  securityHeaders: string[];
  documentationRequirements: {
    descriptionRequired: boolean;
    examplesRequired: boolean;
    schemaRequired: boolean;
  };
}

interface Operation {
    operationId?: string;
    responses?: any;
    description?: string;
}

export class CustomRuleEngine {
  private rules: Map<string, CustomRule> = new Map();
  private standards: CompanyStandards;

  constructor(standards: CompanyStandards) {
    this.standards = standards;
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    // Naming convention rule
    this.addRule({
      id: 'naming-convention',
      name: 'Naming Convention',
      description: 'Ensures API follows company naming standards',
      severity: 'warning',
      validate: (spec: any) => this.validateNaming(spec)
    });

    // Performance rule
    this.addRule({
      id: 'performance-check',
      name: 'Performance Requirements',
      description: 'Validates response time requirements',
      severity: 'warning',
      validate: (spec: any) => this.validatePerformance(spec)
    });

    // Security headers rule
    this.addRule({
      id: 'security-headers',
      name: 'Security Headers',
      description: 'Ensures required security headers are documented',
      severity: 'error',
      validate: (spec: any) => this.validateSecurityHeaders(spec)
    });

    // Documentation completeness rule
    this.addRule({
      id: 'documentation-complete',
      name: 'Documentation Completeness',
      description: 'Validates documentation requirements',
      severity: 'warning',
      validate: (spec: any) => this.validateDocumentation(spec)
    });
  }

  addRule(rule: CustomRule) {
    this.rules.set(rule.id, rule);
  }

  validate(spec: any): RuleResult[] {
    const results: RuleResult[] = [];
    
    for (const rule of this.rules.values()) {
      try {
        const ruleResults = rule.validate(spec);
        results.push(...ruleResults);
      } catch (error) {
        results.push({
          rule: rule.id,
          message: `Rule execution failed: ${error}`,
          path: '',
          severity: 'error'
        });
      }
    }
    
    return results;
  }

  private validateNaming(spec: any): RuleResult[] {
    const results: RuleResult[] = [];
    
    if (spec.paths) {
      for (const [path, pathItem] of Object.entries(spec.paths)) {
        // Check path naming convention
        if (!this.followsNamingConvention(path)) {
          results.push({
            rule: 'naming-convention',
            message: `Path "${path}" does not follow ${this.standards.namingConvention} naming convention`,
            path: path,
            severity: 'warning'
          });
        }
        
        // Check operation IDs
        for (const [method, operation] of Object.entries(pathItem as any)) {
          if (operation && typeof operation === 'object' && (operation as any).responses) {
            const op = operation as Operation;
            if (op.operationId && !this.followsNamingConvention(op.operationId)) {
              results.push({
                rule: 'naming-convention',
                message: `Operation ID "${op.operationId}" does not follow ${this.standards.namingConvention} naming convention`,
                path: `${path}.${method}`,
                severity: 'warning'
              });
            }
          }
        }
      }
    }
    
    return results;
  }

  private validatePerformance(spec: any): RuleResult[] {
    const results: RuleResult[] = [];
    
    // Check for performance annotations
    if (spec.paths) {
      for (const [path, pathItem] of Object.entries(spec.paths)) {
        for (const [method, operation] of Object.entries(pathItem as any)) {
          if (operation && typeof operation === 'object') {
            const op = operation as any;
            const extensions = (op as any)['x-performance'] || (op as any)['x-response-time'];
            if (extensions && extensions > this.standards.maxResponseTime) {
              results.push({
                rule: 'performance-check',
                message: `Expected response time ${extensions}ms exceeds maximum ${this.standards.maxResponseTime}ms`,
                path: `${path}.${method}`,
                severity: 'warning'
              });
            }
          }
        }
      }
    }
    
    return results;
  }

  private validateSecurityHeaders(spec: any): RuleResult[] {
    const results: RuleResult[] = [];
    
    if (spec.paths) {
      for (const [path, pathItem] of Object.entries(spec.paths)) {
        for (const [method, operation] of Object.entries(pathItem as any)) {
          const op = operation as Operation;
          if (op && op.responses) {
            const successResponse = op.responses['200'] || op.responses['201'];
            if (successResponse && successResponse.headers) {
              const missingHeaders = this.standards.securityHeaders.filter(
                header => !(header in successResponse.headers)
              );
              
              if (missingHeaders.length > 0) {
                results.push({
                  rule: 'security-headers',
                  message: `Missing security headers: ${missingHeaders.join(', ')}`,
                  path: `${path}.${method}.responses.200.headers`,
                  severity: 'error'
                });
              }
            }
          }
        }
      }
    }
    
    return results;
  }

  private validateDocumentation(spec: any): RuleResult[] {
    const results: RuleResult[] = [];
    let score = 100;
    
    // Check overall spec documentation
    if (!spec.info?.description) {
      results.push({
        rule: 'documentation-complete',
        message: 'API description is missing',
        path: 'info.description',
        severity: 'warning'
      });
      score -= 10;
    }
    
    if (spec.paths) {
      let totalOperations = 0;
      let documentedOperations = 0;
      
      for (const [path, pathItem] of Object.entries(spec.paths)) {
        for (const [method, operation] of Object.entries(pathItem as any)) {
          if (operation && typeof operation === 'object' && method !== 'parameters') {
            const op = operation as Operation;
            totalOperations++;
            
            if (this.standards.documentationRequirements.descriptionRequired && !op.description) {
              results.push({
                rule: 'documentation-complete',
                message: `Operation description is missing`,
                path: `${path}.${method}.description`,
                severity: 'warning'
              });
            } else {
              documentedOperations++;
            }
            
            // Check for examples
            if (this.standards.documentationRequirements.examplesRequired) {
              const hasExamples = this.hasExamples(operation);
              if (!hasExamples) {
                results.push({
                  rule: 'documentation-complete',
                  message: `Operation examples are missing`,
                  path: `${path}.${method}`,
                  severity: 'warning'
                });
              }
            }
          }
        }
      }
      
      const documentationScore = Math.round((documentedOperations / totalOperations) * 100);
      results.push({
        rule: 'documentation-complete',
        message: `Documentation completeness score: ${documentationScore}%`,
        path: 'overall',
        severity: 'info'
      });
    }
    
    return results;
  }

  private followsNamingConvention(name: string): boolean {
    switch (this.standards.namingConvention) {
      case 'camelCase':
        return /^[a-z][a-zA-Z0-9]*$/.test(name);
      case 'snake_case':
        return /^[a-z][a-z0-9_]*$/.test(name);
      case 'kebab-case':
        return /^[a-z][a-z0-9-]*$/.test(name);
      default:
        return true;
    }
  }

  private hasExamples(operation: any): boolean {
    // Check for examples in request body or responses
    if (operation.requestBody?.content) {
      for (const content of Object.values(operation.requestBody.content)) {
        if ((content as any).examples || (content as any).example) {
          return true;
        }
      }
    }
    
    if (operation.responses) {
      for (const response of Object.values(operation.responses)) {
        const resp = response as any;
        if (resp.content) {
          for (const content of Object.values(resp.content)) {
            if ((content as any).examples || (content as any).example) {
              return true;
            }
          }
        }
      }
    }
    
    return false;
  }
}
