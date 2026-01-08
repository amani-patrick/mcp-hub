import { motion } from "framer-motion";
import MCPCard from "./MCPCard";
import { Github } from "lucide-react";

const mcpTools = [
  {
    id: "doc-qa",
    title: "Local Document Q&A",
    description:
      "Ask natural language questions over local documents with cited answers. Designed for private, offline workflows.",
    icon: null,
    features: [
      "PDF & Markdown ingestion",
      "Local embedding + vector search",
      "Answer + source snippets",
    ],
  },
  {
    id: "api-contract-validator",
    title: "API Contract Validator",
    description:
      "Enterprise-grade API validation with enhanced security scanning, performance analysis, and breaking change detection.",
    icon: null,
    features: [
      "OpenAPI spec validation",
      "Enhanced security scanning",
      "Performance analysis",
      "Breaking change detection",
      "Client impact analysis",
      "Migration suggestions",
      "Visual diff comparisons",
    ],
  },
];

const ToolsSection = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              MCP tools in this hub
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Each tool ships with a consistent interface, clear configuration
              and documentation tailored for AI agent integration.
            </p>
          </div>
          <a
            href="https://github.com/amani-patrick/mcp-hub"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Github className="w-4 h-4" />
            View on GitHub
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {mcpTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <MCPCard
                id={tool.id}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                features={tool.features}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
