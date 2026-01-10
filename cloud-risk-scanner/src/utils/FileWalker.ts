import * as fs from "fs";
import * as path from "path";

export function walkFiles(dir: string): string[] {
    const files: string[] = [];
    // read directory synchronously
    fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            files.push(...walkFiles(filePath));
        } else {
            files.push(filePath);
        }
    });
    return files;
}