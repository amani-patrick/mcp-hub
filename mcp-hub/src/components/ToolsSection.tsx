import { motion } from "framer-motion";
import MCPCard from "./MCPCard";

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
    id: "api-validator",
    title: "API Contract Validator",
    description:
      "Continuously compare real responses with OpenAPI specs to detect breaking changes early.",
    icon: null,
    features: [
      "Schema mismatch detection",
      "Missing and extra field checks",
      "CI/CD-friendly JSON output",
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
