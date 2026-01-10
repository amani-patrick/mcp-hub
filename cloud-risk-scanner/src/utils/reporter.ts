import { Finding } from "../models/finding";
import markdownTable from "markdown-table";

export function generateReport(findings: Finding[], format: "json" | "md" = "md"): string {
    if (format === "json") {
        return JSON.stringify(findings, null, 2);
    }

    const headers = ["ID", "Severity", "Risk Score", "Category", "Resource", "Issue"];
    const rows = findings.map(f => [
        f.id,
        f.severity,
        (f.riskScore || 0).toString(),
        f.category,
        f.resource,
        f.issue
    ]);

    const table = markdownTable([headers, ...rows]);

    const summary = `
# Cloud Risk Scan Report

**Total Findings:** ${findings.length}
**Critical:** ${findings.filter(f => f.severity === "CRITICAL").length}
**High:** ${findings.filter(f => f.severity === "HIGH").length}
**Medium:** ${findings.filter(f => f.severity === "MEDIUM").length}
**Low:** ${findings.filter(f => f.severity === "LOW").length}

## Findings Details

${table}
    `;

    return summary.trim();
}
