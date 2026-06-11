import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { handleReadOnlyTool } from './build/tools/readOnly.js';
import { handleDestructiveTool } from './build/tools/destructive.js';
import { resolveRepoPath } from './build/config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

async function verify() {
    if (!existsSync('./build/index.js')) {
        console.error('❌ build/index.js missing — run npm run build');
        process.exit(1);
    }
    console.log('✅ git-mcp build output present');

    try {
        resolveRepoPath('/etc/passwd');
        console.error('❌ Failed to block disallowed path');
        process.exit(1);
    } catch (err) {
        if (err instanceof Error && err.message.includes('not allowed')) {
            console.log('✅ Blocked disallowed repository path');
        } else {
            throw err;
        }
    }

    try {
        await handleDestructiveTool('git_branch_delete', {
            repoPath: repoRoot,
            branch: 'temp-test-branch',
            confirm: false,
        });
        console.error('❌ Failed to require confirmation');
        process.exit(1);
    } catch (err) {
        if (err instanceof Error && err.message.includes('confirmation required')) {
            console.log('✅ Required confirmation for destructive tool');
        } else {
            throw err;
        }
    }

    try {
        await handleDestructiveTool('git_branch_delete', {
            repoPath: repoRoot,
            branch: 'main',
            confirm: true,
        });
        console.error('❌ Failed to block protected branch delete');
        process.exit(1);
    } catch (err) {
        if (err instanceof Error && err.message.includes('protected')) {
            console.log('✅ Blocked deletion of protected branch');
        } else {
            throw err;
        }
    }

    try {
        const result = await handleReadOnlyTool('git_status', { repoPath: repoRoot });
        const parsed = JSON.parse(result.content[0].text);
        if (parsed.branch) {
            console.log(`✅ git_status succeeded (branch: ${parsed.branch})`);
        } else {
            throw new Error('git_status returned unexpected payload');
        }
    } catch (err) {
        console.error('❌ git_status failed:', err instanceof Error ? err.message : err);
        process.exit(1);
    }

    console.log('Verification complete.');
}

verify().catch((err) => {
    console.error(err);
    process.exit(1);
});
