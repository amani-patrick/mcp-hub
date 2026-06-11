import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { assertGitRepository, resolveRepoPath } from './config.js';

const BLOCKED_GIT_ARGS = new Set(['-c', '--exec', '--upload-pack', '--receive-pack']);

function validateGitArgs(args: string[]): void {
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (/[;&|$<>]/.test(arg) || arg.includes('\u0060')) {
            throw new Error(`Invalid git argument: ${arg}`);
        }
        if (BLOCKED_GIT_ARGS.has(arg)) {
            throw new Error(`Blocked git flag: ${arg}`);
        }
        if (arg === '-c' || arg.startsWith('-c')) {
            throw new Error('Git config overrides are not allowed');
        }
    }
}

export interface GitResult {
    stdout: string;
    stderr: string;
    exitCode: number;
}

export async function runGit(repoPath: string, args: string[]): Promise<GitResult> {
    validateGitArgs(args);

    return new Promise((resolve, reject) => {
        const proc = spawn('git', args, {
            cwd: repoPath,
            env: {
                ...process.env,
                GIT_TERMINAL_PROMPT: '0',
                GIT_PAGER: 'cat',
            },
        });

        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (chunk) => {
            stdout += chunk.toString();
        });
        proc.stderr.on('data', (chunk) => {
            stderr += chunk.toString();
        });

        proc.on('error', (error) => {
            reject(new Error(`Failed to run git: ${error.message}`));
        });

        proc.on('close', (exitCode) => {
            resolve({
                stdout,
                stderr,
                exitCode: exitCode ?? 1,
            });
        });
    });
}

export class GitClient {
    readonly repoPath: string;

    constructor(repoPath: string) {
        this.repoPath = resolveRepoPath(repoPath);
        assertGitRepository(this.repoPath);
    }

    async run(args: string[]): Promise<string> {
        const result = await runGit(this.repoPath, args);
        if (result.exitCode !== 0) {
            const message = result.stderr.trim() || result.stdout.trim() || `git ${args.join(' ')} failed`;
            throw new Error(message);
        }
        return result.stdout.trimEnd();
    }

    async runAllowFailure(args: string[]): Promise<GitResult> {
        return runGit(this.repoPath, args);
    }

    async currentBranch(): Promise<string> {
        return this.run(['rev-parse', '--abbrev-ref', 'HEAD']);
    }

    async isClean(): Promise<boolean> {
        const status = await this.run(['status', '--porcelain']);
        return status.length === 0;
    }

    repoRelativePath(relativePath: string): string {
        const resolved = path.resolve(this.repoPath, relativePath);
        const rel = path.relative(this.repoPath, resolved);
        if (rel.startsWith('..') || path.isAbsolute(rel)) {
            throw new Error(`Path escapes repository: ${relativePath}`);
        }
        if (!fs.existsSync(resolved)) {
            throw new Error(`Path does not exist in repository: ${relativePath}`);
        }
        return rel.split(path.sep).join('/');
    }
}

export async function checkGitAvailability(): Promise<boolean> {
    return new Promise((resolve) => {
        const proc = spawn('git', ['--version'], { stdio: 'ignore' });
        proc.on('error', () => resolve(false));
        proc.on('close', (code) => resolve(code === 0));
    });
}
