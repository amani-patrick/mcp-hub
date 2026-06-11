import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownPageProps {
  content: string;
  className?: string;
}

const MarkdownPage = ({ content, className }: MarkdownPageProps) => {
  return (
    <article className={cn("prose prose-neutral dark:prose-invert max-w-none", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
};

export default MarkdownPage;
