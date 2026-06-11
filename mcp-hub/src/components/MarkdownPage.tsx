import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveDocLink } from "@/lib/docLinks";
import MarkdownCodeBlock from "@/components/MarkdownCodeBlock";

interface MarkdownPageProps {
  content: string;
  className?: string;
}

function extractTitle(markdown: string): { title?: string; body: string } {
  const match = markdown.match(/^#\s+(.+?)\s*$/m);
  if (!match) {
    return { body: markdown };
  }
  const title = match[1].trim();
  const body = markdown.replace(/^#\s+.+?\s*\n+/, "");
  return { title, body };
}

const MarkdownPage = ({ content, className }: MarkdownPageProps) => {
  const { title, body } = extractTitle(content);

  const components: Components = {
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-6 scroll-mt-24">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold tracking-tight text-foreground mt-12 mb-4 pb-2 border-b border-border scroll-mt-24">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold text-foreground mt-8 mb-3 scroll-mt-24">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 mb-4 space-y-2 text-muted-foreground marker:text-primary/70">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 mb-4 space-y-2 text-muted-foreground marker:text-primary/70">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    a: ({ href, children }) => {
      const resolved = resolveDocLink(href);
      const className =
        "text-primary font-medium underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors inline-flex items-center gap-1";

      if (resolved.external) {
        return (
          <a href={resolved.href} className={className} target="_blank" rel="noopener noreferrer">
            {children}
            <ExternalLink className="w-3.5 h-3.5 inline shrink-0 opacity-70" />
          </a>
        );
      }

      if (resolved.href.startsWith("/")) {
        return (
          <Link to={resolved.href} className={className}>
            {children}
          </Link>
        );
      }

      return (
        <a href={resolved.href} className={className}>
          {children}
        </a>
      );
    },
    blockquote: ({ children }) => (
      <blockquote className="my-6 rounded-r-lg border-l-4 border-primary/60 bg-primary/5 px-4 py-3 text-muted-foreground [&>p]:mb-0">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-10 border-border" />,
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-muted/50 border-b border-border">{children}</thead>,
    tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
    tr: ({ children }) => <tr className="hover:bg-muted/20 transition-colors">{children}</tr>,
    th: ({ children }) => (
      <th className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-muted-foreground align-top">{children}</td>
    ),
    code: ({ className, children }) => {
      const text = String(children).replace(/\n$/, "");
      const match = /language-(\w+)/.exec(className || "");
      const isBlock = Boolean(match) || text.includes("\n");

      if (isBlock) {
        return <MarkdownCodeBlock code={text} language={match?.[1]} />;
      }

      return (
        <code className="rounded-md bg-muted px-1.5 py-0.5 text-sm font-mono text-primary before:content-none after:content-none">
          {children}
        </code>
      );
    },
    pre: ({ children }) => <>{children}</>,
  };

  return (
    <motion.article
      className={cn("max-w-3xl", className)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {title && (
        <header className="mb-10 pb-8 border-b border-border">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">{title}</h1>
        </header>
      )}
      <div className="doc-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {body}
        </ReactMarkdown>
      </div>
    </motion.article>
  );
};

export default MarkdownPage;
