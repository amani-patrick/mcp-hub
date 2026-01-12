export interface CloudEnvironment {
    id: string;
    name: string;
    region: string;
    type: 'ecs' | 'cloudrun' | 'aca';
}

export interface CloudService {
    name: string;
    environment: string;
    status: string;
    image: string;
    cpu?: string;
    memory?: string;
    desiredCount?: number;
    runningCount?: number;
}

export interface CloudPlatformAdapter {
    /**
     * List environments (clusters, regions).
     */
    listEnvironments(): Promise<CloudEnvironment[]>;

    /**
     * List services in an environment.
     */
    listServices(environmentId: string): Promise<CloudService[]>;

    /**
     * Get details for a specific service.
     */
    getServiceDetails(environmentId: string, serviceName: string): Promise<CloudService>;

    /**
     * Scale a service.
     */
    scaleService(environmentId: string, serviceName: string, count: number): Promise<void>;

    /**
     * Restart a service.
     */
    restartService(environmentId: string, serviceName: string): Promise<void>;

    /**
     * Get logs for a service.
     */
    getServiceLogs(environmentId: string, serviceName: string, tail?: number): Promise<string[]>;
}
