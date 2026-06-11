import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GitClient } from '../git.js';
import { MAX_DIFF_LINES, MAX_LOG_LINES, validateRefName } from '../config.js';

export const readOnlyTools: Tool[] = [
    {
        name: 'git_status',
        description: 'Show working tree status for an allowlisted repository.',
        inputSchema: {
            type: 'object',
            properties: {
                repoPath: { type: 'string', description: 'Path to the git repository' },
            },
            required: ['repoPath'],
        },
    },
    {
        name: 'git_log',
        description: 'Show commit history with optional path filter and limit.',
        inputSchema: {
            type: 'object',
            properties: {
                repoPath: { type: 'string', description: 'Path to the git repository' },
                maxCount: { type: 'number', description: `Maximum commits (default 50, max ${MAX_LOG_LINES})` },
                path: { type: 'string', description: 'Optional file or directory path filter' },
                since: { type: 'string', description: 'Optional date/ref for --since' },
            },
            required: ['repoPath'],
        },
    },
    {
        name: 'git_diff',
        description: 'Show unstaged, staged, or commit diffs.',
        inputSchema: {
            type: 'object',
            properties: {
                repoPath: { type: 'string', description: 'Path to the git repository' },
                staged: { type: 'boolean', description: 'Show staged changes only' },
                commit: { type: 'string', description: 'Compare against a specific commit ref' },
                path: { type: 'string', description: 'Optional file path filter' },
            },
            required: ['repoPath'],
        },
    },
    {
        name: 'git_branch_list',
        description: 'List local and remote branches.',
        inputSchema: {
            type: 'object',
            properties: {
                repoPath: { type: 'string', description: 'Path to the git repository' },
                all: { type: 'boolean', description: 'Include remote branches' },
            },
            required: ['repoPath'],
        },
    },
    {
        name: 'git_show_commit',
        description: 'Show metadata and patch for a commit.',
        inputSchema: {
            type: 'object',
            properties: {
                repoPath: { type: 'string', description: 'Path to the git repository' },
                commit: { type: 'string', description: 'Commit hash or ref' },
            },
            required: ['repoPath', 'commit'],
        },
    },
    {
        name: 'git_remote_list',
        description: 'List configured remotes.',
        inputSchema: {
            type: 'object',
            properties: {
                repoPath: { type: 'string', description: 'Path to the git repository' },
            },
            required: ['repoPath'],
        },
    },
    {
        name: 'git_file_history',
        description: 'Show commit history for a specific file.',
        inputSchema: {
            type: 'object',
            properties: {
                repoPath: { type: 'string', description: 'Path to the git repository' },
                path: { type: 'string', description: 'File path relative to repository root' },
                maxCount: { type: 'number', description: `Maximum commits (default 20, max ${MAX_LOG_LINES})` },
            },
            required: ['repoPath', 'path'],
        },
    },
];

function truncateOutput(text: string, maxLines: number): string {
    const lines = text.split('\n');
    if (lines.length <= maxLines) {
        return text;
    }
    return `${lines.slice(0, maxLines).join('\n')}\n... truncated (${lines.length - maxLines} more lines)`;
}

export async function handleReadOnlyTool(name: string, args: any) {
    const git = new GitClient(args.repoPath);

    switch (name) {
        case 'git_status': {
            const [branch, status] = await Promise.all([
                git.currentBranch(),
                git.run(['status', '--porcelain=v2', '-b']),
            ]);
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({ branch, status: status.split('\n').filter(Boolean) }, null, 2),
                }],
            };
        }
        case 'git_log': {
            const maxCount = Math.min(Math.max(args.maxCount ?? 50, 1), MAX_LOG_LINES);
            const logArgs = ['log', `--max-count=${maxCount}`, '--date=iso', '--pretty=format:%H|%an|%ae|%ad|%s'];
            if (args.since) {
                if (/[;&|$<>]/.test(args.since) || args.since.includes('`')) {
                    throw new Error(`Invalid since value: ${args.since}`);
                }
                logArgs.push(`--since=${args.since}`);
            }
            if (args.path) {
                logArgs.push('--', git.repoRelativePath(args.path));
            }
            const output = await git.run(logArgs);
            const commits = output.split('\n').filter(Boolean).map((line) => {
                const [hash, author, email, date, ...messageParts] = line.split('|');
                return { hash, author, email, date, subject: messageParts.join('|') };
            });
            return {
                content: [{ type: 'text', text: JSON.stringify({ count: commits.length, commits }, null, 2) }],
            };
        }
        case 'git_diff': {
            const diffArgs = ['diff', '--unified=3'];
            if (args.staged) diffArgs.push('--cached');
            if (args.commit) {
                validateRefName(args.commit);
                diffArgs.push(args.commit);
            }
            if (args.path) {
                diffArgs.push('--', git.repoRelativePath(args.path));
            }
            const output = await git.run(diffArgs);
            return {
                content: [{ type: 'text', text: truncateOutput(output || 'No differences', MAX_DIFF_LINES) }],
            };
        }
        case 'git_branch_list': {
            const branches = await git.run(args.all ? ['branch', '-a', '-vv'] : ['branch', '-vv']);
            return {
                content: [{ type: 'text', text: branches || 'No branches found' }],
            };
        }
        case 'git_show_commit': {
            validateRefName(args.commit);
            const [metadata, patch] = await Promise.all([
                git.run(['show', '--no-patch', '--format=fuller', args.commit]),
                git.run(['show', '--format=', args.commit]),
            ]);
            return {
                content: [{
                    type: 'text',
                    text: truncateOutput(metadata + '\n\n' + patch, MAX_DIFF_LINES),
                }],
            };
        }
        case 'git_remote_list': {
            const remotes = await git.run(['remote', '-v']);
            return {
                content: [{ type: 'text', text: remotes || 'No remotes configured' }],
            };
        }
        case 'git_file_history': {
            const maxCount = Math.min(Math.max(args.maxCount ?? 20, 1), MAX_LOG_LINES);
            const filePath = git.repoRelativePath(args.path);
            const output = await git.run([
                'log',
                `--max-count=${maxCount}`,
                '--date=iso',
                '--pretty=format:%H|%an|%ad|%s',
                '--',
                filePath,
            ]);
            const commits = output.split('\n').filter(Boolean).map((line) => {
                const [hash, author, date, ...messageParts] = line.split('|');
                return { hash, author, date, subject: messageParts.join('|'), path: filePath };
            });
            return {
                content: [{ type: 'text', text: JSON.stringify({ path: filePath, commits }, null, 2) }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
