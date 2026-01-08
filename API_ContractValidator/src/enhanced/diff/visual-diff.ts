interface DiffItem {
  path: string;
  type: 'added' | 'removed' | 'modified';
  oldValue?: any;
  newValue?: any;
  changeType: 'breaking' | 'non-breaking';
  severity: 'critical' | 'major' | 'minor' | 'info';
  description: string;
}

interface ClientImpact {
  clientType: 'web' | 'mobile' | 'backend' | 'third-party';
  name: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  affectedEndpoints: string[];
  requiredActions: string[];
  estimatedEffort: 'hours' | 'days' | 'weeks';
}

interface MigrationSuggestion {
  endpoint: string;
  changeType: string;
  suggestion: string;
  codeExample?: string;
  deprecationTimeline?: string;
  alternativeEndpoint?: string;
}

interface VersionCompatibility {
  version: string;
  compatible: boolean;
  issues: string[];
  migrationPath: string[];
}

export class VisualDiffGenerator {
  generateSideBySideDiff(oldSpec: any, newSpec: any): {
    summary: {
      totalChanges: number;
      breakingChanges: number;
      nonBreakingChanges: number;
      addedEndpoints: number;
      removedEndpoints: number;
      modifiedEndpoints: number;
    };
    changes: DiffItem[];
    clientImpacts: ClientImpact[];
    migrationSuggestions: MigrationSuggestion[];
    versionCompatibility: VersionCompatibility[];
  } {
    const changes = this.calculateDifferences(oldSpec, newSpec);
    const clientImpacts = this.analyzeClientImpact(changes, oldSpec, newSpec);
    const migrationSuggestions = this.generateMigrationSuggestions(changes);
    const versionCompatibility = this.analyzeVersionCompatibility(oldSpec, newSpec);
    
    const summary = {
      totalChanges: changes.length,
      breakingChanges: changes.filter(c => c.changeType === 'breaking').length,
      nonBreakingChanges: changes.filter(c => c.changeType === 'non-breaking').length,
      addedEndpoints: changes.filter(c => c.type === 'added').length,
      removedEndpoints: changes.filter(c => c.type === 'removed').length,
      modifiedEndpoints: changes.filter(c => c.type === 'modified').length
    };

    return {
      summary,
      changes,
      clientImpacts,
      migrationSuggestions,
      versionCompatibility
    };
  }

  private calculateDifferences(oldSpec: any, newSpec: any): DiffItem[] {
    const changes: DiffItem[] = [];

    // Compare paths
    const oldPaths = oldSpec.paths ? Object.keys(oldSpec.paths) : [];
    const newPaths = newSpec.paths ? Object.keys(newSpec.paths) : [];

    // Added paths
    for (const path of newPaths) {
      if (!oldPaths.includes(path)) {
        changes.push({
          path,
          type: 'added',
          changeType: 'non-breaking',
          severity: 'info',
          description: `New endpoint added: ${path}`
        });
      }
    }

    // Removed paths
    for (const path of oldPaths) {
      if (!newPaths.includes(path)) {
        changes.push({
          path,
          type: 'removed',
          changeType: 'breaking',
          severity: 'critical',
          description: `Endpoint removed: ${path}`
        });
      }
    }

    // Modified paths
    for (const path of oldPaths.filter(p => newPaths.includes(p))) {
      const oldPathItem = oldSpec.paths[path];
      const newPathItem = newSpec.paths[path];
      
      const pathChanges = this.comparePathOperations(path, oldPathItem, newPathItem);
      changes.push(...pathChanges);
    }

    // Compare components (schemas, parameters, etc.)
    const componentChanges = this.compareComponents(oldSpec, newSpec);
    changes.push(...componentChanges);

    return changes;
  }

  private comparePathOperations(path: string, oldPathItem: any, newPathItem: any): DiffItem[] {
    const changes: DiffItem[] = [];
    const oldMethods = Object.keys(oldPathItem).filter(k => k !== 'parameters');
    const newMethods = Object.keys(newPathItem).filter(k => k !== 'parameters');

    // Added methods
    for (const method of newMethods) {
      if (!oldMethods.includes(method)) {
        changes.push({
          path: `${path} ${method.toUpperCase()}`,
          type: 'added',
          changeType: 'non-breaking',
          severity: 'info',
          description: `New method added: ${method.toUpperCase()} ${path}`
        });
      }
    }

    // Removed methods
    for (const method of oldMethods) {
      if (!newMethods.includes(method)) {
        changes.push({
          path: `${path} ${method.toUpperCase()}`,
          type: 'removed',
          changeType: 'breaking',
          severity: 'critical',
          description: `Method removed: ${method.toUpperCase()} ${path}`
        });
      }
    }

    // Modified methods
    for (const method of oldMethods.filter(m => newMethods.includes(m))) {
      const oldOperation = oldPathItem[method];
      const newOperation = newPathItem[method];
      
      const operationChanges = this.compareOperations(path, method, oldOperation, newOperation);
      changes.push(...operationChanges);
    }

    return changes;
  }

  private compareOperations(path: string, method: string, oldOp: any, newOp: any): DiffItem[] {
    const changes: DiffItem[] = [];

    // Compare parameters
    const oldParams = oldOp.parameters || [];
    const newParams = newOp.parameters || [];
    
    const paramChanges = this.compareParameters(path, method, oldParams, newParams);
    changes.push(...paramChanges);

    // Compare request body
    if (oldOp.requestBody || newOp.requestBody) {
      const bodyChanges = this.compareRequestBody(path, method, oldOp.requestBody, newOp.requestBody);
      changes.push(...bodyChanges);
    }

    // Compare responses
    const oldResponses = oldOp.responses || {};
    const newResponses = newOp.responses || {};
    
    const responseChanges = this.compareResponses(path, method, oldResponses, newResponses);
    changes.push(...responseChanges);

    // Compare security
    if (oldOp.security || newOp.security) {
      const securityChanges = this.compareSecurity(path, method, oldOp.security, newOp.security);
      changes.push(...securityChanges);
    }

    return changes;
  }

  private compareParameters(path: string, method: string, oldParams: any[], newParams: any[]): DiffItem[] {
    const changes: DiffItem[] = [];

    const oldParamNames = oldParams.map(p => p.name);
    const newParamNames = newParams.map(p => p.name);

    // Added parameters
    for (const paramName of newParamNames) {
      if (!oldParamNames.includes(paramName)) {
        const param = newParams.find(p => p.name === paramName);
        const isRequired = param?.required || false;
        
        changes.push({
          path: `${path} ${method.toUpperCase()} - parameter ${paramName}`,
          type: 'added',
          changeType: isRequired ? 'breaking' : 'non-breaking',
          severity: isRequired ? 'major' : 'minor',
          description: `Parameter ${paramName} added${isRequired ? ' (required)' : ' (optional)'}`
        });
      }
    }

    // Removed parameters
    for (const paramName of oldParamNames) {
      if (!newParamNames.includes(paramName)) {
        changes.push({
          path: `${path} ${method.toUpperCase()} - parameter ${paramName}`,
          type: 'removed',
          changeType: 'breaking',
          severity: 'major',
          description: `Parameter ${paramName} removed`
        });
      }
    }

    // Modified parameters
    for (const paramName of oldParamNames.filter(p => newParamNames.includes(p))) {
      const oldParam = oldParams.find(p => p.name === paramName);
      const newParam = newParams.find(p => p.name === paramName);
      
      if (JSON.stringify(oldParam) !== JSON.stringify(newParam)) {
        const isBreaking = this.isParameterChangeBreaking(oldParam, newParam);
        
        changes.push({
          path: `${path} ${method.toUpperCase()} - parameter ${paramName}`,
          type: 'modified',
          changeType: isBreaking ? 'breaking' : 'non-breaking',
          severity: isBreaking ? 'major' : 'minor',
          description: `Parameter ${paramName} modified`,
          oldValue: oldParam,
          newValue: newParam
        });
      }
    }

    return changes;
  }

  private compareRequestBody(path: string, method: string, oldBody: any, newBody: any): DiffItem[] {
    const changes: DiffItem[] = [];

    if (!oldBody && newBody) {
      changes.push({
        path: `${path} ${method.toUpperCase()} - request body`,
        type: 'added',
        changeType: 'breaking',
        severity: 'major',
        description: 'Request body added'
      });
    } else if (oldBody && !newBody) {
      changes.push({
        path: `${path} ${method.toUpperCase()} - request body`,
        type: 'removed',
        changeType: 'breaking',
        severity: 'major',
        description: 'Request body removed'
      });
    } else if (oldBody && newBody && JSON.stringify(oldBody) !== JSON.stringify(newBody)) {
      const isBreaking = this.isRequestBodyChangeBreaking(oldBody, newBody);
      
      changes.push({
        path: `${path} ${method.toUpperCase()} - request body`,
        type: 'modified',
        changeType: isBreaking ? 'breaking' : 'non-breaking',
        severity: isBreaking ? 'major' : 'minor',
        description: 'Request body schema modified',
        oldValue: oldBody,
        newValue: newBody
      });
    }

    return changes;
  }

  private compareResponses(path: string, method: string, oldResponses: any, newResponses: any): DiffItem[] {
    const changes: DiffItem[] = [];

    const oldStatusCodes = Object.keys(oldResponses);
    const newStatusCodes = Object.keys(newResponses);

    // Added response codes
    for (const code of newStatusCodes) {
      if (!oldStatusCodes.includes(code)) {
        changes.push({
          path: `${path} ${method.toUpperCase()} - response ${code}`,
          type: 'added',
          changeType: 'non-breaking',
          severity: 'info',
          description: `Response code ${code} added`
        });
      }
    }

    // Removed response codes
    for (const code of oldStatusCodes) {
      if (!newStatusCodes.includes(code)) {
        const isSuccessCode = code.startsWith('2') || code.startsWith('3');
        changes.push({
          path: `${path} ${method.toUpperCase()} - response ${code}`,
          type: 'removed',
          changeType: isSuccessCode ? 'breaking' : 'non-breaking',
          severity: isSuccessCode ? 'major' : 'minor',
          description: `Response code ${code} removed`
        });
      }
    }

    // Modified response codes
    for (const code of oldStatusCodes.filter(c => newStatusCodes.includes(c))) {
      const oldResponse = oldResponses[code];
      const newResponse = newResponses[code];
      
      if (JSON.stringify(oldResponse) !== JSON.stringify(newResponse)) {
        const isBreaking = this.isResponseChangeBreaking(oldResponse, newResponse);
        
        changes.push({
          path: `${path} ${method.toUpperCase()} - response ${code}`,
          type: 'modified',
          changeType: isBreaking ? 'breaking' : 'non-breaking',
          severity: isBreaking ? 'major' : 'minor',
          description: `Response ${code} schema modified`,
          oldValue: oldResponse,
          newValue: newResponse
        });
      }
    }

    return changes;
  }

  private compareSecurity(path: string, method: string, oldSecurity: any, newSecurity: any): DiffItem[] {
    const changes: DiffItem[] = [];

    if (!oldSecurity && newSecurity) {
      changes.push({
        path: `${path} ${method.toUpperCase()} - security`,
        type: 'added',
        changeType: 'non-breaking',
        severity: 'info',
        description: 'Security requirements added'
      });
    } else if (oldSecurity && !newSecurity) {
      changes.push({
        path: `${path} ${method.toUpperCase()} - security`,
        type: 'removed',
        changeType: 'breaking',
        severity: 'critical',
        description: 'Security requirements removed'
      });
    } else if (oldSecurity && newSecurity && JSON.stringify(oldSecurity) !== JSON.stringify(newSecurity)) {
      changes.push({
        path: `${path} ${method.toUpperCase()} - security`,
        type: 'modified',
        changeType: 'breaking',
        severity: 'major',
        description: 'Security requirements modified',
        oldValue: oldSecurity,
        newValue: newSecurity
      });
    }

    return changes;
  }

  private compareComponents(oldSpec: any, newSpec: any): DiffItem[] {
    const changes: DiffItem[] = [];

    const oldComponents = oldSpec.components || {};
    const newComponents = newSpec.components || {};

    // Compare schemas
    if (oldComponents.schemas || newComponents.schemas) {
      const oldSchemas = oldComponents.schemas ? Object.keys(oldComponents.schemas) : [];
      const newSchemas = newComponents.schemas ? Object.keys(newComponents.schemas) : [];

      for (const schemaName of newSchemas) {
        if (!oldSchemas.includes(schemaName)) {
          changes.push({
            path: `components.schemas.${schemaName}`,
            type: 'added',
            changeType: 'non-breaking',
            severity: 'info',
            description: `Schema ${schemaName} added`
          });
        }
      }

      for (const schemaName of oldSchemas) {
        if (!newSchemas.includes(schemaName)) {
          changes.push({
            path: `components.schemas.${schemaName}`,
            type: 'removed',
            changeType: 'breaking',
            severity: 'major',
            description: `Schema ${schemaName} removed`
          });
        }
      }
    }

    return changes;
  }

  private isParameterChangeBreaking(oldParam: any, newParam: any): boolean {
    // Check if required status changed from false to true
    if (!oldParam.required && newParam.required) {
      return true;
    }

    // Check if type changed
    if (oldParam.schema?.type !== newParam.schema?.type) {
      return true;
    }

    // Check if enum values were removed
    if (oldParam.schema?.enum && newParam.schema?.enum) {
      const oldEnums = oldParam.schema.enum;
      const newEnums = newParam.schema.enum;
      if (oldEnums.some((val: any) => !newEnums.includes(val))) {
        return true;
      }
    }

    return false;
  }

  private isRequestBodyChangeBreaking(oldBody: any, newBody: any): boolean {
    // Simplified check - in reality, this would be more sophisticated
    return JSON.stringify(oldBody) !== JSON.stringify(newBody);
  }

  private isResponseChangeBreaking(oldResponse: any, newResponse: any): boolean {
    // Check if success response schema changed significantly
    return JSON.stringify(oldResponse) !== JSON.stringify(newResponse);
  }

  private analyzeClientImpact(changes: DiffItem[], oldSpec: any, newSpec: any): ClientImpact[] {
    const impacts: ClientImpact[] = [];

    // Analyze impacts for different client types
    const breakingChanges = changes.filter(c => c.changeType === 'breaking');
    
    if (breakingChanges.length > 0) {
      // Web clients
      impacts.push({
        clientType: 'web',
        name: 'Frontend Applications',
        impact: breakingChanges.some(c => c.severity === 'critical') ? 'critical' : 'high',
        affectedEndpoints: breakingChanges.map(c => c.path.split(' ')[0]),
        requiredActions: [
          'Update API calls to handle removed endpoints',
          'Modify request/response handling',
          'Update error handling logic'
        ],
        estimatedEffort: breakingChanges.length > 5 ? 'weeks' : 'days'
      });

      // Mobile clients
      impacts.push({
        clientType: 'mobile',
        name: 'Mobile Apps',
        impact: breakingChanges.some(c => c.severity === 'critical') ? 'critical' : 'high',
        affectedEndpoints: breakingChanges.map(c => c.path.split(' ')[0]),
        requiredActions: [
          'Release app updates',
          'Handle breaking changes gracefully',
          'Implement backward compatibility'
        ],
        estimatedEffort: breakingChanges.length > 3 ? 'weeks' : 'days'
      });

      // Backend clients
      impacts.push({
        clientType: 'backend',
        name: 'Backend Services',
        impact: breakingChanges.some(c => c.severity === 'critical') ? 'critical' : 'high',
        affectedEndpoints: breakingChanges.map(c => c.path.split(' ')[0]),
        requiredActions: [
          'Update service integrations',
          'Modify data models',
          'Update authentication flows'
        ],
        estimatedEffort: breakingChanges.length > 10 ? 'weeks' : 'days'
      });
    }

    return impacts;
  }

  private generateMigrationSuggestions(changes: DiffItem[]): MigrationSuggestion[] {
    const suggestions: MigrationSuggestion[] = [];

    for (const change of changes) {
      if (change.type === 'removed') {
        suggestions.push({
          endpoint: change.path,
          changeType: change.type,
          suggestion: `Consider deprecating ${change.path} instead of removing it`,
          deprecationTimeline: 'Provide at least 6 months deprecation notice',
          alternativeEndpoint: this.suggestAlternative(change.path)
        });
      }

      if (change.type === 'modified' && change.changeType === 'breaking') {
        suggestions.push({
          endpoint: change.path,
          changeType: change.type,
          suggestion: `Implement versioning for ${change.path}`,
          codeExample: this.generateMigrationExample(change),
          deprecationTimeline: 'Maintain old version for 3-6 months'
        });
      }
    }

    return suggestions;
  }

  private analyzeVersionCompatibility(oldSpec: any, newSpec: any): VersionCompatibility[] {
    const compatibility: VersionCompatibility[] = [];

    // Analyze compatibility with different versions
    const versions = ['v1.0', 'v1.1', 'v2.0'];
    
    for (const version of versions) {
      const issues = this.checkVersionIssues(oldSpec, newSpec, version);
      const compatible = issues.length === 0;
      
      compatibility.push({
        version,
        compatible,
        issues,
        migrationPath: compatible ? [] : this.generateMigrationPath(version, issues)
      });
    }

    return compatibility;
  }

  private suggestAlternative(endpoint: string): string {
    // Simple suggestion logic - could be more sophisticated
    if (endpoint.includes('/users/')) {
      return '/api/v2/users';
    }
    return '/api/v2' + endpoint;
  }

  private generateMigrationExample(change: DiffItem): string {
    return `
// Old way
fetch('/api${change.path.split(' ')[0]}', {
  method: '${change.path.split(' ')[1]?.toLowerCase()}'
});

// New way
fetch('/api/v2${change.path.split(' ')[0]}', {
  method: '${change.path.split(' ')[1]?.toLowerCase()}',
  headers: { 'API-Version': '2.0' }
});
    `.trim();
  }

  private checkVersionIssues(oldSpec: any, newSpec: any, version: string): string[] {
    const issues: string[] = [];
    
    // Simplified version compatibility check
    if (version === 'v1.0') {
      // Check for breaking changes that would affect v1.0
      const breakingChanges = this.calculateDifferences(oldSpec, newSpec)
        .filter(c => c.changeType === 'breaking');
      
      if (breakingChanges.length > 0) {
        issues.push(`${breakingChanges.length} breaking changes detected`);
      }
    }

    return issues;
  }

  private generateMigrationPath(version: string, issues: string[]): string[] {
    return [
      `Update client to use ${version} endpoints`,
      'Implement backward compatibility layer',
      'Test all integrations',
      'Deploy gradual rollout'
    ];
  }
}
