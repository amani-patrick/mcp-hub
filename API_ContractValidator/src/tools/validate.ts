import { Ajv } from "ajv";

export function validateResponse(schema: object, response: unknown) {
    const ajv = new Ajv({ allErrors: true, strict: false });
    ajv.addFormat("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    ajv.addFormat("uri", /^(https?|ftp):\/\//);
    const validate = ajv.compile(schema);

    const valid = validate(response);
    return {
        valid,
        errors: validate.errors?.map((err: any) => ({
            field: err.instancePath,
            expected: JSON.stringify(err.params),
            received: err.message ?? "unknown"
        })) ?? []
    };
}