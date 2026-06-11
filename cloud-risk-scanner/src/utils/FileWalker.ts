import * as fs from "fs";
import * as path from "path";

export function walkFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) {
        throw new Error(`Path not found: ${dir}`);
    }
    const stat = fs.statSync(dir);
    if (!stat.isDirectory()) {
        return [dir];
    }

    const files: string[] = [];
    for (const file of fs.readdirSync(dir)) {
        const filePath = path.join(dir, file);
        try {
            if (fs.statSync(filePath).isDirectory()) {
                files.push(...walkFiles(filePath));
            } else {
                files.push(filePath);
            }
        } catch {
            // Skip unreadable paths
        }
    }
    return files;
}
