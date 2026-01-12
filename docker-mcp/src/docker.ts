import Docker from 'dockerode';

// Initialize Docker client
// This assumes the Docker socket is available at the default location
// Windows: //./pipe/docker_engine
// Linux/Mac: /var/run/docker.sock
export const docker = new Docker();

// Helper to check if docker is available
export async function checkDockerAvailability(): Promise<boolean> {
    try {
        await docker.ping();
        return true;
    } catch (error) {
        console.error('Docker is not available:', error);
        return false;
    }
}
