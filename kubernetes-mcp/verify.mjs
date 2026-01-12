import { handleDiscoveryTool } from './build/tools/discovery.js';
import { handleInspectionTool } from './build/tools/inspection.js';
import { handleSafeOperationsTool } from './build/tools/safeOperations.js';
import { handleAdvancedTool } from './build/tools/advanced.js';

async function verify() {
  console.log('Starting verification...');

  // 1. Test Discovery (Allowed Namespace)
  try {
    const namespaces = await handleDiscoveryTool('list_namespaces', {});
    console.log('✅ list_namespaces success:', JSON.parse(namespaces.content[0].text));
  } catch (err) {
    console.error('❌ list_namespaces failed:', err);
  }

  // 2. Test Safety Guard (Blocked Namespace)
  try {
    await handleInspectionTool('get_pod_status', {
      namespace: 'kube-system',
      podName: 'test-pod'
    });
    console.error('❌ Failed to block access to kube-system');
  } catch (err) {
    if (err.message.includes('not allowed')) {
      console.log('✅ Blocked access to kube-system');
    } else {
      console.error('❌ Unexpected error accessing kube-system:', err);
    }
  }

  // 3. Test Safety Guard (Confirmation Required)
  try {
    await handleSafeOperationsTool('delete_pod', {
      namespace: 'default',
      podName: 'test-pod',
      confirm: false
    });
    console.error('❌ Failed to require confirmation for delete_pod');
  } catch (err) {
    if (err.message.includes('confirmation required')) {
      console.log('✅ Required confirmation for delete_pod');
    } else {
      console.error('❌ Unexpected error for delete_pod:', err);
    }
  }

  // 4. Test Blocked Resource
  try {
    await handleAdvancedTool('delete_resource', {
      namespace: 'default',
      resourceType: 'Secret',
      resourceName: 'my-secret',
      confirm: true
    });
    console.error('❌ Failed to block deletion of Secret');
  } catch (err) {
    if (err.message.includes('blocked')) {
      console.log('✅ Blocked deletion of Secret');
    } else {
      console.error('❌ Unexpected error deleting Secret:', err);
    }
  }

  console.log('Verification complete.');
}

verify().catch(console.error);
