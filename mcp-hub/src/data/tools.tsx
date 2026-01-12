import { Ship, Container, Cloud, Shield, Activity, AlertTriangle, Clock, FileText, LucideIcon } from "lucide-react";

export interface MCPTool {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge: string;
  features: string[];
  installation: string;
  configuration: string;
  usage: string;
}

export const mcpTools: MCPTool[] = [
  {
    id: "kubernetes-mcp",
    title: "Kubernetes MCP",
    description:
      "A production-grade interface for safe, bounded Kubernetes operations. Enables LLMs to inspect clusters, manage workloads, and perform guarded deployments without unrestricted admin access.",
    icon: Ship,
    badge: "🛡️ Production Ready",
    features: [
      "Namespace-scoped access control",
      "Guarded resource deletion",
      "Deployment scaling & rollouts",
      "Pod inspection & logs",
      "Manifest application with policy checks",
    ],
    installation: "npx @modelcontextprotocol/server-kubernetes",
    configuration: `
{
  "mcpServers": {
    "kubernetes": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-kubernetes"],
      "env": {
        "KUBECONFIG": "/path/to/kubeconfig"
      }
    }
  }
}
    `,
    usage: "Ask Claude to 'list pods in default namespace' or 'scale deployment my-app to 3 replicas'.",
  },
  {
    id: "registry-mcp",
    title: "Registry MCP",
    description:
      "Secure governance for container registries. Allows agents to inspect images, verify policy compliance, and manage tags across Docker Hub and V2-compliant registries with strict safety guardrails.",
    icon: Container,
    badge: "🔒 Secure",
    features: [
      "Image policy verification",
      "Cross-registry tag inspection",
      "Manifest analysis",
      "Safe tag deletion with allowlists",
      "Vulnerability scanning integration",
    ],
    installation: "npx @modelcontextprotocol/server-registry",
    configuration: `
{
  "mcpServers": {
    "registry": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-registry"],
      "env": {
        "REGISTRY_URL": "https://index.docker.io",
        "REGISTRY_USERNAME": "your-username",
        "REGISTRY_PASSWORD": "your-password"
      }
    }
  }
}
    `,
    usage: "Ask Claude to 'check if image alpine:latest is compliant' or 'list tags for nginx'.",
  },
  {
    id: "cloud-containers-mcp",
    title: "Cloud Containers MCP",
    description:
      "Abstracted management for serverless container platforms like AWS ECS. Provides a unified interface for deploying, scaling, and observing containerized services with built-in operational limits.",
    icon: Cloud,
    badge: "☁️ Cloud Native",
    features: [
      "Multi-region environment discovery",
      "Safe service scaling with limits",
      "Real-time CloudWatch log streaming",
      "Zero-downtime restarts",
      "Guarded service deletion",
    ],
    installation: "npx @modelcontextprotocol/server-cloud-containers",
    configuration: `
{
  "mcpServers": {
    "cloud-containers": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-cloud-containers"],
      "env": {
        "AWS_REGION": "us-east-1",
        "AWS_PROFILE": "default"
      }
    }
  }
}
    `,
    usage: "Ask Claude to 'scale service my-api to 5 instances' or 'show me the logs for the payment-service'.",
  },
  {
    id: "docker-mcp",
    title: "Docker MCP",
    description:
      "Safe, local Docker management for AI agents. Build images, run containers, and inspect resources with strict path allowlists and run profiles.",
    icon: Container,
    badge: "🐳 Local Docker",
    features: [
      "Safe image building from allowlisted paths",
      "Template-based container execution",
      "Resource usage monitoring (CPU/Memory)",
      "Container lifecycle management (Start/Stop/Restart)",
      "Explicit confirmation for destructive actions",
    ],
    installation: "npx @modelcontextprotocol/server-docker",
    configuration: `
{
  "mcpServers": {
    "docker": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-docker"],
      "env": {
        "ALLOWED_BUILD_PATHS": "/path/to/projects"
      }
    }
  }
}
    `,
    usage: "Ask Claude to 'list running containers' or 'build image from ./my-app'.",
  },
  {
    id: "api-contract-validator",
    title: "API Contract Validator",
    description:
      "Enterprise-grade API validation tool. Detects breaking changes in OpenAPI specs and validates API responses against JSON schemas with enhanced security scanning.",
    icon: Shield,
    badge: "✅ Quality",
    features: [
      "OpenAPI breaking change detection",
      "JSON schema response validation",
      "Enhanced security scanning",
      "Rate limiting & Authentication middleware",
      "Detailed validation reports",
    ],
    installation: "npx @modelcontextprotocol/server-api-contract-validator",
    configuration: `
{
  "mcpServers": {
    "api-validator": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-api-contract-validator"]
    }
  }
}
    `,
    usage: "Ask Claude to 'validate this response against schema' or 'check for breaking changes between spec v1 and v2'.",
  },
  {
    id: "api-performance-monitor",
    title: "API Performance Monitor",
    description:
      "Real-time API performance monitoring with SLA tracking. Includes a live dashboard, WebSocket streaming, and integrations for Datadog, Prometheus, and Slack.",
    icon: Activity,
    badge: "📈 Observability",
    features: [
      "Real-time metric recording",
      "SLA compliance checking & alerting",
      "Live WebSocket dashboard",
      "Historical analytics",
      "External integrations (Datadog, Slack, Prometheus)",
    ],
    installation: "npx @modelcontextprotocol/server-api-performance-monitor",
    configuration: `
{
  "mcpServers": {
    "performance-monitor": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-api-performance-monitor"],
      "env": {
        "SLACK_WEBHOOK": "https://hooks.slack.com/..."
      }
    }
  }
}
    `,
    usage: "Ask Claude to 'check SLA for /api/v1/users' or 'start the performance dashboard'.",
  },
  {
    id: "cloud-risk-scanner",
    title: "Cloud Risk Scanner",
    description:
      "Static analysis tool for cloud infrastructure. Scans Terraform, Kubernetes YAML, and IAM policies to identify security misconfigurations and calculate risk scores.",
    icon: AlertTriangle,
    badge: "⚠️ Security",
    features: [
      "Multi-format scanning (TF, YAML, JSON)",
      "IAM policy analysis",
      "Kubernetes security checks",
      "Network configuration analysis",
      "Risk score calculation",
    ],
    installation: "npx @modelcontextprotocol/server-cloud-risk-scanner",
    configuration: `
{
  "mcpServers": {
    "risk-scanner": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-cloud-risk-scanner"]
    }
  }
}
    `,
    usage: "Ask Claude to 'scan ./infrastructure for risks' or 'analyze this IAM policy'.",
  },
  {
    id: "incident-timeline-mcp",
    title: "Incident Timeline MCP",
    description:
      "Forensic analysis tool for incident response. Ingests raw logs, correlates events using graph algorithms, and builds a structured timeline of what happened.",
    icon: Clock,
    badge: "🔍 Forensics",
    features: [
      "Log stream processing",
      "Graph-based event correlation",
      "Automated timeline construction",
      "Rule-based anomaly detection",
      "Incident summary generation",
    ],
    installation: "npx @modelcontextprotocol/server-incident-timeline",
    configuration: `
{
  "mcpServers": {
    "incident-timeline": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-incident-timeline"]
    }
  }
}
    `,
    usage: "Ask Claude to 'build a timeline from ./app.log' or 'summarize the incident'.",
  },
];
