import { Ajv } from "ajv";
import addFormats from "ajv-formats";

export function validateResponse(schema: object, response: unknown) {
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
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