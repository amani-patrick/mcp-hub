import { Finding } from "../models/finding";
import { parseIamPolicy } from "../parsers/iam";

export function analyzeIamPolicies(filePath: string): Finding[] {
    const policy = parseIamPolicy(filePath);
    if (!policy || !policy.Statement) {
        return [];
    }

    const findings: Finding[] = [];

    for (const statement of policy.Statement) {
        const actions = Array.isArray(statement.Action) ? statement.Action : [statement.Action];
        const resources = Array.isArray(statement.Resource) ? statement.Resource : [statement.Resource];

        if (actions.includes("*") && resources.includes("*")) {
            findings.push({
                id: "IAM-001",
                severity: "HIGH",
                category: "IAM",
                resource: filePath,
                issue: "Overly permissive IAM policy",
                evidence: {
                    action: statement.Action,
                    resource: statement.Resource
                },
                impact: "This policy allows full account takeover if compromised.",
                recommendation: "Restrict actions and scope resources to least privilege."
            });
        }
    }

    return findings;
}
