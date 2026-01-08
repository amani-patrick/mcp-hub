import { validateResponse } from '../src/tools/validate.js';
import { parseSpec } from '../src/openapi.js';

describe('Response Validation', () => {
  const userSchema = {
    type: 'object',
    required: ['id', 'name'],
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      age: { type: 'number', minimum: 0 },
      email: { type: 'string', format: 'email' }
    }
  };

  test('should validate correct response', () => {
    const validResponse = {
      id: '123',
      name: 'John Doe',
      age: 30,
      email: 'john@example.com'
    };

    const result = validateResponse(userSchema, validResponse);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should detect missing required fields', () => {
    const invalidResponse = {
      id: '123'
      // missing required 'name' field
    };

    const result = validateResponse(userSchema, invalidResponse);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatchObject({
      field: '',
      expected: expect.stringContaining('name'),
      received: expect.stringContaining('required')
    });
  });

  test('should detect type mismatches', () => {
    const invalidResponse = {
      id: '123',
      name: 'John Doe',
      age: 'thirty' // should be number
    };

    const result = validateResponse(userSchema, invalidResponse);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should detect constraint violations', () => {
    const invalidResponse = {
      id: '123',
      name: 'John Doe',
      age: -5, // violates minimum: 0
      email: 'invalid-email' // invalid email format
    };

    const result = validateResponse(userSchema, invalidResponse);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should handle empty response', () => {
    const result = validateResponse(userSchema, null);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should handle additional properties', () => {
    const responseWithExtra = {
      id: '123',
      name: 'John Doe',
      age: 30,
      email: 'john@example.com',
      extraProperty: 'should not cause error'
    };

    const result = validateResponse(userSchema, responseWithExtra);

    expect(result.valid).toBe(true);
  });

  test('should handle array validation', () => {
    const arraySchema = {
      type: 'array',
      items: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    };

    const validArray = [
      { id: '1' },
      { id: '2' }
    ];

    const result = validateResponse(arraySchema, validArray);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should detect invalid array items', () => {
    const arraySchema = {
      type: 'array',
      items: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    };

    const invalidArray = [
      { id: '1' },
      { name: 'missing id' } // missing required id
    ];

    const result = validateResponse(arraySchema, invalidArray);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('OpenAPI Spec Parsing', () => {
  test('should parse JSON OpenAPI spec', () => {
    const jsonSpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    };

    const result = parseSpec(JSON.stringify(jsonSpec));

    expect(result.openapi).toBe('3.0.0');
    expect(result.paths).toBeDefined();
    expect(result.paths['/users']).toBeDefined();
  });

  test('should parse YAML OpenAPI spec', () => {
    const yamlSpec = `
openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
paths:
  /users:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
`;

    const result = parseSpec(yamlSpec);

    expect(result.openapi).toBe('3.0.0');
    expect(result.paths).toBeDefined();
    expect(result.paths['/users']).toBeDefined();
  });

  test('should handle invalid JSON', () => {
    const invalidJson = '{ invalid json }';

    expect(() => parseSpec(invalidJson)).toThrow();
  });

  test('should handle invalid YAML', () => {
    const invalidYaml = `
invalid: yaml: content:
  - missing
    proper
    indentation
`;

    expect(() => parseSpec(invalidYaml)).toThrow();
  });
});
