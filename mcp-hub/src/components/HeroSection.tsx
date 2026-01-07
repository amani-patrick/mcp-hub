import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <motion.div
          className="grid gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Left: copy */}
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Model Context Protocol · Tools Hub
            </p>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
              A focused MCP toolkit
              <br />
              for modern engineering teams
            </h1>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-8 max-w-xl">
              Curated, production-ready MCP tools with clean interfaces and predictable behavior.
              Built to integrate into real-world AI workflows without extra infrastructure.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/tools"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                View available tools
              </Link>
              <Link
                to="/documentation"
                className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:border-foreground/40 transition-colors"
              >
                Read documentation
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md text-xs md:text-sm">
              <div>
                <p className="font-mono text-foreground">2</p>
                <p className="text-muted-foreground">Tools included</p>
              </div>
              <div>
                <p className="font-mono text-foreground">100%</p>
                <p className="text-muted-foreground">Open source</p>
              </div>
              <div>
                <p className="font-mono text-foreground">0</p>
                <p className="text-muted-foreground">External APIs</p>
              </div>
            </div>
          </div>

          {/* Right: simple “skills / stack” style block */}
          <motion.div
            className="rounded-lg border border-border bg-muted/40 p-5 md:p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-xs font-mono text-muted-foreground mb-3">
              Frontend implementation
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Framework</span>
                <span className="font-mono">React · Vite · TS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">UI layer</span>
                <span className="font-mono">Tailwind CSS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Animations</span>
                <span className="font-mono">Framer Motion</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Navigation</span>
                <span className="font-mono">React Router</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
