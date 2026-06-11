import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { k8sAppsApi, k8sCoreApi, k8sNetworkingApi } from '../k8s.js';
import { isNamespaceAllowed, isResourceBlocked, CONFIRMATION_REQUIRED_RESOURCES } from '../config.js';

export const advancedTools: Tool[] = [
    {
        name: 'delete_resource',
        description: 'Delete a Kubernetes resource (Deployment, Service, ConfigMap, etc.). Secrets and RBAC types are blocked. Requires confirmation.',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace of the resource' },
                resourceType: { type: 'string', description: 'Resource kind (e.g. Deployment, Service)' },
                resourceName: { type: 'string', description: 'Name of the resource' },
                confirm: { type: 'boolean', description: 'Must be set to true to confirm deletion' },
            },
            required: ['namespace', 'resourceType', 'resourceName', 'confirm'],
        },
    },
];

async function deleteByType(namespace: string, resourceType: string, resourceName: string): Promise<void> {
    switch (resourceType) {
        case 'Deployment':
            await k8sAppsApi.deleteNamespacedDeployment(resourceName, namespace);
            break;
        case 'StatefulSet':
            await k8sAppsApi.deleteNamespacedStatefulSet(resourceName, namespace);
            break;
        case 'ConfigMap':
            await k8sCoreApi.deleteNamespacedConfigMap(resourceName, namespace);
            break;
        case 'Service':
            await k8sCoreApi.deleteNamespacedService(resourceName, namespace);
            break;
        case 'Ingress':
            await k8sNetworkingApi.deleteNamespacedIngress(resourceName, namespace);
            break;
        case 'Pod':
            await k8sCoreApi.deleteNamespacedPod(resourceName, namespace);
            break;
        default:
            throw new Error(`Unsupported resource type for deletion: ${resourceType}`);
    }
}

export async function handleAdvancedTool(name: string, args: any) {
    if (!isNamespaceAllowed(args.namespace)) {
        throw new Error(`Access to namespace '${args.namespace}' is not allowed.`);
    }

    switch (name) {
        case 'delete_resource': {
            if (args.confirm !== true) {
                throw new Error('Operation cancelled: confirmation required (set confirm: true)');
            }

            const resourceType = args.resourceType.charAt(0).toUpperCase() + args.resourceType.slice(1);

            if (isResourceBlocked(resourceType)) {
                throw new Error(`Deletion of ${resourceType} is blocked for safety.`);
            }

            if (!CONFIRMATION_REQUIRED_RESOURCES.includes(resourceType)) {
                throw new Error(`Resource type ${resourceType} is not in the allowed deletion list.`);
            }

            await deleteByType(args.namespace, resourceType, args.resourceName);
            return {
                content: [{
                    type: 'text',
                    text: `Deleted ${resourceType}/${args.resourceName} in namespace ${args.namespace}.`,
                }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
