import { Ship, Container, Cloud, Shield, Activity, AlertTriangle, Clock, GitBranch, LucideIcon } from "lucide-react";

export type ToolMaturity = "stable" | "beta" | "docs-wip";

export interface MCPTool {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge: string;
  maturity: ToolMaturity;
  repoPath: string;
  entryPoint: string;
  env?: Record<string, string>;
  features: string[];
  installation: string;
  configuration: string;
  usage: string;
  githubPath: string;
}

export type McpServerConfigInput = Pick<MCPTool, "id" | "repoPath" | "entryPoint" | "env">;

const REPO_PLACEHOLDER = "/path/to/mcp-hub";

export function getServerPath(tool: Pick<MCPTool, "repoPath" | "entryPoint">): string {
  return `${REPO_PLACEHOLDER}/${tool.repoPath}/${tool.entryPoint}`;
}

export function buildMcpConfig(tool: McpServerConfigInput, serverKey?: string): string {
  const key = serverKey ?? tool.id.replace(/-mcp$/, "").replace(/-/g, "_");
  const config: Record<string, unknown> = {
    command: "node",
    args: [getServerPath(tool)],
  };
  if (tool.env && Object.keys(tool.env).length > 0) {
    config.env = tool.env;
  }
  return JSON.stringify({ mcpServers: { [key]: config } }, null, 2);
}

const maturityLabels: Record<ToolMaturity, string> = {
  stable: "Stable",
  beta: "Beta",
  "docs-wip": "Docs WIP",
};

export function getMaturityLabel(maturity: ToolMaturity): string {
  return maturityLabels[maturity];
}

export const mcpTools: MCPTool[] = [
  {
    id: "kubernetes-mcp",
    title: "Kubernetes MCP",
    description:
      "A production-grade interface for safe, bounded Kubernetes operations. Enables LLMs to inspect clusters, manage workloads, and perform guarded deployments without unrestricted admin access.",
    icon: Ship,
    badge: "Production Ready",
    maturity: "beta",
    repoPath: "kubernetes-mcp",
    entryPoint: "build/index.js",
    env: { KUBECONFIG: "/path/to/kubeconfig" },
    features: [
      "Namespace-scoped access control",
      "Guarded resource deletion",
      "Deployment scaling & rollouts",
      "Pod inspection & logs",
      "Manifest application with policy checks",
    ],
    installation: `git clone + npm run build -w kubernetes-mcp`,
    configuration: buildMcpConfig(
      {
        id: "kubernetes-mcp",
        repoPath: "kubernetes-mcp",
        entryPoint: "build/index.js",
        env: { KUBECONFIG: "/path/to/kubeconfig" },
      },
      "kubernetes"
    ),
    usage: "Ask Claude to 'list pods in default namespace' or 'scale deployment my-app to 3 replicas'.",
    githubPath: "kubernetes-mcp",
  },
  {
    id: "registry-mcp",
    title: "Registry MCP",
    description:
      "Secure governance for container registries. Allows agents to inspect images, verify policy compliance, and manage tags across Docker Hub and V2-compliant registries with strict safety guardrails.",
    icon: Container,
    badge: "Secure",
    maturity: "beta",
    repoPath: "registry-mcp",
    entryPoint: "build/index.js",
    env: {
      REGISTRY_URL: "https://index.docker.io",
      REGISTRY_USERNAME: "your-username",
      REGISTRY_PASSWORD: "your-password",
    },
    features: [
      "Image policy verification",
      "Cross-registry tag inspection",
      "Manifest analysis",
      "Safe tag deletion with allowlists",
      "Vulnerability scanning integration",
    ],
    installation: `git clone + npm run build -w registry-mcp`,
    configuration: buildMcpConfig(
      {
        id: "registry-mcp",
        repoPath: "registry-mcp",
        entryPoint: "build/index.js",
        env: {
          REGISTRY_URL: "https://index.docker.io",
          REGISTRY_USERNAME: "your-username",
          REGISTRY_PASSWORD: "your-password",
        },
      },
      "registry"
    ),
    usage: "Ask Claude to 'check if image alpine:latest is compliant' or 'list tags for nginx'.",
    githubPath: "registry-mcp",
  },
  {
    id: "cloud-containers-mcp",
    title: "Cloud Containers MCP",
    description:
      "Abstracted management for serverless container platforms like AWS ECS. Provides a unified interface for deploying, scaling, and observing containerized services with built-in operational limits.",
    icon: Cloud,
    badge: "Cloud Native",
    maturity: "beta",
    repoPath: "cloud-containers-mcp",
    entryPoint: "build/index.js",
    env: { AWS_REGION: "us-east-1", AWS_PROFILE: "default" },
    features: [
      "Multi-region environment discovery",
      "Safe service scaling with limits",
      "Real-time CloudWatch log streaming",
      "Zero-downtime restarts",
      "Guarded service deletion",
    ],
    installation: `git clone + npm run build -w cloud-containers-mcp`,
    configuration: buildMcpConfig(
      {
        id: "cloud-containers-mcp",
        repoPath: "cloud-containers-mcp",
        entryPoint: "build/index.js",
        env: { AWS_REGION: "us-east-1", AWS_PROFILE: "default" },
      },
      "cloud-containers"
    ),
    usage: "Ask Claude to 'scale service my-api to 5 instances' or 'show me the logs for the payment-service'.",
    githubPath: "cloud-containers-mcp",
  },
  {
    id: "docker-mcp",
    title: "Docker MCP",
    description:
      "Safe, local Docker management for AI agents. Build images, run containers, and inspect resources with strict path allowlists and run profiles.",
    icon: Container,
    badge: "Local Docker",
    maturity: "beta",
    repoPath: "docker-mcp",
    entryPoint: "build/index.js",
    env: { ALLOWED_BUILD_PATHS: "/path/to/your/projects" },
    features: [
      "Safe image building from allowlisted paths",
      "Template-based container execution",
      "Resource usage monitoring (CPU/Memory)",
      "Container lifecycle management (Start/Stop/Restart)",
      "Explicit confirmation for destructive actions",
    ],
    installation: `git clone + npm run build -w docker-mcp`,
    configuration: buildMcpConfig(
      {
        id: "docker-mcp",
        repoPath: "docker-mcp",
        entryPoint: "build/index.js",
        env: { ALLOWED_BUILD_PATHS: "/path/to/your/projects" },
      },
      "docker"
    ),
    usage: "Ask Claude to 'list running containers' or 'build image from ./my-app'.",
    githubPath: "docker-mcp",
  },
  {
    id: "git-mcp",
    title: "Git MCP",
    description:
      "Safe Git operations for AI agents. Inspect history and diffs read-only, stage and commit with guardrails, and perform destructive actions only with explicit confirmation and repo path allowlists.",
    icon: GitBranch,
    badge: "Version Control",
    maturity: "beta",
    repoPath: "git-mcp",
    entryPoint: "build/index.js",
    env: { ALLOWED_REPO_PATHS: "/path/to/your/projects,/path/to/mcp-hub" },
    features: [
      "Read-only status, log, diff, and blame-style history",
      "Guarded checkout, stash, add, commit, fetch, and pull",
      "Destructive reset, push, branch delete, and clean with confirm gates",
      "Protected branch enforcement (main, master, develop)",
      "Repository path sandboxing via ALLOWED_REPO_PATHS",
    ],
    installation: `git clone + npm run build -w git-mcp`,
    configuration: buildMcpConfig(
      {
        id: "git-mcp",
        repoPath: "git-mcp",
        entryPoint: "build/index.js",
        env: { ALLOWED_REPO_PATHS: "/path/to/your/projects,/path/to/mcp-hub" },
      },
      "git"
    ),
    usage: "Ask Claude to 'show git status for this repo' or 'list commits touching src/server.ts'.",
    githubPath: "git-mcp",
  },
  {
    id: "api-contract-validator",
    title: "API Contract Validator",
    description:
      "Enterprise-grade API validation tool. Detects breaking changes in OpenAPI specs and validates API responses against JSON schemas with enhanced security scanning.",
    icon: Shield,
    badge: "Quality",
    maturity: "stable",
    repoPath: "API_ContractValidator",
    entryPoint: "dist/index.js",
    features: [
      "OpenAPI breaking change detection",
      "JSON schema response validation",
      "Enhanced security scanning",
      "Rate limiting & Authentication middleware",
      "Detailed validation reports",
    ],
    installation: `git clone + npm run build -w mcp-api-contract-validator`,
    configuration: buildMcpConfig(
      {
        id: "api-contract-validator",
        repoPath: "API_ContractValidator",
        entryPoint: "dist/index.js",
      },
      "api-validator"
    ),
    usage: "Ask Claude to 'validate this response against schema' or 'check for breaking changes between spec v1 and v2'.",
    githubPath: "API_ContractValidator",
  },
  {
    id: "api-performance-monitor",
    title: "API Performance Monitor",
    description:
      "Real-time API performance monitoring with SLA tracking. Includes a live dashboard, WebSocket streaming, and integrations for Datadog, Prometheus, and Slack.",
    icon: Activity,
    badge: "Observability",
    maturity: "stable",
    repoPath: "api-performance-monitor",
    entryPoint: "dist/index.js",
    env: { SLACK_WEBHOOK: "https://hooks.slack.com/..." },
    features: [
      "Real-time metric recording",
      "SLA compliance checking & alerting",
      "Live WebSocket dashboard",
      "Historical analytics",
      "External integrations (Datadog, Slack, Prometheus)",
    ],
    installation: `git clone + npm run build -w api-performance-monitor`,
    configuration: buildMcpConfig(
      {
        id: "api-performance-monitor",
        repoPath: "api-performance-monitor",
        entryPoint: "dist/index.js",
        env: { SLACK_WEBHOOK: "https://hooks.slack.com/..." },
      },
      "performance-monitor"
    ),
    usage: "Ask Claude to 'check SLA for /api/v1/users' or 'start the performance dashboard'.",
    githubPath: "api-performance-monitor",
  },
  {
    id: "cloud-risk-scanner",
    title: "Cloud Risk Scanner",
    description:
      "Static analysis tool for cloud infrastructure. Scans Terraform, Kubernetes YAML, and IAM policies to identify security misconfigurations and calculate risk scores.",
    icon: AlertTriangle,
    badge: "Security",
    maturity: "stable",
    repoPath: "cloud-risk-scanner",
    entryPoint: "dist/src/server.js",
    features: [
      "Multi-format scanning (TF, YAML, JSON)",
      "IAM policy analysis",
      "Kubernetes security checks",
      "Network configuration analysis",
      "Risk score calculation",
    ],
    installation: `git clone + npm run build -w cloud-risk-scanner`,
    configuration: buildMcpConfig(
      {
        id: "cloud-risk-scanner",
        repoPath: "cloud-risk-scanner",
        entryPoint: "dist/src/server.js",
      },
      "risk-scanner"
    ),
    usage: "Ask Claude to 'scan ./infrastructure for risks' or 'analyze this IAM policy'.",
    githubPath: "cloud-risk-scanner",
  },
  {
    id: "incident-timeline-mcp",
    title: "Incident Timeline MCP",
    description:
      "Forensic analysis tool for incident response. Ingests raw logs, correlates events using graph algorithms, and builds a structured timeline of what happened.",
    icon: Clock,
    badge: "Forensics",
    maturity: "stable",
    repoPath: "incident-timeline-mcp",
    entryPoint: "dist/server.js",
    features: [
      "Log stream processing",
      "Graph-based event correlation",
      "Automated timeline construction",
      "Rule-based anomaly detection",
      "Incident summary generation",
    ],
    installation: `git clone + npm run build -w incident-timeline-mcp`,
    configuration: buildMcpConfig(
      {
        id: "incident-timeline-mcp",
        repoPath: "incident-timeline-mcp",
        entryPoint: "dist/server.js",
      },
      "incident-timeline"
    ),
    usage: "Ask Claude to 'build a timeline from ./app.log' or 'summarize the incident'.",
    githubPath: "incident-timeline-mcp",
  },
];
