import { detectBreakingChanges, Severity, ChangeType } from '../src/tools/breaking.js';

describe('Breaking Change Detection', () => {
  const oldSpec = {
    openapi: '3.0.0',
    paths: {
      '/users': {
        get: {
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['id', 'name'],
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      age: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          responses: {
            '201': {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  const newSpec = {
    openapi: '3.0.0',
    paths: {
      '/users': {
        get: {
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['id', 'name', 'email'],
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/products': {
        get: {
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' }
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
  };

  test('should detect endpoint removal as critical breaking change', () => {
    const result = detectBreakingChanges(
      JSON.stringify(oldSpec),
      JSON.stringify({ openapi: '3.0.0', paths: {} })
    );

    expect(result.breaking).toBe(true);
    expect(result.summary.critical).toBe(2); // /users GET and POST removed
    expect(result.changes).toContainEqual({
      type: ChangeType.BREAKING,
      severity: Severity.CRITICAL,
      message: 'Endpoint removed: /users',
      path: '/users'
    });
  });

  test('should detect method removal as critical breaking change', () => {
    const specWithoutPost = {
      ...oldSpec,
      paths: {
        '/users': {
          get: oldSpec.paths['/users'].get
        }
      }
    };

    const result = detectBreakingChanges(
      JSON.stringify(oldSpec),
      JSON.stringify(specWithoutPost)
    );

    expect(result.breaking).toBe(true);
    expect(result.summary.critical).toBe(1);
    expect(result.changes).toContainEqual({
      type: ChangeType.BREAKING,
      severity: Severity.CRITICAL,
      message: 'Method removed: POST /users',
      path: '/users',
      method: 'POST'
    });
  });

  test('should detect required property addition as major breaking change', () => {
    const result = detectBreakingChanges(
      JSON.stringify(oldSpec),
      JSON.stringify(newSpec)
    );

    expect(result.breaking).toBe(true);
    expect(result.summary.major).toBe(1);
    expect(result.changes).toContainEqual({
      type: ChangeType.BREAKING,
      severity: Severity.MAJOR,
      message: 'Required properties added: GET /users 200 [email]',
      path: '/users',
      method: 'GET'
    });
  });

  test('should detect property removal as minor breaking change', () => {
    const result = detectBreakingChanges(
      JSON.stringify(oldSpec),
      JSON.stringify(newSpec)
    );

    expect(result.breaking).toBe(true);
    expect(result.summary.minor).toBe(1);
    expect(result.changes).toContainEqual({
      type: ChangeType.BREAKING,
      severity: Severity.MINOR,
      message: 'Property removed: GET /users 200.age',
      path: '/users',
      method: 'GET'
    });
  });

  test('should detect new endpoint as non-breaking info change', () => {
    const result = detectBreakingChanges(
      JSON.stringify(oldSpec),
      JSON.stringify(newSpec)
    );

    expect(result.summary.info).toBe(1);
    expect(result.summary.nonBreaking).toBe(1);
    expect(result.changes).toContainEqual({
      type: ChangeType.NON_BREAKING,
      severity: Severity.INFO,
      message: 'New endpoint added: /products',
      path: '/products'
    });
  });

  test('should generate correct summary', () => {
    const result = detectBreakingChanges(
      JSON.stringify(oldSpec),
      JSON.stringify(newSpec)
    );

    expect(result.summary).toEqual({
      critical: 1, // POST method removed
      major: 1,    // required email added
      minor: 1,    // age property removed
      info: 1,     // /products endpoint added
      breaking: 3,  // critical + major + minor
      nonBreaking: 1 // info
    });
  });

  test('should handle empty specs', () => {
    const result = detectBreakingChanges('{}', '{}');
    
    expect(result.breaking).toBe(false);
    expect(result.changes).toHaveLength(0);
    expect(result.summary).toEqual({
      critical: 0,
      major: 0,
      minor: 0,
      info: 0,
      breaking: 0,
      nonBreaking: 0
    });
  });

  test('should handle YAML input', () => {
    const yamlOld = `
openapi: 3.0.0
paths:
  /users:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
`;

    const yamlNew = `
openapi: 3.0.0
paths:
  /users:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                  name:
                    type: string
`;

    const result = detectBreakingChanges(yamlOld, yamlNew);
    expect(result.breaking).toBe(false);
    expect(result.summary.info).toBe(1);
  });
});
