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

        const byIp = new Map<string, number[]>();
        for (const event of failedLogins) {
            const ip = event.metadata!.ip as string;
            const ts = new Date(event.timestamp).getTime();
            if (!byIp.has(ip)) byIp.set(ip, []);
            byIp.get(ip)!.push(ts);
        }

        const windowMs = 60_000;
        for (const timestamps of byIp.values()) {
            timestamps.sort((a, b) => a - b);
            for (let i = 0; i < timestamps.length; i++) {
                const countInWindow = timestamps.filter(t => t - timestamps[i] <= windowMs).length;
                if (countInWindow > 3) return true;
            }
        }
        return false;
    }
};
