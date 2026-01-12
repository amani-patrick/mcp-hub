import { LogEvent } from "../models/event";
import { Rule } from "../core/types";

export class RuleEngine {
    private rules: Rule[] = [];

    registerRule(rule: Rule) {
        this.rules.push(rule);
    }

    evaluate(events: LogEvent[]): string[] {
        const findings: string[] = [];
        for (const rule of this.rules) {
            if (rule.evaluate(events)) {
                findings.push(`Rule Triggered: ${rule.name} - ${rule.description}`);
            }
        }
        return findings;
    }
}

// Example Rules
export const BruteForceRule: Rule = {
    id: "R-001",
    name: "Potential Brute Force",
    description: "More than 3 failed logins from the same IP within 1 minute",
    evaluate: (events: LogEvent[]) => {
        const failedLogins = events.filter(e =>
            e.message.toLowerCase().includes("failed login") && e.metadata?.ip
        );

        const ipCounts: Record<string, number> = {};
        for (const event of failedLogins) {
            const ip = event.metadata!.ip;
            ipCounts[ip] = (ipCounts[ip] || 0) + 1;
        }

        return Object.values(ipCounts).some(count => count > 3);
    }
};
