import { motion } from "framer-motion";
import { useState } from "react";

const tabs = [
  { id: "doc-qa", label: "Document Q&A" },
  { id: "api-validator", label: "API Validator" },
];

const docContent = {
  "doc-qa": {
    title: "Local Document Q&A MCP",
    subtitle: "Intelligent document search and question answering without external APIs",
    installation: `# Install the MCP server
npm install @mcp/local-doc-qa

# Or using pip
pip install mcp-local-doc-qa`,
    usage: `// Initialize the MCP server
const docQA = new LocalDocQA({
  embeddingModel: "sentence-transformers/all-MiniLM-L6-v2",
  vectorStore: "./vectors",
});

// Index your documents
await docQA.indexDocuments("./docs");

// Query with natural language
const result = await docQA.ask(
  "What are the main features?"
);

// Result includes answer + citations
console.log(result.answer);
console.log(result.citations);`,
    workflow: [
      { step: "1", title: "Upload", desc: "Add PDFs or Markdown files to the system" },
      { step: "2", title: "Embed", desc: "Local embeddings generated with sentence-transformers" },
      { step: "3", title: "Search", desc: "Vector similarity search finds relevant passages" },
      { step: "4", title: "Answer", desc: "Get answers with exact source citations" },
    ],
  },
  "api-validator": {
    title: "API Contract Validator MCP",
    subtitle: "Catch API breaking changes before they break your app",
    installation: `# Install the MCP server
npm install @mcp/api-validator

# Or using pip
pip install mcp-api-validator`,
    usage: `// Initialize with your OpenAPI spec
const validator = new APIValidator({
  specPath: "./openapi.yaml",
});

// Validate an actual API response
const result = await validator.validate({
  endpoint: "/api/users",
  method: "GET",
  response: actualResponse,
});

// Check for issues
if (result.hasBreakingChanges) {
  console.error(result.mismatches);
  console.error(result.missingFields);
}`,
    workflow: [
      { step: "1", title: "Load Spec", desc: "Parse your OpenAPI specification file" },
      { step: "2", title: "Capture", desc: "Record actual API responses during runtime" },
      { step: "3", title: "Compare", desc: "Detect schema mismatches and missing fields" },
      { step: "4", title: "Report", desc: "Get detailed reports of breaking changes" },
    ],
  },
};

const DocumentationSection = () => {
  const [activeTab, setActiveTab] = useState("doc-qa");
  const content = docContent[activeTab as keyof typeof docContent];

  return (
    <section id="docs" className="py-24 md:py-32 relative">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="badge-glow mb-4 inline-block">Getting Started</span>
          <h2 className="text-3xl md:text-5xl font-mono font-bold mb-4">
            <span className="text-foreground">Quick </span>
            <span className="glow-text">Documentation</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Get up and running with our MCP tools in minutes.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1 rounded-lg bg-secondary/50 border border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-md font-mono text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-card p-8 md:p-10">
            <h3 className="text-2xl font-mono font-bold text-foreground mb-2">{content.title}</h3>
            <p className="text-muted-foreground mb-8">{content.subtitle}</p>

            {/* Installation */}
            <div className="mb-8">
              <h4 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">
                Installation
              </h4>
              <div className="code-block">
                <pre className="text-sm text-foreground/90">{content.installation}</pre>
              </div>
            </div>

            {/* Usage Example */}
            <div className="mb-8">
              <h4 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">
                Usage Example
              </h4>
              <div className="code-block">
                <pre className="text-sm text-foreground/90">{content.usage}</pre>
              </div>
            </div>

            {/* Workflow */}
            <div>
              <h4 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-6">
                How It Works
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {content.workflow.map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="text-center p-4 rounded-lg bg-secondary/30 border border-border/50"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-mono font-bold flex items-center justify-center mx-auto mb-3">
                      {item.step}
                    </div>
                    <h5 className="font-mono font-semibold text-foreground mb-1">{item.title}</h5>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DocumentationSection;
