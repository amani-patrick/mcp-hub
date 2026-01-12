import { useParams, Navigate } from "react-router-dom";
import { mcpTools } from "@/data/tools";
import { Badge } from "@/components/ui/badge";
import { Terminal, Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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

    return (
        <motion.div
            className="space-y-10 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <tool.icon className="w-8 h-8" />
                    </div>
                    <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                        {tool.badge}
                    </Badge>
                </div>
                <h1 className="text-4xl font-bold tracking-tight">{tool.title}</h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    {tool.description}
                </p>
            </div>

            {/* Features */}
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

            {/* Installation */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight">Installation</h2>
                <div className="relative group rounded-lg border bg-muted/50 p-4 font-mono text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-foreground">{tool.installation}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyToClipboard(tool.installation)}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </section>

            {/* Configuration */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight">Configuration</h2>
                <p className="text-muted-foreground">
                    Add this to your MCP client configuration file (e.g., <code>claude_desktop_config.json</code>):
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

            {/* Usage */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight">Example Usage</h2>
                <div className="flex items-start gap-4 p-4 rounded-lg border bg-primary/5">
                    <Terminal className="w-6 h-6 text-primary mt-1" />
                    <div className="space-y-1">
                        <p className="font-medium">Prompt Claude:</p>
                        <p className="text-muted-foreground italic">"{tool.usage}"</p>
                    </div>
                </div>
            </section>
        </motion.div>
    );
};

export default ToolDetail;
