import fs from "fs";
import yaml from "js-yaml";

export function parseK8sManifest(filePath: string): any[] {
    try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const documents = yaml.loadAll(raw);
        return documents.filter((doc) => doc !== null && typeof doc === 'object');
    } catch (error) {
        console.error(`Error parsing K8s manifest ${filePath}:`, error);
        return [];
    }
}
