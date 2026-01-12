import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Github, Heart, Zap, Users, Code } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors mb-4 inline-block">
              ← Back to Home
            </Link>
            <span className="badge-glow mb-4 block mt-4">About Us</span>
            <h1 className="text-3xl md:text-5xl font-mono font-bold mb-4">
              <span className="text-foreground">About </span>
              <span className="glow-text">MCP Hub</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              An open-source collection of Model Context Protocol tools built for the AI community.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-12">
            {/* Mission Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-card p-8"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-mono font-bold text-foreground mb-2">Our Mission</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    MCP Hub aims to provide developers with powerful, open-source tools that extend the capabilities 
                    of AI agents through the Model Context Protocol. We believe in making AI development accessible, 
                    transparent, and community-driven.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Open Source Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card p-8"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Code className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-mono font-bold text-foreground mb-2">100% Open Source</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    All our MCP tools are completely open source. You can view, fork, modify, and contribute 
                    to any of our projects. We believe in transparency and community collaboration.
                  </p>
                  <a
                    href="https://github.com/amani-patrick/mcp-hub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-mono text-sm transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    View on GitHub
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Community Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-card p-8"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-mono font-bold text-foreground mb-2">Community Driven</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    MCP Hub is built by developers, for developers. We welcome contributions, feature requests, 
                    and bug reports. Join our community to help shape the future of AI agent tools.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { value: "2+", label: "MCP Tools" },
                { value: "100%", label: "Open Source" },
                { value: "0", label: "External APIs Required" },
              ].map((stat, index) => (
                <div key={index} className="glass-card p-6 text-center">
                  <p className="text-2xl md:text-3xl font-mono font-bold glow-text">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Built with love */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center pt-8"
            >
              <p className="text-muted-foreground flex items-center justify-center gap-2">
                Built with <Heart className="w-4 h-4 text-primary fill-primary" /> for the AI community
              </p>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
