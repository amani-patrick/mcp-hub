import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { k8sCoreApi, k8sAppsApi, k8sBatchApi } from '../k8s.js';
import { ALLOWED_NAMESPACES, isNamespaceAllowed } from '../config.js';

export const discoveryTools: Tool[] = [

    {
        name: 'list_namespaces',
        description: 'List namespaces the MCP is authorized to access.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'list_nodes',
        description: 'List nodes with status, roles, and allocatable resources.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'get_node_status',
        description: 'Detailed health and condition report for a node.',
        inputSchema: {
            type: 'object',
            properties: {
                nodeName: { type: 'string', description: 'Name of the node' },
            },
            required: ['nodeName'],
        },
    },
    {
        name: 'list_deployments',
        description: 'List deployments in a namespace with replica counts and rollout status.',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace to list deployments in' },
            },
            required: ['namespace'],
        },
    },
    {
        name: 'list_statefulsets',
        description: 'List stateful workloads and their readiness.',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace to list statefulsets in' },
            },
            required: ['namespace'],
        },
    },
    {
        name: 'list_daemonsets',
        description: 'List daemonsets and node coverage.',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace to list daemonsets in' },
            },
            required: ['namespace'],
        },
    },
    {
        name: 'list_pods',
        description: 'List pods in a namespace with phase, restarts, and node placement.',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace to list pods in' },
            },
            required: ['namespace'],
        },
    },
    {
        name: 'list_jobs',
        description: 'List batch jobs and completion status.',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace to list jobs in' },
            },
            required: ['namespace'],
        },
    },
    {
        name: 'list_cronjobs',
        description: 'List scheduled jobs and next execution time.',
        inputSchema: {
            type: 'object',
            properties: {
                namespace: { type: 'string', description: 'Namespace to list cronjobs in' },
            },
            required: ['namespace'],
        },
    },
];

export async function handleDiscoveryTool(name: string, args: any) {
    switch (name) {

        case 'list_namespaces': {
            // Return only allowed namespaces
            return {
                content: [{ type: 'text', text: JSON.stringify(ALLOWED_NAMESPACES, null, 2) }],
            };
        }
        case 'list_nodes': {
            const nodes = await k8sCoreApi.listNode();
            const simplifiedNodes = nodes.body.items.map(node => ({
                name: node.metadata?.name,
                status: node.status?.conditions?.find(c => c.type === 'Ready')?.status,
                roles: Object.keys(node.metadata?.labels || {}).filter(l => l.startsWith('node-role.kubernetes.io/')),
                allocatable: node.status?.allocatable,
            }));
            return {
                content: [{ type: 'text', text: JSON.stringify(simplifiedNodes, null, 2) }],
            };
        }
        case 'get_node_status': {
            const node = await k8sCoreApi.readNode(args.nodeName);
            return {
                content: [{ type: 'text', text: JSON.stringify(node.body.status, null, 2) }],
            };
        }
        case 'list_deployments': {
            if (!isNamespaceAllowed(args.namespace)) {
                throw new Error(`Access to namespace '${args.namespace}' is not allowed.`);
            }
            const deployments = await k8sAppsApi.listNamespacedDeployment(args.namespace);
            const simplifiedDeployments = deployments.body.items.map(d => ({
                name: d.metadata?.name,
                replicas: d.status?.replicas,
                availableReplicas: d.status?.availableReplicas,
                readyReplicas: d.status?.readyReplicas,
                updatedReplicas: d.status?.updatedReplicas,
            }));
            return {
                content: [{ type: 'text', text: JSON.stringify(simplifiedDeployments, null, 2) }],
            };
        }
        case 'list_statefulsets': {
            if (!isNamespaceAllowed(args.namespace)) {
                throw new Error(`Access to namespace '${args.namespace}' is not allowed.`);
            }
            const statefulsets = await k8sAppsApi.listNamespacedStatefulSet(args.namespace);
            const simplifiedStatefulsets = statefulsets.body.items.map(s => ({
                name: s.metadata?.name,
                replicas: s.status?.replicas,
                readyReplicas: s.status?.readyReplicas,
            }));
            return {
                content: [{ type: 'text', text: JSON.stringify(simplifiedStatefulsets, null, 2) }],
            };
        }
        case 'list_daemonsets': {
            if (!isNamespaceAllowed(args.namespace)) {
                throw new Error(`Access to namespace '${args.namespace}' is not allowed.`);
            }
            const daemonsets = await k8sAppsApi.listNamespacedDaemonSet(args.namespace);
            const simplifiedDaemonsets = daemonsets.body.items.map(d => ({
                name: d.metadata?.name,
                desiredNumberScheduled: d.status?.desiredNumberScheduled,
                numberReady: d.status?.numberReady,
            }));
            return {
                content: [{ type: 'text', text: JSON.stringify(simplifiedDaemonsets, null, 2) }],
            };
        }
        case 'list_pods': {
            if (!isNamespaceAllowed(args.namespace)) {
                throw new Error(`Access to namespace '${args.namespace}' is not allowed.`);
            }
            const pods = await k8sCoreApi.listNamespacedPod(args.namespace);
            const simplifiedPods = pods.body.items.map(p => ({
                name: p.metadata?.name,
                phase: p.status?.phase,
                nodeName: p.spec?.nodeName,
                restarts: p.status?.containerStatuses?.reduce((acc, c) => acc + c.restartCount, 0) || 0,
            }));
            return {
                content: [{ type: 'text', text: JSON.stringify(simplifiedPods, null, 2) }],
            };
        }
        case 'list_jobs': {
            if (!isNamespaceAllowed(args.namespace)) {
                throw new Error(`Access to namespace '${args.namespace}' is not allowed.`);
            }
            const jobs = await k8sBatchApi.listNamespacedJob(args.namespace);
            const simplifiedJobs = jobs.body.items.map(j => ({
                name: j.metadata?.name,
                succeeded: j.status?.succeeded,
                failed: j.status?.failed,
                active: j.status?.active,
            }));
            return {
                content: [{ type: 'text', text: JSON.stringify(simplifiedJobs, null, 2) }],
            };
        }
        case 'list_cronjobs': {
            if (!isNamespaceAllowed(args.namespace)) {
                throw new Error(`Access to namespace '${args.namespace}' is not allowed.`);
            }
            const cronjobs = await k8sBatchApi.listNamespacedCronJob(args.namespace);
            const simplifiedCronjobs = cronjobs.body.items.map(c => ({
                name: c.metadata?.name,
                schedule: c.spec?.schedule,
                lastScheduleTime: c.status?.lastScheduleTime,
            }));
            return {
                content: [{ type: 'text', text: JSON.stringify(simplifiedCronjobs, null, 2) }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
