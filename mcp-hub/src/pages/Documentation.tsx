import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

const Documentation = () => {
  const [searchParams] = useSearchParams();
  const initialTool = searchParams.get("tool") || "doc-qa";
  const [expandedTools, setExpandedTools] = useState<string[]>([initialTool]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors mb-4 inline-block">
              ← Back to Home
            </Link>
            <span className="badge-glow mb-4 block mt-4">Getting Started</span>
            <h1 className="text-3xl md:text-5xl font-mono font-bold mb-4">
              <span className="text-foreground">Full </span>
              <span className="glow-text">Documentation</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Complete guides for all MCP tools. Click on a tool to expand its documentation.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <Accordion
              type="multiple"
              value={expandedTools}
              onValueChange={setExpandedTools}
              className="space-y-4"
            >
              {Object.entries(docContent).map(([key, content], index) => (
                <AccordionItem
                  key={key}
                  value={key}
                  className="glass-card border-none"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-mono font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-mono font-semibold text-foreground">
                          {content.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{content.subtitle}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="pt-4 space-y-8">
                      {/* Installation */}
                      <div>
                        <h4 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">
                          Installation
                        </h4>
                        <div className="code-block">
                          <pre className="text-sm text-foreground/90">{content.installation}</pre>
                        </div>
                      </div>

                      {/* Usage Example */}
                      <div>
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
                          {content.workflow.map((item, idx) => (
                            <motion.div
                              key={item.step}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: idx * 0.1 }}
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
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Documentation;
