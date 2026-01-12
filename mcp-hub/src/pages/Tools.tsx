import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MCPCard from "@/components/MCPCard";
import { FileText, Shield, Zap, Code, AlertTriangle, TrendingUp, Ship, Container, Cloud } from "lucide-react";

const mcpTools = [
  {
    id: "kubernetes-mcp",
    title: "Kubernetes MCP",
    description:
      "A production-grade interface for safe, bounded Kubernetes operations. Enables LLMs to inspect clusters, manage workloads, and perform guarded deployments without unrestricted admin access.",
    icon: <Ship className="w-6 h-6" />,
    badge: "🛡️ Production Ready",
    features: [
      "Namespace-scoped access control",
      "Guarded resource deletion",
      "Deployment scaling & rollouts",
      "Pod inspection & logs",
      "Manifest application with policy checks",
    ],
  },
  {
    id: "registry-mcp",
    title: "Registry MCP",
    description:
      "Secure governance for container registries. Allows agents to inspect images, verify policy compliance, and manage tags across Docker Hub and V2-compliant registries with strict safety guardrails.",
    icon: <Container className="w-6 h-6" />,
    badge: "🔒 Secure",
    features: [
      "Image policy verification",
      "Cross-registry tag inspection",
      "Manifest analysis",
      "Safe tag deletion with allowlists",
      "Vulnerability scanning integration",
    ],
  },
  {
    id: "cloud-containers-mcp",
    title: "Cloud Containers MCP",
    description:
      "Abstracted management for serverless container platforms like AWS ECS. Provides a unified interface for deploying, scaling, and observing containerized services with built-in operational limits.",
    icon: <Cloud className="w-6 h-6" />,
    badge: "☁️ Cloud Native",
    features: [
      "Multi-region environment discovery",
      "Safe service scaling with limits",
      "Real-time CloudWatch log streaming",
      "Zero-downtime restarts",
      "Guarded service deletion",
    ],
  },
];

const Tools = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors mb-4 inline-block">
              ← Back to Home
            </Link>
            <span className="badge-glow mb-4 block mt-4">Available Tools</span>
            <h1 className="text-3xl md:text-5xl font-mono font-bold mb-4">
              <span className="glow-text">MCP Tools</span>
              <span className="text-foreground"> Collection</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Explore our collection of open-source Model Context Protocol tools designed to enhance your AI agent capabilities.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {mcpTools.map((tool, index) => (
              <MCPCard
                key={tool.title}
                id={tool.id}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                features={tool.features}
                badge={tool.badge}
                delay={index * 0.15}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tools;
