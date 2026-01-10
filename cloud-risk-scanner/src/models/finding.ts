export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface Finding {
    id: string;
    severity: Severity;
    category: "IAM" | "NETWORK" | "K8S" | "STORAGE";
    resource: string;
    issue: string;
    evidence: Record<string, unknown>;
    impact: string;
    recommendation: string;
    riskScore?: number;
    metadata?: Record<string, any>;
}