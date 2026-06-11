import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GitClient } from '../git.js';
import { requireConfirm, resolvePathInRepo, validateRefName } from '../config.js';

export const guardedTools: Tool[] = [
    {
        name: 'git_checkout',
        description: 'Switch branches or restore files. Does not discard local changes unless force is explicitly set.',
        inputSchema: {
            type: 'object',
            properties: {
                repoPath: { type: 'string', description: 'Path to the git repository' },
                target: { type: 'string', description: 'Branch name or commit ref' },
                createBranch: { type: 'boolean', description: 'Create branch with -b' },
                force: { type: 'boolean', description: 'Allow checkout that overwrites local changes (requires confirm)' },
                confirm: { type: 'boolean', description: 'Required when force is true' },
            },
            required: ['repoPath', 'target'],
        },
    },
    {
        name: 'git_stash',
        description: 'List, push, pop, or apply stashes.',
        inputSchema: {
            type: 'object',
            properties: {
                repoPath: { type: 'string', description: 'Path to the git repository' },
                action: { type: 'string', enum: ['list', 'push', 'pop', 'apply'], description: 'Stash action' },
                message: { type: 'string', description: 'Optional stash message for push' },
            },
            required: ['repoPath', 'action'],
        },
    },
    {
        name: 'git_add',
        description: 'Stage files for commit.',
        inputSchema: {
            type: 'object',
            properties: {
                repoPath: { type: 'string', description: 'Path to the git repository' },
                paths: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'File paths relative to repository root',
                },
                all: { type: 'boolean', description: 'Stage all modified files (-A)' },
            },
            required: ['repoPath'],
        },
    },
    {
        name: 'git_commit',
        description: 'Create a commit from staged changes.',
        inputSchema: {
            type: 'object',
            properties: {
                repoPath: { type: 'string', description: 'Path to the git repository' },
                message: { type: 'string', description: 'Commit message' },
                amend: { type: 'boolean', description: 'Amend previous commit (requires confirm)' },
                confirm: { type: 'boolean', description: 'Required when amend is true' },
            },
            required: ['repoPath', 'message'],
        },
    },
    {
        name: 'git_fetch',
        description: 'Fetch updates from a remote without merging.',
        inputSchema: {
            type: 'object',
            properties: {
                repoPath: { type: 'string', description: 'Path to the git repository' },
                remote: { type: 'string', description: 'Remote name (default origin)' },
                prune: { type: 'boolean', description: 'Prune deleted remote branches' },
            },
            required: ['repoPath'],
        },
    },
    {
        name: 'git_pull',
        description: 'Fetch and integrate changes from a remote branch.',
        inputSchema: {
            type: 'object',
            properties: {
                repoPath: { type: 'string', description: 'Path to the git repository' },
                remote: { type: 'string', description: 'Remote name (default origin)' },
                branch: { type: 'string', description: 'Branch to pull (default current branch)' },
                rebase: { type: 'boolean', description: 'Use rebase instead of merge' },
            },
            required: ['repoPath'],
        },
    },
];

export async function handleGuardedTool(name: string, args: any) {
    const git = new GitClient(args.repoPath);

    switch (name) {
        case 'git_checkout': {
            validateRefName(args.target);
            const checkoutArgs = ['checkout'];
            if (args.createBranch) checkoutArgs.push('-b');
            if (args.force === true) {
                requireConfirm(args.confirm, 'git_checkout with force');
                checkoutArgs.push('-f');
            }
            checkoutArgs.push(args.target);
            const output = await git.run(checkoutArgs);
            const branch = await git.currentBranch();
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({ branch, output: output || `Checked out ${args.target}` }, null, 2),
                }],
            };
        }
        case 'git_stash': {
            switch (args.action) {
                case 'list': {
                    const output = await git.run(['stash', 'list']);
                    return { content: [{ type: 'text', text: output || 'No stashes' }] };
                }
                case 'push': {
                    const pushArgs = ['stash', 'push'];
                    if (args.message) pushArgs.push('-m', args.message);
                    const output = await git.run(pushArgs);
                    return { content: [{ type: 'text', text: output || 'Changes stashed' }] };
                }
                case 'pop': {
                    const output = await git.run(['stash', 'pop']);
                    return { content: [{ type: 'text', text: output || 'Stash applied and dropped' }] };
                }
                case 'apply': {
                    const output = await git.run(['stash', 'apply']);
                    return { content: [{ type: 'text', text: output || 'Stash applied' }] };
                }
                default:
                    throw new Error(`Unsupported stash action: ${args.action}`);
            }
        }
        case 'git_add': {
            const addArgs = ['add'];
            if (args.all) {
                addArgs.push('-A');
            } else if (Array.isArray(args.paths) && args.paths.length > 0) {
                addArgs.push('--');
                for (const entry of args.paths) {
                    resolvePathInRepo(git.repoPath, entry);
                    addArgs.push(entry);
                }
            } else {
                throw new Error('Provide paths or set all: true');
            }
            await git.run(addArgs);
            const status = await git.run(['status', '--short']);
            return {
                content: [{ type: 'text', text: status || 'Nothing staged' }],
            };
        }
        case 'git_commit': {
            if (!args.message?.trim()) {
                throw new Error('Commit message is required');
            }
            const commitArgs = ['commit', '-m', args.message.trim()];
            if (args.amend === true) {
                requireConfirm(args.confirm, 'git_commit with amend');
                commitArgs.push('--amend');
            }
            const output = await git.run(commitArgs);
            const hash = await git.run(['rev-parse', 'HEAD']);
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({ commit: hash, output: output || 'Commit created' }, null, 2),
                }],
            };
        }
        case 'git_fetch': {
            const remote = args.remote || 'origin';
            validateRefName(remote);
            const fetchArgs = ['fetch', remote];
            if (args.prune) fetchArgs.push('--prune');
            const output = await git.run(fetchArgs);
            return {
                content: [{ type: 'text', text: output || `Fetched from ${remote}` }],
            };
        }
        case 'git_pull': {
            const remote = args.remote || 'origin';
            validateRefName(remote);
            const pullArgs = ['pull', remote];
            if (args.branch) {
                validateRefName(args.branch);
                pullArgs.push(args.branch);
            }
            if (args.rebase) pullArgs.push('--rebase');
            const output = await git.run(pullArgs);
            return {
                content: [{ type: 'text', text: output || 'Pull completed' }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
