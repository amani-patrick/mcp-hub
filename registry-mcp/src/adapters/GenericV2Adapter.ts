import axios, { AxiosInstance } from 'axios';
import { RegistryAdapter, RegistryRepository, RepositoryTag } from './RegistryAdapter.js';

export class GenericV2Adapter implements RegistryAdapter {
    private client: AxiosInstance;
    private registryUrl: string;

    constructor(registryUrl: string, username?: string, password?: string) {
        this.registryUrl = registryUrl;
        this.client = axios.create({
            baseURL: registryUrl,
            headers: {
                'Accept': 'application/vnd.docker.distribution.manifest.v2+json',
            },
        });

        if (username && password) {
            // Basic auth for simplicity, though real registries often use token auth
            this.client.defaults.headers.common['Authorization'] = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
        }
    }

    async listRepositories(namespace?: string): Promise<RegistryRepository[]> {
        try {
            const response = await this.client.get('/v2/_catalog');
            const repos: string[] = response.data.repositories || [];

            return repos
                .filter(repo => !namespace || repo.startsWith(namespace))
                .map(repo => {
                    const parts = repo.split('/');
                    return {
                        name: parts.pop() || repo,
                        namespace: parts.join('/'),
                        visibility: 'public', // Default assumption
                    };
                });
        } catch (error) {
            console.error('Error listing repositories:', error);

            throw error;
        }
    }

    async getRepositoryInfo(namespace: string, repository: string): Promise<RegistryRepository> {
        // V2 API doesn't have a specific endpoint for repo metadata, so we infer existence by listing tags
        const fullName = namespace ? `${namespace}/${repository}` : repository;
        await this.listTags(namespace, repository);
        return {
            name: repository,
            namespace,
            visibility: 'public',
        };
    }

    async listTags(namespace: string, repository: string): Promise<RepositoryTag[]> {
        const fullName = namespace ? `${namespace}/${repository}` : repository;
        const response = await this.client.get(`/v2/${fullName}/tags/list`);
        const tags: string[] = response.data.tags || [];

        // To get details, we'd need to fetch manifest for each tag, which is expensive.
        // We'll return basic info for now.
        return tags.map(tag => ({
            name: tag,
            digest: '', // Would require manifest fetch
        }));
    }

    async getManifest(namespace: string, repository: string, reference: string): Promise<any> {
        const fullName = namespace ? `${namespace}/${repository}` : repository;
        const response = await this.client.get(`/v2/${fullName}/manifests/${reference}`);
        return response.data;
    }

    async deleteTag(namespace: string, repository: string, tag: string): Promise<void> {
        const fullName = namespace ? `${namespace}/${repository}` : repository;
        // 1. Get digest
        const manifestResponse = await this.client.get(`/v2/${fullName}/manifests/${tag}`, {
            headers: { 'Accept': 'application/vnd.docker.distribution.manifest.v2+json' }
        });
        const digest = manifestResponse.headers['docker-content-digest'];

        if (!digest) {
            throw new Error(`Could not resolve digest for tag ${tag}`);
        }

        // 2. Delete by digest
        await this.client.delete(`/v2/${fullName}/manifests/${digest}`);
    }
}
