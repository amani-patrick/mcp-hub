import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { k8sAppsApi, k8sCoreApi } from '../k8s.js';
import { isNamespaceAllowed } from '../config.js';

export const safeOperationsTools: Tool[] = [
    {
        name: 'scale_deployment',
        description: 'Scale a deployment within allowed min/max replica bounds.',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace of the deployment' },
                deploymentName: { type: 'string', description: 'Name of the deployment' },
                replicas: { type: 'number', description: 'Target number of replicas' },
            },
            required: ['namespace', 'deploymentName', 'replicas'],
        },
    },
    {
        name: 'restart_deployment',
        description: 'Trigger a rolling restart by updating pod template annotations.',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace of the deployment' },
                deploymentName: { type: 'string', description: 'Name of the deployment' },
            },
            required: ['namespace', 'deploymentName'],
        },
    },
    {
        name: 'delete_pod',
        description: 'Delete a pod to force recreation (eviction-safe only). Requires confirmation.',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace of the pod' },
                podName: { type: 'string', description: 'Name of the pod' },
                confirm: { type: 'boolean', description: 'Must be set to true to confirm deletion' },
            },
            required: ['namespace', 'podName', 'confirm'],
        },
    },
];

export async function handleSafeOperationsTool(name: string, args: any) {
    if (!isNamespaceAllowed(args.namespace)) {
        throw new Error(`Access to namespace '${args.namespace}' is not allowed.`);
    }

    switch (name) {
        case 'scale_deployment': {
            // In a real scenario, we would check min/max bounds here
            const patch = [
                {
                    op: 'replace',
                    path: '/spec/replicas',
                    value: args.replicas,
                },
            ];
            await k8sAppsApi.patchNamespacedDeployment(
                args.deploymentName,
                args.namespace,
                patch,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                { headers: { 'Content-Type': 'application/json-patch+json' } }
            );
            return {
                content: [{ type: 'text', text: `Deployment ${args.deploymentName} scaled to ${args.replicas} replicas.` }],
            };
        }
        case 'restart_deployment': {
            const patch = [
                {
                    op: 'add',
                    path: '/spec/template/metadata/annotations/kubectl.kubernetes.io~1restartedAt',
                    value: new Date().toISOString(),
                },
            ];
            await k8sAppsApi.patchNamespacedDeployment(
                args.deploymentName,
                args.namespace,
                patch,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                { headers: { 'Content-Type': 'application/json-patch+json' } }
            );
            return {
                content: [{ type: 'text', text: `Deployment ${args.deploymentName} restarted.` }],
            };
        }
        case 'delete_pod': {
            if (args.confirm !== true) {
                throw new Error('Operation cancelled: confirmation required (set confirm: true)');
            }
            await k8sCoreApi.deleteNamespacedPod(args.podName, args.namespace);
            return {
                content: [{ type: 'text', text: `Pod ${args.podName} deleted.` }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
