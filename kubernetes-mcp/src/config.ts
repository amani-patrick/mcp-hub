// Configuration for Kubernetes MCP Tool

// Allowed namespaces for the tool to access/modify
// In a real scenario, this might be loaded from env vars or a config file
export const ALLOWED_NAMESPACES = ['default', 'dev', 'staging'];

// Resources that are completely blocked from access
export const BLOCKED_RESOURCES = [
    'Secret',
    'Role',
    'RoleBinding',
    'ClusterRole',
    'ClusterRoleBinding',
    'ServiceAccount'
];

// Resources that require explicit confirmation for destructive actions
export const CONFIRMATION_REQUIRED_RESOURCES = [
    'Pod',
    'Deployment',
    'StatefulSet',
    'Service',
    'Ingress',
    'ConfigMap'
];

// Helper to check if a namespace is allowed
export function isNamespaceAllowed(namespace: string): boolean {
    return ALLOWED_NAMESPACES.includes(namespace);
}

// Helper to check if a resource type is blocked
export function isResourceBlocked(resourceType: string): boolean {
    return BLOCKED_RESOURCES.includes(resourceType);
}
