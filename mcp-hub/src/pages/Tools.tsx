import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MCPCard from "@/components/MCPCard";
import { FileText, Shield, Zap, Code, AlertTriangle, TrendingUp } from "lucide-react";

const mcpTools = [
  {
    id: "doc-qa",
    title: "Local Document Q&A MCP",
    description:
      "A powerful document question-answering system that runs entirely locally. No paid APIs required — just upload your documents and get intelligent answers with citations.",
    icon: <FileText className="w-6 h-6" />,
    badge: "🥈 Second Best",
    features: [
      "Upload PDFs & Markdown files",
      "Local embeddings with sentence-transformers",
      "Vector search for semantic matching",
      "Answers with source citations",
      "Zero external API dependencies",
    ],
  },
  {
    id: "api-contract-validator",
    title: "API Contract Validator MCP",
    description:
      "Enterprise-grade API validation with enhanced security scanning, performance analysis, and breaking change detection. Ensures your frontend and backend APIs stay in sync.",
    icon: <Shield className="w-6 h-6" />,
    badge: "🏆 Featured",
    features: [
      "OpenAPI spec validation",
      "Enhanced security scanning",
      "Performance analysis",
      "Custom validation rules",
      "Breaking change detection",
      "Client impact analysis",
      "Migration suggestions",
      "Visual diff comparisons",
      "CI/CD integration ready",
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
