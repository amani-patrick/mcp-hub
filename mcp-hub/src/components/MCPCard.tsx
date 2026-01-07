import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface MCPCardProps {
  id: string;
  title: string;
  description: string;
  icon?: ReactNode;
  features: string[];
  badge?: string;
  delay?: number;
}

const MCPCard = ({
  id,
  title,
  description,
  icon,
  features,
  badge,
  delay = 0,
}: MCPCardProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="glass-card p-5 md:p-6 group h-full"
    >
      <header className="flex items-start justify-between mb-4 gap-3">
        {icon && (
          <div className="inline-flex items-center justify-center rounded-md bg-secondary/60 text-primary p-2.5">
            {icon}
          </div>
        )}
        {badge && <span className="badge-glow">{badge}</span>}
      </header>

      <h3 className="text-lg md:text-xl font-mono font-semibold text-foreground mb-2">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
        {description}
      </p>

      <section className="space-y-3">
        <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-[0.18em]">
          Features
        </p>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: delay + 0.08 * index }}
              className="flex items-start gap-2 text-sm text-foreground/80"
            >
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
              <span>{feature}</span>
            </motion.li>
          ))}
        </ul>
      </section>

      <motion.div
        className="mt-6 pt-5 border-t border-border/60"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: delay + 0.25 }}
      >
        <Link
          to={`/documentation?tool=${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-primary hover:text-primary/80 transition-colors"
        >
          View documentation
          <svg
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </motion.div>
    </motion.article>
  );
};

export default MCPCard;
