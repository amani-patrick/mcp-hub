import { handleDiscoveryTool } from './build/tools/discovery.js';
import { handleInspectionTool } from './build/tools/inspection.js';
import { handleSecurityTool } from './build/tools/security.js';
import { handleGuardedTool } from './build/tools/guarded.js';

async function verify() {
  console.log('Starting verification...');

  // 1. Test Discovery (Public Docker Hub)
  try {
    const registries = await handleDiscoveryTool('list_registries', {});
    console.log('✅ list_registries success:', JSON.parse(registries.content[0].text));
  } catch (err) {
    console.error('❌ list_registries failed:', err);
  }

  // 2. Test Inspection (Public Image)
  try {
    const tags = await handleInspectionTool('list_tags', {
      repository: 'library/alpine'
    });
    // Note: Docker Hub public API might rate limit or behave differently without auth,
    // but the adapter should handle it gracefully or fail with a clear error.
    console.log('✅ list_tags success (or handled):', JSON.parse(tags.content[0].text).slice(0, 5));
  } catch (err) {
    console.log('⚠️ list_tags failed (expected if rate limited or auth required):', err.message);
  }

  // 3. Test Security Policy
  try {
    const compliance = await handleSecurityTool('check_image_policy_compliance', {
      repository: 'library/alpine',
      tag: 'latest'
    });
    const result = JSON.parse(compliance.content[0].text);
    if (result.compliant === false && result.violations.includes('Usage of "latest" tag is discouraged in production.')) {
      console.log('✅ Policy check correctly flagged "latest" tag');
    } else {
      console.error('❌ Policy check failed to flag "latest" tag');
    }
  } catch (err) {
    console.error('❌ Policy check failed:', err);
  }

  // 4. Test Guarded Action (Blocked Tag)
  try {
    await handleGuardedTool('delete_tag', {
      repository: 'my-repo',
      tag: 'latest',
      confirm: true,
      namespace: 'dev'
    });
    console.error('❌ Failed to block deletion of "latest" tag');
  } catch (err) {
    if (err.message.includes('blocked')) {
      console.log('✅ Blocked deletion of "latest" tag');
    } else {
      console.error('❌ Unexpected error deleting tag:', err);
    }
  }

  console.log('Verification complete.');
}

verify().catch(console.error);
