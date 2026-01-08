import { Ajv } from "ajv";

export function validateResponse(schema: object, response: unknown) {
    const ajv = new Ajv({ allErrors: true });
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