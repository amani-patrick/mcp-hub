import { mcpTools } from "@/data/tools";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const Overview = () => {
    return (
        <div className="space-y-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-4xl font-bold tracking-tight mb-4">Overview</h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                    A focused collection of production-ready Model Context Protocol (MCP) servers designed for modern engineering teams.
                </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="text-3xl font-bold mb-2">{mcpTools.length}</div>
                    <div className="text-sm text-muted-foreground font-medium">Production Tools</div>
                </div>
                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="text-3xl font-bold mb-2">100%</div>
                    <div className="text-sm text-muted-foreground font-medium">Open Source</div>
                </div>
                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="text-3xl font-bold mb-2">0</div>
                    <div className="text-sm text-muted-foreground font-medium">External APIs</div>
                </div>
            </div>

            <section className="space-y-6">
                <h2 className="text-2xl font-semibold tracking-tight">Available Tools</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {mcpTools.map((tool) => (
                        <Link
                            key={tool.id}
                            to={`/tools/${tool.id}`}
                            className="group block p-6 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <tool.icon className="w-6 h-6" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                                {tool.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {tool.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-semibold tracking-tight">Why these tools?</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {[
                        "Built for safety with strict operational bounds",
                        "No external API dependencies or hidden costs",
                        "Production-ready with comprehensive logging",
                        "Standardized configuration and behavior",
                    ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-sm font-medium">{feature}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Overview;
