import { parseSpec } from "../openapi.js";

export enum Severity {
  CRITICAL = 'critical',
  MAJOR = 'major',
  MINOR = 'minor',
  INFO = 'info'
}

export enum ChangeType {
  BREAKING = 'breaking',
  NON_BREAKING = 'non_breaking'
}

interface Change {
  type: ChangeType;
  severity: Severity;
  message: string;
  path?: string;
  method?: string;
}

interface ChangeResult {
  breaking: boolean;
  changes: Change[];
  summary: {
    critical: number;
    major: number;
    minor: number;
    info: number;
    breaking: number;
    nonBreaking: number;
  };
}

function normalizeMethod(method: string): string {
  return method.toUpperCase();
}

const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']);

function isHttpMethod(key: string): boolean {
  return HTTP_METHODS.has(key.toLowerCase());
}

export function detectBreakingChanges(
  oldRaw: string,
  newRaw: string
): ChangeResult {
  const oldSpec = parseSpec(oldRaw);
  const newSpec = parseSpec(newRaw);

  const changes: Change[] = [];

  const oldPaths = oldSpec.paths || {};
  const newPaths = newSpec.paths || {};

  for (const path in oldPaths) {
    if (!newPaths[path]) {
      changes.push({
        type: ChangeType.BREAKING,
        severity: Severity.CRITICAL,
        message: `Endpoint removed: ${path}`,
        path
      });
      continue;
    }

    for (const method in oldPaths[path]) {
      if (!isHttpMethod(method)) continue;
      if (!newPaths[path][method]) {
        changes.push({
          type: ChangeType.BREAKING,
          severity: Severity.CRITICAL,
          message: `Method removed: ${normalizeMethod(method)} ${path}`,
          path,
          method: normalizeMethod(method)
        });
        continue;
      }

      const oldResponses = oldPaths[path][method].responses || {};
      const newResponses = newPaths[path][method].responses || {};

      for (const status in oldResponses) {
        if (!newResponses[status]) {
          changes.push({
            type: ChangeType.BREAKING,
            severity: Severity.MAJOR,
            message: `Response status removed: ${normalizeMethod(method)} ${path} ${status}`,
            path,
            method: normalizeMethod(method)
          });
          continue;
        }

        compareSchemas(
          oldResponses[status]?.content?.["application/json"]?.schema,
          newResponses[status]?.content?.["application/json"]?.schema,
          `${normalizeMethod(method)} ${path} ${status}`,
          changes,
          path,
          normalizeMethod(method)
        );
      }
    }
  }

  for (const path in newPaths) {
    if (!oldPaths[path]) {
      changes.push({
        type: ChangeType.NON_BREAKING,
        severity: Severity.INFO,
        message: `New endpoint added: ${path}`,
        path
      });
      continue;
    }

    for (const method in newPaths[path]) {
      if (!isHttpMethod(method)) continue;
      if (!oldPaths[path][method]) {
        changes.push({
          type: ChangeType.NON_BREAKING,
          severity: Severity.INFO,
          message: `New method added: ${normalizeMethod(method)} ${path}`,
          path,
          method: normalizeMethod(method)
        });
        continue;
      }

      const oldResponses = oldPaths[path][method].responses || {};
      const newResponses = newPaths[path][method].responses || {};

      for (const status in newResponses) {
        if (!oldResponses[status]) {
          changes.push({
            type: ChangeType.NON_BREAKING,
            severity: Severity.MINOR,
            message: `New response status added: ${normalizeMethod(method)} ${path} ${status}`,
            path,
            method: normalizeMethod(method)
          });
        }
      }
    }
  }

  const summary = {
    critical: changes.filter(c => c.severity === Severity.CRITICAL).length,
    major: changes.filter(c => c.severity === Severity.MAJOR).length,
    minor: changes.filter(c => c.severity === Severity.MINOR).length,
    info: changes.filter(c => c.severity === Severity.INFO).length,
    breaking: changes.filter(c => c.type === ChangeType.BREAKING).length,
    nonBreaking: changes.filter(c => c.type === ChangeType.NON_BREAKING).length
  };

  return {
    breaking: summary.breaking > 0,
    changes,
    summary
  };
}

function compareSchemas(
  oldSchema: any,
  newSchema: any,
  context: string,
  changes: Change[],
  path?: string,
  method?: string
): void {
  if (!oldSchema && !newSchema) return;

  if (!oldSchema && newSchema) {
    changes.push({
      type: ChangeType.NON_BREAKING,
      severity: Severity.MINOR,
      message: `Schema added: ${context}`,
      path,
      method
    });
    return;
  }

  if (oldSchema && !newSchema) {
    changes.push({
      type: ChangeType.BREAKING,
      severity: Severity.MAJOR,
      message: `Schema removed: ${context}`,
      path,
      method
    });
    return;
  }

  if (oldSchema.required && newSchema.required) {
    const removedRequired = oldSchema.required.filter(
      (req: string) => !newSchema.required.includes(req)
    );
    if (removedRequired.length > 0) {
      changes.push({
        type: ChangeType.BREAKING,
        severity: Severity.MAJOR,
        message: `Required properties removed: ${context} [${removedRequired.join(', ')}]`,
        path,
        method
      });
    }

    const addedRequired = newSchema.required.filter(
      (req: string) => !oldSchema.required.includes(req)
    );
    if (addedRequired.length > 0) {
      changes.push({
        type: ChangeType.BREAKING,
        severity: Severity.MAJOR,
        message: `Required properties added: ${context} [${addedRequired.join(', ')}]`,
        path,
        method
      });
    }
  }

  if (oldSchema.properties && newSchema.properties) {
    for (const propName in oldSchema.properties) {
      if (!newSchema.properties[propName]) {
        changes.push({
          type: ChangeType.BREAKING,
          severity: Severity.MINOR,
          message: `Property removed: ${context}.${propName}`,
          path,
          method
        });
      }
    }

    for (const propName in newSchema.properties) {
      if (!oldSchema.properties[propName]) {
        changes.push({
          type: ChangeType.NON_BREAKING,
          severity: Severity.INFO,
          message: `Property added: ${context}.${propName}`,
          path,
          method
        });
      }
    }
  }

  if (oldSchema.type !== newSchema.type) {
    changes.push({
      type: ChangeType.BREAKING,
      severity: Severity.MAJOR,
      message: `Type changed: ${context} from ${oldSchema.type} to ${newSchema.type}`,
      path,
      method
    });
  }
}
