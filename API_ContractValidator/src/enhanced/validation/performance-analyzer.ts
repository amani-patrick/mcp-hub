interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
  recommendation?: string;
}

interface PerformanceAnalysis {
  overall: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
  };
  metrics: PerformanceMetric[];
  predictions: {
    averageResponseTime: number;
    throughput: number;
    scalability: 'excellent' | 'good' | 'fair' | 'poor';
  };
  bottlenecks: Array<{
    type: 'complexity' | 'payload' | 'dependencies' | 'caching';
    description: string;
    impact: 'high' | 'medium' | 'low';
    suggestion: string;
  }>;
}

interface Operation {
    parameters?: any[];
    responses?: any;
    requestBody?: any;
}

export class PerformanceAnalyzer {
  private complexityWeights = {
    'get': 1,
    'post': 2,
    'put': 2,
    'patch': 2,
    'delete': 1
  };

  analyze(spec: any): PerformanceAnalysis {
    const metrics = this.calculateMetrics(spec);
    const predictions = this.generatePredictions(spec, metrics);
    const bottlenecks = this.identifyBottlenecks(spec, metrics);
    const overall = this.calculateOverallScore(metrics);

    return {
      overall,
      metrics,
      predictions,
      bottlenecks
    };
  }

  private calculateMetrics(spec: any): PerformanceMetric[] {
    const metrics: PerformanceMetric[] = [];

    // API Complexity Score
    const complexityScore = this.calculateComplexityScore(spec);
    metrics.push({
      name: 'API Complexity',
      value: complexityScore,
      unit: 'points',
      threshold: 50,
      status: complexityScore > 50 ? 'critical' : complexityScore > 30 ? 'warning' : 'good',
      recommendation: complexityScore > 50 ? 'Consider simplifying API structure' : undefined
    });

    // Average Response Size
    const avgResponseSize = this.calculateAverageResponseSize(spec);
    metrics.push({
      name: 'Average Response Size',
      value: avgResponseSize,
      unit: 'KB',
      threshold: 100,
      status: avgResponseSize > 100 ? 'critical' : avgResponseSize > 50 ? 'warning' : 'good',
      recommendation: avgResponseSize > 100 ? 'Implement response compression and pagination' : undefined
    });

    // Number of Endpoints
    const endpointCount = this.countEndpoints(spec);
    metrics.push({
      name: 'API Endpoints',
      value: endpointCount,
      unit: 'endpoints',
      threshold: 100,
      status: endpointCount > 100 ? 'warning' : 'good',
      recommendation: endpointCount > 100 ? 'Consider API versioning or microservices' : undefined
    });

    // Schema Complexity
    const schemaComplexity = this.calculateSchemaComplexity(spec);
    metrics.push({
      name: 'Schema Complexity',
      value: schemaComplexity,
      unit: 'points',
      threshold: 30,
      status: schemaComplexity > 30 ? 'critical' : schemaComplexity > 20 ? 'warning' : 'good',
      recommendation: schemaComplexity > 30 ? 'Simplify data models and reduce nesting' : undefined
    });

    // Authentication Overhead
    const authOverhead = this.calculateAuthOverhead(spec);
    metrics.push({
      name: 'Authentication Overhead',
      value: authOverhead,
      unit: 'ms',
      threshold: 50,
      status: authOverhead > 50 ? 'warning' : 'good',
      recommendation: authOverhead > 50 ? 'Consider token caching or lighter auth methods' : undefined
    });

    return metrics;
  }

  private calculateComplexityScore(spec: any): number {
    let score = 0;
    
    if (spec.paths) {
      for (const [path, pathItem] of Object.entries(spec.paths)) {
        // Path complexity based on segments and parameters
        const pathSegments = path.split('/').filter(s => s && !s.startsWith('{')).length;
        const pathParams = (path.match(/\{[^}]+\}/g) || []).length;
        score += pathSegments + (pathParams * 2);

        // Operation complexity
        for (const [method, operation] of Object.entries(pathItem as any)) {
          if (operation && typeof operation === 'object' && method !== 'parameters') {
            const op = operation as Operation;
            score += this.complexityWeights[method.toLowerCase() as keyof typeof this.complexityWeights] || 1;

            // Parameter complexity
            const params = (op as any).parameters || [];
            score += params.length;

            // Response complexity
            if ((op as any).responses) {
              const responseCount = Object.keys((op as any).responses).length;
              score += responseCount;
            }

            // Request body complexity
            if ((op as any).requestBody) {
              score += 2;
            }
          }
        }
      }
    }

    return score;
  }

  private calculateAverageResponseSize(spec: any): number {
    let totalSize = 0;
    let responseCount = 0;

    if (spec.paths) {
      for (const pathItem of Object.values(spec.paths)) {
        for (const operation of Object.values(pathItem as any)) {
          const op = operation as Operation;
          if (op && (op as any).responses) {
            for (const response of Object.values((op as any).responses)) {
              const resp = response as any;
              if (resp.content) {
                for (const content of Object.values(resp.content)) {
                  const schema = (content as any).schema;
                  if (schema) {
                    const estimatedSize = this.estimateSchemaSize(schema);
                    totalSize += estimatedSize;
                    responseCount++;
                  }
                }
              }
            }
          }
        }
      }
    }

    return responseCount > 0 ? Math.round(totalSize / responseCount) : 0;
  }

  private estimateSchemaSize(schema: any): number {
    if (!schema) return 0;

    let size = 0;

    switch (schema.type) {
      case 'object':
        if (schema.properties) {
          for (const prop of Object.values(schema.properties)) {
            size += this.estimateSchemaSize(prop);
          }
        }
        break;
      case 'array':
        if (schema.items) {
          size += this.estimateSchemaSize(schema.items) * 10; // Assume avg 10 items
        }
        break;
      case 'string':
        size += schema.maxLength || 50; // Default 50 chars
        break;
      case 'number':
      case 'integer':
        size += 8;
        break;
      case 'boolean':
        size += 1;
        break;
      default:
        size += 50; // Default estimate
    }

    return size;
  }

  private countEndpoints(spec: any): number {
    let count = 0;
    
    if (spec.paths) {
      for (const pathItem of Object.values(spec.paths)) {
        for (const [method, operation] of Object.entries(pathItem as any)) {
          if (operation && typeof operation === 'object' && method !== 'parameters') {
            count++;
          }
        }
      }
    }

    return count;
  }

  private calculateSchemaComplexity(spec: any): number {
    let complexity = 0;

    if (spec.components?.schemas) {
      for (const schema of Object.values(spec.components.schemas)) {
        complexity += this.calculateSingleSchemaComplexity(schema);
      }
    }

    return complexity;
  }

  private calculateSingleSchemaComplexity(schema: any): number {
    if (!schema || typeof schema !== 'object') return 0;

    let complexity = 0;

    if (schema.type === 'object' && schema.properties) {
      complexity += Object.keys(schema.properties).length;
      for (const prop of Object.values(schema.properties)) {
        complexity += this.calculateSingleSchemaComplexity(prop);
      }
    } else if (schema.type === 'array' && schema.items) {
      complexity += 1 + this.calculateSingleSchemaComplexity(schema.items);
    } else if (schema.allOf) {
      complexity += schema.allOf.length * 2;
      for (const subSchema of schema.allOf) {
        complexity += this.calculateSingleSchemaComplexity(subSchema);
      }
    } else if (schema.anyOf) {
      complexity += schema.anyOf.length * 3;
      for (const subSchema of schema.anyOf) {
        complexity += this.calculateSingleSchemaComplexity(subSchema);
      }
    } else if (schema.oneOf) {
      complexity += schema.oneOf.length * 2;
      for (const subSchema of schema.oneOf) {
        complexity += this.calculateSingleSchemaComplexity(subSchema);
      }
    }

    return complexity;
  }

  private calculateAuthOverhead(spec: any): number {
    let overhead = 0;

    if (spec.components?.securitySchemes) {
      for (const [name, scheme] of Object.entries(spec.components.securitySchemes)) {
        const securityScheme = scheme as any;
        switch (securityScheme.type) {
          case 'oauth2':
            overhead += 30; // OAuth2 token validation
            break;
          case 'jwt':
            overhead += 20; // JWT verification
            break;
          case 'apiKey':
            overhead += 10; // API key lookup
            break;
          case 'basic':
            overhead += 15; // Basic auth
            break;
          default:
            overhead += 25;
        }
      }
    }

    return overhead;
  }

  private generatePredictions(spec: any, metrics: PerformanceMetric[]): PerformanceAnalysis['predictions'] {
    const complexityMetric = metrics.find(m => m.name === 'API Complexity');
    const sizeMetric = metrics.find(m => m.name === 'Average Response Size');
    
    const baseResponseTime = 50; // Base response time in ms
    const complexityFactor = (complexityMetric?.value || 0) / 10;
    const sizeFactor = (sizeMetric?.value || 0) / 10;

    const averageResponseTime = Math.round(baseResponseTime + (complexityFactor * 5) + (sizeFactor * 2));
    
    // Estimate throughput (requests per second)
    const throughput = Math.max(100, Math.round(10000 / averageResponseTime));
    
    // Determine scalability
    const scalability = 
      averageResponseTime < 100 ? 'excellent' :
      averageResponseTime < 200 ? 'good' :
      averageResponseTime < 500 ? 'fair' : 'poor';

    return {
      averageResponseTime,
      throughput,
      scalability
    };
  }

  private identifyBottlenecks(spec: any, metrics: PerformanceMetric[]): PerformanceAnalysis['bottlenecks'] {
    const bottlenecks: PerformanceAnalysis['bottlenecks'] = [];

    // Check for high complexity
    const complexityMetric = metrics.find(m => m.name === 'API Complexity');
    if (complexityMetric && complexityMetric.value > 40) {
      bottlenecks.push({
        type: 'complexity',
        description: 'High API complexity may impact performance',
        impact: 'high',
        suggestion: 'Simplify API structure and reduce nested operations'
      });
    }

    // Check for large response sizes
    const sizeMetric = metrics.find(m => m.name === 'Average Response Size');
    if (sizeMetric && sizeMetric.value > 50) {
      bottlenecks.push({
        type: 'payload',
        description: 'Large response sizes may slow down transfers',
        impact: 'medium',
        suggestion: 'Implement pagination and response compression'
      });
    }

    // Check for missing caching
    const hasCaching = this.hasCachingHeaders(spec);
    if (!hasCaching) {
      bottlenecks.push({
        type: 'caching',
        description: 'No caching headers detected',
        impact: 'medium',
        suggestion: 'Add appropriate caching headers for GET operations'
      });
    }

    // Check for deep nesting
    const maxDepth = this.getMaxNestingDepth(spec);
    if (maxDepth > 5) {
      bottlenecks.push({
        type: 'complexity',
        description: `Deep nesting detected (max depth: ${maxDepth})`,
        impact: 'medium',
        suggestion: 'Reduce nesting depth in data structures'
      });
    }

    return bottlenecks;
  }

  private hasCachingHeaders(spec: any): boolean {
    if (spec.paths) {
      for (const pathItem of Object.values(spec.paths)) {
        for (const operation of Object.values(pathItem as any)) {
          if (operation && typeof operation === 'object') {
            const extensions = Object.keys(operation).filter(key => 
              key.includes('cache') || key.includes('expires')
            );
            if (extensions.length > 0) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  private getMaxNestingDepth(spec: any, currentDepth = 0): number {
    let maxDepth = currentDepth;

    if (spec.components?.schemas) {
      for (const schema of Object.values(spec.components.schemas)) {
        const depth = this.getSchemaNestingDepth(schema, currentDepth);
        maxDepth = Math.max(maxDepth, depth);
      }
    }

    return maxDepth;
  }

  private getSchemaNestingDepth(schema: any, currentDepth = 0): number {
    if (!schema || typeof schema !== 'object') return currentDepth;

    let maxDepth = currentDepth;

    if (schema.type === 'object' && schema.properties) {
      for (const prop of Object.values(schema.properties)) {
        const depth = this.getSchemaNestingDepth(prop, currentDepth + 1);
        maxDepth = Math.max(maxDepth, depth);
      }
    } else if (schema.type === 'array' && schema.items) {
      const depth = this.getSchemaNestingDepth(schema.items, currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    } else if (schema.allOf || schema.anyOf || schema.oneOf) {
      const schemas = schema.allOf || schema.anyOf || schema.oneOf;
      for (const subSchema of schemas) {
        const depth = this.getSchemaNestingDepth(subSchema, currentDepth + 1);
        maxDepth = Math.max(maxDepth, depth);
      }
    }

    return maxDepth;
  }

  private calculateOverallScore(metrics: PerformanceMetric[]): PerformanceAnalysis['overall'] {
    const criticalCount = metrics.filter(m => m.status === 'critical').length;
    const warningCount = metrics.filter(m => m.status === 'warning').length;
    const goodCount = metrics.filter(m => m.status === 'good').length;
    
    const totalMetrics = metrics.length;
    const score = Math.round(((goodCount * 100) + (warningCount * 60) + (criticalCount * 20)) / totalMetrics);
    
    let grade: PerformanceAnalysis['overall']['grade'];
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    return { score, grade };
  }
}
