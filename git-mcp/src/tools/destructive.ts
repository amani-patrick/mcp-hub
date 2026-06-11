import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GitClient } from '../git.js';
import {
    assertBranchDeletable,
    requireConfirm,
    validateRefName,
} from '../config.js';

export const destructiveTools: Tool[] = [
    {
        name: 'git_reset',
        description: 'Reset HEAD to a ref. Hard reset requires explicit confirmation.',
        inputSchema: {
            type: 'object',
            properties: {
                repoPath: { type: 'string', description: 'Path to the git repository' },
                mode: { type: 'string', enum: ['soft', 'mixed', 'hard'], description: 'Reset mode' },
                ref: { type: 'string', description: 'Target ref (default HEAD~1)' },
                confirm: { type: 'boolean', description: 'Must be true for mixed/hard reset' },
            },
            required: ['repoPath', 'confirm'],
        },
    },
    {
        name: 'git_push',
        description: 'Push commits to a remote. Force push requires confirm and force: true.',
        inputSchema: {
            type: 'object',
            properties: {
                repoPath: { type: 'string', description: 'Path to the git repository' },
                remote: { type: 'string', description: 'Remote name (default origin)' },
                branch: { type: 'string', description: 'Branch to push (default current branch)' },
                force: { type: 'boolean', description: 'Force push (requires confirm)' },
                confirm: { type: 'boolean', description: 'Must be true to push' },
            },
            required: ['repoPath', 'confirm'],
        },
    },
    {
        name: 'git_branch_delete',
        description: 'Delete a local branch. Protected branches are blocked.',
        inputSchema: {
            type: 'object',
            properties: {
                repoPath: { type: 'string', description: 'Path to the git repository' },
                branch: { type: 'string', description: 'Branch name to delete' },
                force: { type: 'boolean', description: 'Force delete unmerged branch (-D)' },
                confirm: { type: 'boolean', description: 'Must be true to delete' },
            },
            required: ['repoPath', 'branch', 'confirm'],
        },
    },
    {
        name: 'git_clean',
        description: 'Remove untracked files and directories from the working tree.',
        inputSchema: {
            type: 'object',
            properties: {
                repoPath: { type: 'string', description: 'Path to the git repository' },
                directories: { type: 'boolean', description: 'Also remove untracked directories' },
                confirm: { type: 'boolean', description: 'Must be true to clean' },
            },
            required: ['repoPath', 'confirm'],
        },
    },
    {
        name: 'git_stash_drop',
        description: 'Drop a stash entry permanently.',
        inputSchema: {
            type: 'object',
            properties: {
                repoPath: { type: 'string', description: 'Path to the git repository' },
                index: { type: 'number', description: 'Stash index (default 0)' },
                confirm: { type: 'boolean', description: 'Must be true to drop stash' },
            },
            required: ['repoPath', 'confirm'],
        },
    },
];

export async function handleDestructiveTool(name: string, args: any) {
    const git = new GitClient(args.repoPath);

    switch (name) {
        case 'git_reset': {
            requireConfirm(args.confirm, 'git_reset');
            const mode = args.mode || 'mixed';
            if (mode === 'hard') {
                requireConfirm(args.confirm, 'git_reset hard');
            }
            const ref = args.ref || 'HEAD~1';
            validateRefName(ref);
            const output = await git.run(['reset', `--${mode}`, ref]);
            const head = await git.run(['rev-parse', 'HEAD']);
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({ mode, ref, head, output: output || 'Reset complete' }, null, 2),
                }],
            };
        }
        case 'git_push': {
            requireConfirm(args.confirm, 'git_push');
            const remote = args.remote || 'origin';
            validateRefName(remote);
            const branch = args.branch || await git.currentBranch();
            validateRefName(branch);

            const pushArgs = ['push', remote, branch];
            if (args.force === true) {
                requireConfirm(args.confirm, 'git_push with force');
                pushArgs.splice(1, 0, '--force-with-lease');
            }

            const output = await git.run(pushArgs);
            return {
                content: [{ type: 'text', text: output || `Pushed ${branch} to ${remote}` }],
            };
        }
        case 'git_branch_delete': {
            requireConfirm(args.confirm, 'git_branch_delete');
            assertBranchDeletable(args.branch);
            const deleteArgs = ['branch', args.force ? '-D' : '-d', args.branch];
            const output = await git.run(deleteArgs);
            return {
                content: [{ type: 'text', text: output || `Deleted branch ${args.branch}` }],
            };
        }
        case 'git_clean': {
            requireConfirm(args.confirm, 'git_clean');
            const cleanArgs = ['clean', '-f'];
            if (args.directories) cleanArgs.push('-d');
            const output = await git.run(cleanArgs);
            return {
                content: [{ type: 'text', text: output || 'Working tree cleaned' }],
            };
        }
        case 'git_stash_drop': {
            requireConfirm(args.confirm, 'git_stash_drop');
            const index = Number.isInteger(args.index) ? args.index : 0;
            if (index < 0) throw new Error('Stash index must be non-negative');
            const ref = index === 0 ? 'stash@{0}' : `stash@{${index}}`;
            const output = await git.run(['stash', 'drop', ref]);
            return {
                content: [{ type: 'text', text: output || `Dropped ${ref}` }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
