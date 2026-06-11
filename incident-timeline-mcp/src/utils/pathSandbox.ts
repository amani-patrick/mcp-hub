import * as fs from "fs";
import * as path from "path";

function defaultAllowedRoots(packageName: string): string[] {
    const cwd = process.cwd();
    return [
        cwd,
        path.join(cwd, "samples"),
        path.join(cwd, packageName, "samples"),
    ];
}

export function resolveAllowedPath(inputPath: string, envVar: string, packageName: string): string {
    const configured = (process.env[envVar] || "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);

    const roots = [...new Set([...configured, ...defaultAllowedRoots(packageName)])].map((root) =>
        path.resolve(root)
    );

    if (inputPath.includes("..")) {
        throw new Error(`Path traversal not allowed: ${inputPath}`);
    }

    const resolved = path.resolve(inputPath);
    const allowed = roots.some((root) => {
        const relative = path.relative(root, resolved);
        return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
    });

    if (!allowed) {
        throw new Error(`Path not allowed: ${resolved}. Allowed roots: ${roots.join(", ")}`);
    }

    if (!fs.existsSync(resolved)) {
        throw new Error(`Path does not exist: ${resolved}`);
    }

    return resolved;
}
