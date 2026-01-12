import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-16 border-t border-border/30">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="font-mono font-bold text-lg text-foreground">
                MCP<span className="glow-text">Hub</span>
              </span>
            </Link>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link to="/tools" className="text-muted-foreground hover:text-primary transition-colors">
                Tools
              </Link>
              <Link to="/documentation" className="text-muted-foreground hover:text-primary transition-colors">
                Documentation
              </Link>
              <a
                href="https://github.com/amani-patrick/mcp-hub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-border/30">
            <p className="text-sm text-muted-foreground">
              Built with{" "}
              <span className="text-primary">♥</span> for the AI community
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2 font-mono">
              © {new Date().getFullYear()} MCP Hub. Open Source.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
