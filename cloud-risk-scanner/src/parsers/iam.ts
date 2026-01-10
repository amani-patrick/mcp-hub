import fs from "fs";

export interface IamStatement {
    Effect: string;
    Action: string | string[];
    Resource: string | string[];
}

export interface IamPolicy {
    Version: string;
    Statement: IamStatement[];
}

export function parseIamPolicy(filePath: string): IamPolicy | null {
    try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(raw);

        // Normalize Statement to always be an array
        if (data.Statement && !Array.isArray(data.Statement)) {
            data.Statement = [data.Statement];
        }

        // Handle lowercase 'statement' if present (AWS policies are usually PascalCase but good to be robust)
        if (data.statement && !data.Statement) {
            data.Statement = Array.isArray(data.statement) ? data.statement : [data.statement];
        }

        return data as IamPolicy;
    } catch (error) {
        console.error(`Error parsing IAM policy ${filePath}:`, error);
        return null;
    }
}
