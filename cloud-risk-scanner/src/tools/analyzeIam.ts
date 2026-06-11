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

        const hasWildcardAction = actions.some(a => a === "*");
        const hasWildcardResource = resources.some(r => r === "*");

        if (hasWildcardAction && hasWildcardResource) {
            findings.push({
                id: "IAM-001",
                severity: "HIGH",
                category: "IAM",
                resource: filePath,
                issue: "Overly permissive IAM policy (Action * and Resource *)",
                evidence: {
                    action: statement.Action,
                    resource: statement.Resource
                },
                impact: "This policy allows full account takeover if compromised.",
                recommendation: "Restrict actions and scope resources to least privilege."
            });
        } else if (hasWildcardAction) {
            findings.push({
                id: "IAM-002",
                severity: "MEDIUM",
                category: "IAM",
                resource: filePath,
                issue: "Wildcard action on scoped resources",
                evidence: { action: statement.Action, resource: statement.Resource },
                impact: "Broad actions may allow privilege escalation within the scoped resources.",
                recommendation: "Replace * actions with specific service actions."
            });
        } else if (hasWildcardResource) {
            findings.push({
                id: "IAM-003",
                severity: "MEDIUM",
                category: "IAM",
                resource: filePath,
                issue: "Wildcard resource with specific actions",
                evidence: { action: statement.Action, resource: statement.Resource },
                impact: "Actions may apply to all resources in the account.",
                recommendation: "Scope resources to specific ARNs."
            });
        }
    }

    return findings;
}
