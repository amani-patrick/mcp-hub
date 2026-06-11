import { useParams, Navigate, Link } from "react-router-dom";
import { mcpTools, getMaturityLabel } from "@/data/tools";
import { Badge } from "@/components/ui/badge";
import { Terminal, Check, Copy, Github, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const maturityStyles = {
  stable: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  beta: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  "docs-wip": "bg-muted text-muted-foreground border-border",
};

const ToolDetail = () => {
  const { toolId } = useParams();
  const tool = mcpTools.find((t) => t.id === toolId);
  const [copied, setCopied] = useState(false);

  if (!tool) {
    return <Navigate to="/" replace />;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const githubUrl = `https://github.com/amani-patrick/mcp-hub/tree/main/${tool.githubPath}`;

  return (
    <motion.div
      className="space-y-10 max-w-3xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <tool.icon className="w-8 h-8" />
          </div>
          <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
            {tool.badge}
          </Badge>
          <Badge variant="outline" className={cn("text-sm font-medium px-3 py-1", maturityStyles[tool.maturity])}>
            {getMaturityLabel(tool.maturity)}
          </Badge>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{tool.title}</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">{tool.description}</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" asChild>
            <a href={githubUrl} target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4 mr-2" />
              View source
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/docs/getting-started">
              <ExternalLink className="w-4 h-4 mr-2" />
              Setup guide
            </Link>
          </Button>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Key Features</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {tool.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Install from source:</strong> Packages are not published to npm yet.
        Clone the repo, run <code className="text-foreground bg-muted px-1 rounded">npm run build -w {tool.repoPath === "API_ContractValidator" ? "mcp-api-contract-validator" : tool.repoPath}</code>,
        then use the local <code className="text-foreground bg-muted px-1 rounded">node</code> path below.
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Installation</h2>
        <div className="relative group rounded-lg border bg-muted/50 p-4 font-mono text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-foreground break-all">{tool.installation}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => copyToClipboard(tool.installation)}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Configuration</h2>
        <p className="text-muted-foreground">
          Add this to your MCP client config. Replace <code>/path/to/mcp-hub</code> with your clone path.
        </p>
        <div className="relative group rounded-lg border bg-muted/50 p-4 font-mono text-sm overflow-x-auto">
          <pre className="text-foreground">{tool.configuration.trim()}</pre>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background"
            onClick={() => copyToClipboard(tool.configuration.trim())}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Example Usage</h2>
        <div className="flex items-start gap-4 p-4 rounded-lg border bg-primary/5">
          <Terminal className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">Prompt your AI client:</p>
            <p className="text-muted-foreground italic">&ldquo;{tool.usage}&rdquo;</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default ToolDetail;
