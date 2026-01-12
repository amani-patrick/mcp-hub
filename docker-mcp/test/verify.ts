import { docker } from '../src/docker.js';
import { handleReadOnlyTool } from '../src/tools/readOnly.js';
import { handleGuardedTool } from '../src/tools/guarded.js';
import { handleDestructiveTool } from '../src/tools/destructive.js';
import { ALLOWED_BUILD_PATHS } from '../src/config.js';
import path from 'path';
import fs from 'fs-extra';

async function verify() {
    console.log('Starting verification...');

    // 1. Test Docker Connection
    try {
        const containers = await handleReadOnlyTool('list_containers', { all: true });
        console.log('✅ list_containers success');
    } catch (err) {
        console.error('❌ list_containers failed:', err);
    }

    // 2. Test Guarded Build (Failure Case)
    try {
        await handleGuardedTool('build_image_from_path', {
            path: '/tmp/invalid-path',
            tag: 'test:latest'
        });
        console.error('❌ Guarded build failed to block invalid path');
    } catch (err: any) {
        if (err.message.includes('Build path not allowed')) {
            console.log('✅ Guarded build blocked invalid path');
        } else {
            console.error('❌ Guarded build failed with unexpected error:', err);
        }
    }

    // 3. Test Destructive Action (Failure Case)
    try {
        await handleDestructiveTool('remove_container', {
            containerId: 'non-existent',
            confirm: false
        });
        console.error('❌ Destructive action failed to require confirmation');
    } catch (err: any) {
        if (err.message.includes('confirmation required')) {
            console.log('✅ Destructive action required confirmation');
        } else {
            console.error('❌ Destructive action failed with unexpected error:', err);
        }
    }

    console.log('Verification complete.');
}

verify().catch(console.error);
