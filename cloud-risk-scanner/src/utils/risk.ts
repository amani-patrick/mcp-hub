import { Finding, Severity } from "../models/finding";

export function calculateRiskScore(finding: Finding): number {
    let baseScore = 0;

    switch (finding.severity) {
        case "CRITICAL":
            baseScore = 90;
            break;
        case "HIGH":
            baseScore = 70;
            break;
        case "MEDIUM":
            baseScore = 40;
            break;
        case "LOW":
            baseScore = 10;
            break;
    }

    // Blast Radius / Impact Adjustments
    let multiplier = 1.0;

    // IAM: Admin access is high risk
    if (finding.category === "IAM") {
        if (finding.evidence?.action === "*" && finding.evidence?.resource === "*") {
            multiplier += 0.2; // +20% for full admin
        }
    }

    // Network: Public exposure
    if (finding.category === "NETWORK") {
        if (JSON.stringify(finding.evidence).includes("0.0.0.0/0")) {
            multiplier += 0.3; // +30% for public exposure
        }
    }

    // K8s: Privileged containers
    if (finding.category === "K8S") {
        if (finding.issue.includes("Privileged container")) {
            multiplier += 0.2;
        }
    }

    let finalScore = baseScore * multiplier;
    return Math.min(Math.round(finalScore), 100); // Cap at 100
}
