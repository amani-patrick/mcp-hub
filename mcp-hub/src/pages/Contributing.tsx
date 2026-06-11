import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, Heart, BookOpen, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";

const Contributing = () => {
  return (
    <motion.div
      className="space-y-8 max-w-3xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Contributing</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          MCP Hub is a community project. We welcome bug fixes, documentation, tests, and new tools.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Quick start for contributors</h2>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>Fork the repo and clone your fork</li>
          <li>Run <code className="text-foreground bg-muted px-1 rounded">npm install && npm run build</code> at the repo root</li>
          <li>Pick a task from Good First Issues or open an issue to discuss your idea</li>
          <li>Create a branch, make changes, run <code className="text-foreground bg-muted px-1 rounded">npm run verify</code></li>
          <li>Open a pull request using the PR template</li>
        </ol>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <a
          href="https://github.com/amani-patrick/mcp-hub/blob/main/CONTRIBUTING.md"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 p-4 rounded-lg border hover:border-primary/50 transition-colors"
        >
          <BookOpen className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium">Full contributing guide</p>
            <p className="text-sm text-muted-foreground">Code style, commits, PR process</p>
          </div>
        </a>
        <a
          href="https://github.com/amani-patrick/mcp-hub/blob/main/GOOD_FIRST_ISSUES.md"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 p-4 rounded-lg border hover:border-primary/50 transition-colors"
        >
          <ListChecks className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium">Good first issues</p>
            <p className="text-sm text-muted-foreground">Starter tasks for newcomers</p>
          </div>
        </a>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Code of conduct</h2>
        <p className="text-muted-foreground">
          Be respectful and constructive. See{" "}
          <a
            href="https://github.com/amani-patrick/mcp-hub/blob/main/CODE_OF_CONDUCT.md"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            CODE_OF_CONDUCT.md
          </a>
          .
        </p>
      </section>

      <div className="flex flex-wrap gap-3 pt-4">
        <Button asChild>
          <a href="https://github.com/amani-patrick/mcp-hub/fork" target="_blank" rel="noopener noreferrer">
            <Github className="w-4 h-4 mr-2" />
            Fork on GitHub
          </a>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/docs/getting-started">Getting Started</Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <Heart className="w-4 h-4 text-red-500" />
        Thank you for helping the community build safer MCP tools.
      </p>
    </motion.div>
  );
};

export default Contributing;
