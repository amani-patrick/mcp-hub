export function isHttpTransport(): boolean {
  return process.env.MCP_TRANSPORT === 'http';
}

export function isStrictAuth(): boolean {
  return process.env.MCP_AUTH_STRICT === 'true';
}

export function shouldBypassStdioAuth(authEnabled: boolean): boolean {
  return authEnabled && !isHttpTransport() && !isStrictAuth();
}
