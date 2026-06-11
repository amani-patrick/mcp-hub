export interface RegistryRepository {
    name: string;
    namespace?: string;
    visibility?: 'public' | 'private';
}

export interface RepositoryTag {
    name: string;
    digest: string;
    size?: number;
    createdAt?: string;
}

export interface TagMetadata {
    tag: string;
    digest: string;
    size: number;
    architecture?: string;
    os?: string;
    schemaVersion?: number;
    layerCount?: number;
    mediaType?: string;
}

export interface RegistryAdapter {
    /**
     * List repositories in the registry.
     */
    listRepositories(namespace?: string): Promise<RegistryRepository[]>;

    /**
     * Get metadata for a specific repository.
     */
    getRepositoryInfo(namespace: string, repository: string): Promise<RegistryRepository>;

    /**
     * List tags for a repository.
     */
    listTags(namespace: string, repository: string): Promise<RepositoryTag[]>;

    /**
     * Get manifest for a specific tag or digest.
     */
    getManifest(namespace: string, repository: string, reference: string): Promise<any>;

    /**
     * Resolve tag metadata including digest, size, and platform from config blob.
     */
    getTagMetadata(namespace: string, repository: string, tag: string): Promise<TagMetadata>;

    /**
     * Delete a tag (if allowed).
     */
    deleteTag(namespace: string, repository: string, tag: string): Promise<void>;
}
