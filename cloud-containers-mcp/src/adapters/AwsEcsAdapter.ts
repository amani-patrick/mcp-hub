import { ECSClient, ListClustersCommand, ListServicesCommand, DescribeServicesCommand, UpdateServiceCommand, DescribeTaskDefinitionCommand, DeleteServiceCommand } from '@aws-sdk/client-ecs';
import { CloudWatchLogsClient, FilterLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';
import { CloudPlatformAdapter, CloudEnvironment, CloudService } from './CloudPlatformAdapter.js';

export class AwsEcsAdapter implements CloudPlatformAdapter {
    private ecsClient: ECSClient;
    private logsClient: CloudWatchLogsClient;
    private region: string;

    constructor(region: string) {
        this.region = region;
        this.ecsClient = new ECSClient({ region });
        this.logsClient = new CloudWatchLogsClient({ region });
    }

    async listEnvironments(): Promise<CloudEnvironment[]> {
        try {
            const command = new ListClustersCommand({});
            const response = await this.ecsClient.send(command);
            const clusterArns = response.clusterArns || [];

            return clusterArns.map(arn => {
                const name = arn.split('/').pop() || arn;
                return {
                    id: arn,
                    name: name,
                    region: this.region,
                    type: 'ecs',
                };
            });
        } catch (error) {
            console.error('Error listing ECS clusters:', error);
            return [];
        }
    }

    async listServices(environmentId: string): Promise<CloudService[]> {
        try {
            const listCmd = new ListServicesCommand({ cluster: environmentId });
            const listResp = await this.ecsClient.send(listCmd);
            const serviceArns = listResp.serviceArns || [];

            if (serviceArns.length === 0) return [];

            const allServices = [];
            for (let i = 0; i < serviceArns.length; i += 10) {
                const batch = serviceArns.slice(i, i + 10);
                const descResp = await this.ecsClient.send(
                    new DescribeServicesCommand({ cluster: environmentId, services: batch })
                );
                allServices.push(...(descResp.services || []));
            }

            return Promise.all(allServices.map(async s => ({
                name: s.serviceName || 'unknown',
                environment: environmentId,
                status: s.status || 'UNKNOWN',
                image: s.taskDefinition
                    ? await this.resolveImage(s.taskDefinition)
                    : 'unknown',
                desiredCount: s.desiredCount,
                runningCount: s.runningCount,
            })));
        } catch (error) {
            console.error(`Error listing services in ${environmentId}:`, error);
            throw error;
        }
    }

    private async resolveImage(taskDefinitionArn: string): Promise<string> {
        const tdResp = await this.ecsClient.send(
            new DescribeTaskDefinitionCommand({ taskDefinition: taskDefinitionArn })
        );
        return tdResp.taskDefinition?.containerDefinitions?.[0]?.image || taskDefinitionArn;
    }

    async getServiceDetails(environmentId: string, serviceName: string): Promise<CloudService> {
        const command = new DescribeServicesCommand({ cluster: environmentId, services: [serviceName] });
        const response = await this.ecsClient.send(command);
        const service = response.services?.[0];

        if (!service) {
            throw new Error(`Service ${serviceName} not found in ${environmentId}`);
        }

        return {
            name: service.serviceName || serviceName,
            environment: environmentId,
            status: service.status || 'UNKNOWN',
            image: service.taskDefinition
                ? await this.resolveImage(service.taskDefinition)
                : 'unknown',
            desiredCount: service.desiredCount,
            runningCount: service.runningCount,
        };
    }

    async scaleService(environmentId: string, serviceName: string, count: number): Promise<void> {
        const command = new UpdateServiceCommand({
            cluster: environmentId,
            service: serviceName,
            desiredCount: count,
        });
        await this.ecsClient.send(command);
    }

    async restartService(environmentId: string, serviceName: string): Promise<void> {
        const command = new UpdateServiceCommand({
            cluster: environmentId,
            service: serviceName,
            forceNewDeployment: true,
        });
        await this.ecsClient.send(command);
    }

    async deleteService(environmentId: string, serviceName: string): Promise<void> {
        await this.ecsClient.send(new DeleteServiceCommand({
            cluster: environmentId,
            service: serviceName,
            force: true,
        }));
    }

    async getServiceLogs(environmentId: string, serviceName: string, tail: number = 100): Promise<string[]> {
        const svcCmd = new DescribeServicesCommand({ cluster: environmentId, services: [serviceName] });
        const svcResp = await this.ecsClient.send(svcCmd);
        const service = svcResp.services?.[0];
        if (!service?.taskDefinition) {
            throw new Error(`Service ${serviceName} not found or has no task definition`);
        }

        const tdCmd = new DescribeTaskDefinitionCommand({ taskDefinition: service.taskDefinition });
        const tdResp = await this.ecsClient.send(tdCmd);
        const containerDef = tdResp.taskDefinition?.containerDefinitions?.[0];
        if (!containerDef) {
            throw new Error('No container definition found');
        }

        const logConf = containerDef.logConfiguration;
        if (logConf?.logDriver !== 'awslogs' || !logConf.options) {
            throw new Error('Service is not configured with awslogs driver');
        }

        const group = logConf.options['awslogs-group'];
        const streamPrefix = logConf.options['awslogs-stream-prefix'];
        if (!group) {
            throw new Error('Missing awslogs-group in task definition');
        }

        const filterResp = await this.logsClient.send(new FilterLogEventsCommand({
            logGroupName: group,
            logStreamNamePrefix: streamPrefix,
            limit: tail,
        }));

        const messages = (filterResp.events || [])
            .map(e => e.message?.trim())
            .filter(Boolean) as string[];

        return messages.length > 0
            ? messages
            : [`No log events found in group ${group} (prefix: ${streamPrefix || 'none'})`];
    }
}
