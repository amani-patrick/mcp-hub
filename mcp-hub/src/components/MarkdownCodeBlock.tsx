import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MarkdownCodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

const MarkdownCodeBlock = ({ code, language, className }: MarkdownCodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("group relative my-6 rounded-xl border border-border/80 overflow-hidden", className)}>
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border/60 bg-muted/40">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          {language || "code"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs opacity-70 group-hover:opacity-100"
          onClick={copy}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 m-0 bg-[hsl(222_47%_6%)] text-sm leading-relaxed">
        <code className="font-mono text-foreground/90 whitespace-pre">{code}</code>
      </pre>
    </div>
  );
};

export default MarkdownCodeBlock;
