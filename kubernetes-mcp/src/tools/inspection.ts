import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { k8sCoreApi, k8sAppsApi } from '../k8s.js';
import { isNamespaceAllowed } from '../config.js';

export const inspectionTools: Tool[] = [
    {
        name: 'get_pod_status',
        description: 'Return pod phase, conditions, container states, and restart reasons.',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace of the pod' },
                podName: { type: 'string', description: 'Name of the pod' },
            },
            required: ['namespace', 'podName'],
        },
    },
    {
        name: 'get_pod_logs',
        description: 'Fetch bounded logs from a pod or specific container.',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace of the pod' },
                podName: { type: 'string', description: 'Name of the pod' },
                containerName: { type: 'string', description: 'Optional container name' },
                tailLines: { type: 'number', description: 'Number of lines to show (default 100)' },
            },
            required: ['namespace', 'podName'],
        },
    },
    {
        name: 'describe_deployment',
        description: 'Structured deployment configuration summary (image, replicas, probes).',
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
        name: 'get_events',
        description: 'Return recent Kubernetes events filtered by object or namespace.',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace to list events in' },
                objectName: { type: 'string', description: 'Optional object name to filter by' },
            },
            required: ['namespace'],
        },
    },
];

export async function handleInspectionTool(name: string, args: any) {
    if (!isNamespaceAllowed(args.namespace)) {
        throw new Error(`Access to namespace '${args.namespace}' is not allowed.`);
    }

    switch (name) {
        case 'get_pod_status': {
            const pod = await k8sCoreApi.readNamespacedPod(args.podName, args.namespace);
            const status = {
                phase: pod.body.status?.phase,
                conditions: pod.body.status?.conditions,
                containerStatuses: pod.body.status?.containerStatuses,
            };
            return {
                content: [{ type: 'text', text: JSON.stringify(status, null, 2) }],
            };
        }
        case 'get_pod_logs': {
            const logs = await k8sCoreApi.readNamespacedPodLog(
                args.podName,
                args.namespace,
                args.containerName,
                undefined, // follow
                undefined, // limitBytes
                undefined, // pretty
                undefined, // previous
                undefined, // sinceSeconds
                args.tailLines || 100, // tailLines
                undefined // timestamps
            );
            return {
                content: [{ type: 'text', text: logs.body }],
            };
        }
        case 'describe_deployment': {
            const deployment = await k8sAppsApi.readNamespacedDeployment(args.deploymentName, args.namespace);
            const description = {
                image: deployment.body.spec?.template.spec?.containers.map(c => c.image),
                replicas: deployment.body.spec?.replicas,
                strategy: deployment.body.spec?.strategy,
                selector: deployment.body.spec?.selector,
            };
            return {
                content: [{ type: 'text', text: JSON.stringify(description, null, 2) }],
            };
        }
        case 'get_events': {
            const events = await k8sCoreApi.listNamespacedEvent(
                args.namespace,
                undefined, // pretty
                undefined, // allowWatchBookmarks
                undefined, // _continue
                args.objectName ? `involvedObject.name=${args.objectName}` : undefined // fieldSelector
            );
            const simplifiedEvents = events.body.items.map(e => ({
                type: e.type,
                reason: e.reason,
                message: e.message,
                object: e.involvedObject.name,
                count: e.count,
                lastTimestamp: e.lastTimestamp,
            }));
            return {
                content: [{ type: 'text', text: JSON.stringify(simplifiedEvents, null, 2) }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
