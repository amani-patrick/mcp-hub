import { Link, useLocation, Outlet } from "react-router-dom";
import { mcpTools } from "@/data/tools";
import { cn } from "@/lib/utils";
import { Menu, X, Github, Home, Box } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const DocsLayout = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const NavItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active?: boolean }) => (
        <Link
            to={to}
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            <Icon className="w-4 h-4" />
            {label}
        </Link>
    );

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-50">
                <Link to="/" className="font-bold text-lg">MCP Hub</Link>
                <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
            </div>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen md:sticky md:top-0 overflow-y-auto",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-6">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-8">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            <Box className="w-5 h-5" />
                        </div>
                        MCP Hub
                    </Link>

                    <nav className="space-y-6">
                        <div>
                            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Getting Started
                            </p>
                            <div className="space-y-1">
                                <NavItem
                                    to="/"
                                    icon={Home}
                                    label="Overview"
                                    active={location.pathname === "/"}
                                />
                            </div>
                        </div>

                        <div>
                            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Tools
                            </p>
                            <div className="space-y-1">
                                {mcpTools.map((tool) => (
                                    <NavItem
                                        key={tool.id}
                                        to={`/tools/${tool.id}`}
                                        icon={tool.icon}
                                        label={tool.title}
                                        active={location.pathname === `/tools/${tool.id}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t">
                            <a
                                href="https://github.com/amani-patrick/mcp-hub"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Github className="w-4 h-4" />
                                GitHub Repository
                            </a>
                        </div>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <div className="max-w-4xl mx-auto p-6 md:p-10 lg:p-12">
                    <Outlet />
                </div>
            </main>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default DocsLayout;
