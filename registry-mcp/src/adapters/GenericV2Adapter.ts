import axios, { AxiosInstance } from 'axios';
import { RegistryAdapter, RegistryRepository, RepositoryTag, TagMetadata } from './RegistryAdapter.js';
import { attachRegistryTokenAuth, matchesNamespace, repositoryFullName } from './tokenAuth.js';

export class GenericV2Adapter implements RegistryAdapter {
    private client: AxiosInstance;
    private registryUrl: string;
    private username?: string;
    private password?: string;

    constructor(registryUrl: string, username?: string, password?: string) {
        this.registryUrl = registryUrl.replace(/\/$/, '');
        this.username = username;
        this.password = password;
        this.client = axios.create({
            baseURL: registryUrl,
            headers: {
                Accept: 'application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.manifest.v1+json',
            },
        });

        attachRegistryTokenAuth(this.client, registryUrl, username, password);
    }

    async listRepositories(namespace?: string): Promise<RegistryRepository[]> {
        const response = await this.client.get('/v2/_catalog');
        const repos: string[] = response.data.repositories || [];

        return repos
            .filter(repo => matchesNamespace(repo, namespace))
            .map(repo => {
                const parts = repo.split('/');
                return {
                    name: parts.pop() || repo,
                    namespace: parts.join('/'),
                    visibility: 'public',
                };
            });
    }

    async getRepositoryInfo(namespace: string, repository: string): Promise<RegistryRepository> {
        await this.listTags(namespace, repository);
        return {
            name: repository,
            namespace,
            visibility: 'public',
        };
    }

    async listTags(namespace: string, repository: string): Promise<RepositoryTag[]> {
        const fullName = repositoryFullName(namespace, repository);
        const response = await this.client.get(`/v2/${fullName}/tags/list`);
        const tags: string[] = response.data.tags || [];

        return tags.map(tag => ({ name: tag, digest: '' }));
    }

    async getManifest(namespace: string, repository: string, reference: string): Promise<any> {
        const fullName = repositoryFullName(namespace, repository);
        const response = await this.client.get(`/v2/${fullName}/manifests/${reference}`);
        return response.data;
    }

    async getTagMetadata(namespace: string, repository: string, tag: string): Promise<TagMetadata> {
        const fullName = repositoryFullName(namespace, repository);
        const manifestResp = await this.client.get(`/v2/${fullName}/manifests/${tag}`, {
            headers: {
                Accept: 'application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.manifest.v1+json',
            },
        });

        const manifest = manifestResp.data;
        const digest = manifestResp.headers['docker-content-digest'] as string | undefined;
        let architecture: string | undefined;
        let os: string | undefined;
        let size = (manifest.layers || []).reduce((sum: number, layer: { size?: number }) => sum + (layer.size || 0), 0);

        if (manifest.config?.digest) {
            const configResp = await this.client.get(`/v2/${fullName}/blobs/${manifest.config.digest}`);
            architecture = configResp.data.architecture;
            os = configResp.data.os;
            if (configResp.data.size) {
                size += configResp.data.size;
            }
        }

        return {
            tag,
            digest: digest || '',
            size,
            architecture,
            os,
            schemaVersion: manifest.schemaVersion,
            layerCount: manifest.layers?.length ?? 0,
            mediaType: manifest.mediaType,
        };
    }

    async deleteTag(namespace: string, repository: string, tag: string): Promise<void> {
        const fullName = repositoryFullName(namespace, repository);
        const manifestResponse = await this.client.get(`/v2/${fullName}/manifests/${tag}`, {
            headers: { Accept: 'application/vnd.docker.distribution.manifest.v2+json' },
        });
        const digest = manifestResponse.headers['docker-content-digest'];

        if (!digest) {
            throw new Error(`Could not resolve digest for tag ${tag}`);
        }

        await this.client.delete(`/v2/${fullName}/manifests/${digest}`);
    }
}
