import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

interface TokenCache {
  token: string;
  expiresAt: number;
}

/**
 * OCI distribution token auth (Docker Hub, GHCR, etc.)
 */
export function attachRegistryTokenAuth(
  client: AxiosInstance,
  registryUrl: string,
  username?: string,
  password?: string
): void {
  let cached: TokenCache | null = null;

  const getBasicAuth = () =>
    username && password
      ? `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
      : undefined;

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as InternalAxiosRequestConfig & { _retried?: boolean };
      if (!config || error.response?.status !== 401 || config._retried) {
        throw error;
      }

      const wwwAuth = error.response.headers['www-authenticate'] as string | undefined;
      if (!wwwAuth?.includes('Bearer')) {
        throw error;
      }

      const realmMatch = wwwAuth.match(/realm="([^"]+)"/);
      const serviceMatch = wwwAuth.match(/service="([^"]+)"/);
      const scopeMatch = wwwAuth.match(/scope="([^"]+)"/);

      const realm = realmMatch?.[1];
      if (!realm) throw error;

      const tokenParams = new URLSearchParams();
      if (serviceMatch?.[1]) tokenParams.set('service', serviceMatch[1]);
      if (scopeMatch?.[1]) tokenParams.set('scope', scopeMatch[1]);

      if (cached && cached.expiresAt > Date.now()) {
        config.headers.Authorization = `Bearer ${cached.token}`;
      } else {
        const tokenResp = await axios.get(`${realm}?${tokenParams.toString()}`, {
          headers: getBasicAuth() ? { Authorization: getBasicAuth()! } : {},
        });
        const token = tokenResp.data.token || tokenResp.data.access_token;
        if (!token) throw error;
        cached = { token, expiresAt: Date.now() + 55 * 60 * 1000 };
        config.headers.Authorization = `Bearer ${token}`;
      }

      config._retried = true;
      return client.request(config);
    }
  );

  if (getBasicAuth()) {
    client.defaults.headers.common.Authorization = getBasicAuth();
  }
}

export function repositoryFullName(namespace: string, repository: string): string {
  return namespace ? `${namespace}/${repository}` : repository;
}

export function matchesNamespace(repo: string, namespace?: string): boolean {
  if (!namespace) return true;
  return repo === namespace || repo.startsWith(`${namespace}/`);
}
