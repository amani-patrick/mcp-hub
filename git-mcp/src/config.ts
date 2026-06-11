import * as fs from 'fs';
import * as path from 'path';

export const MAX_LOG_LINES = parseInt(process.env.GIT_MAX_LOG_LINES || '500', 10);
export const MAX_DIFF_LINES = parseInt(process.env.GIT_MAX_DIFF_LINES || '1000', 10);

export const PROTECTED_BRANCHES = (process.env.PROTECTED_BRANCHES || 'main,master,develop')
    .split(',')
    .map((branch) => branch.trim())
    .filter(Boolean);

function defaultAllowedRoots(): string[] {
    const cwd = process.cwd();
    return [
        cwd,
        path.resolve(cwd, '..'),
        path.join(cwd, 'samples'),
        path.join(cwd, 'git-mcp', 'samples'),
    ];
}

export function getAllowedRepoRoots(): string[] {
    const configured = (process.env.ALLOWED_REPO_PATHS || '')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);

    return [...new Set([...configured, ...defaultAllowedRoots()])].map((root) => path.resolve(root));
}

export function resolveRepoPath(inputPath: string): string {
    if (inputPath.includes('..')) {
        throw new Error(`Path traversal not allowed: ${inputPath}`);
    }

    const resolved = path.resolve(inputPath);
    const roots = getAllowedRepoRoots();
    const allowed = roots.some((root) => {
        const relative = path.relative(root, resolved);
        return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
    });

    if (!allowed) {
        throw new Error(`Repository path not allowed: ${resolved}. Allowed roots: ${roots.join(', ')}`);
    }

    if (!fs.existsSync(resolved)) {
        throw new Error(`Path does not exist: ${resolved}`);
    }

    return resolved;
}

export function assertGitRepository(repoPath: string): void {
    const gitDir = path.join(repoPath, '.git');
    if (!fs.existsSync(gitDir)) {
        throw new Error(`Not a git repository: ${repoPath}`);
    }
}

export function validateRefName(ref: string): void {
    if (!ref || ref.includes('..') || ref.startsWith('-') || /[\0\r\n]/.test(ref)) {
        throw new Error(`Invalid ref name: ${ref}`);
    }

    if (!/^[a-zA-Z0-9._\/-]+$/.test(ref)) {
        throw new Error(`Invalid ref name: ${ref}`);
    }
}

export function assertBranchDeletable(branch: string): void {
    validateRefName(branch);
    const normalized = branch.replace(/^refs\/heads\//, '');
    if (PROTECTED_BRANCHES.includes(normalized)) {
        throw new Error(`Branch '${normalized}' is protected and cannot be deleted`);
    }
}

export function requireConfirm(confirm: unknown, operation: string): void {
    if (confirm !== true) {
        throw new Error(`Operation cancelled: confirmation required for ${operation} (set confirm: true)`);
    }
}

export function resolvePathInRepo(repoPath: string, relativePath: string): string {
    if (relativePath.includes('..') || path.isAbsolute(relativePath)) {
        throw new Error(`Invalid path: ${relativePath}`);
    }

    const resolved = path.resolve(repoPath, relativePath);
    const relative = path.relative(repoPath, resolved);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error(`Path escapes repository: ${relativePath}`);
    }

    return resolved;
}
