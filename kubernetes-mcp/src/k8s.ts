import * as k8s from '@kubernetes/client-node';

// Initialize Kubernetes client
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

export const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
export const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
export const k8sBatchApi = kc.makeApiClient(k8s.BatchV1Api);
export const k8sNetworkingApi = kc.makeApiClient(k8s.NetworkingV1Api);

// Helper to check connection
export async function checkK8sConnection(): Promise<boolean> {
    try {
        await k8sCoreApi.listNode();
        return true;
    } catch (error) {
        console.error('Failed to connect to Kubernetes cluster:', error);
        return false;
    }
}
