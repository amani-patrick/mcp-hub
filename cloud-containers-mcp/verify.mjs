import { handleDiscoveryTool } from './build/tools/discovery.js';
import { handleOperationsTool } from './build/tools/operations.js';
import { handleGuardedTool } from './build/tools/guarded.js';

// Mock the AWS ECS Client
// We do this by intercepting the adapter's client or just relying on the fact that
// without creds, the real client will throw, and our adapter catches it.
// However, to verify logic, we want to see success paths.
// Since we can't easily mock the internal client of the exported adapter singleton without
// dependency injection or proxying, we will rely on the adapter's error handling for "no creds"
// to verify it doesn't crash, and then manually verify the tool logic for validation.

async function verify() {
  console.log('Starting verification...');

  // 1. Test Discovery (List Environments)
  try {
    const envs = await handleDiscoveryTool('list_environments', {});
    console.log('✅ list_environments handled (empty/error expected without creds):', JSON.parse(envs.content[0].text));
  } catch (err) {
    console.error('❌ list_environments crashed:', err);
  }

  // 2. Test Scaling Validation (Logic Check)
  try {
    await handleOperationsTool('scale_service', {
      environmentId: 'test-cluster',
      serviceName: 'test-service',
      count: 100 // Exceeds limit of 10
    });
    console.error('❌ Failed to enforce scaling limit');
  } catch (err) {
    if (err.message.includes('Scaling limit exceeded')) {
      console.log('✅ Scaling limit enforced');
    } else {
      console.error('❌ Unexpected error for scaling:', err);
    }
  }

  // 3. Test Guarded Action (Confirmation)
  try {
    await handleGuardedTool('delete_service', {
      environmentId: 'test-cluster',
      serviceName: 'test-service',
      confirm: false
    });
    console.error('❌ Failed to require confirmation for delete_service');
  } catch (err) {
    if (err.message.includes('confirmation required')) {
      console.log('✅ Required confirmation for delete_service');
    } else {
      console.error('❌ Unexpected error for delete_service:', err);
    }
  }

  console.log('Verification complete.');
}

verify().catch(console.error);
