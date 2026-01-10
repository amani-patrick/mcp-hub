import fs from "fs";
import hcl from "hcl2-parser";

export interface TerraformResource {
    type: string;
    name: string;
    properties: Record<string, any>;
}

export function parseTerraform(filePath: string): TerraformResource[] {
    const resources: TerraformResource[] = [];
    try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = hcl.parseToObject(raw);

        if (parsed && Array.isArray(parsed)) {
            for (const item of parsed) {
                if (!item || !item.resource) continue;

                for (const type in item.resource) {
                    const namedResources = item.resource[type];
                    for (const name in namedResources) {
                        const resourceContent = namedResources[name];
                        // hcl2-parser returns an array for the resource body
                        const properties = Array.isArray(resourceContent) ? resourceContent[0] : resourceContent;

                        resources.push({
                            type,
                            name,
                            properties
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error parsing Terraform file ${filePath}:`, error);
    }
    return resources;
}
