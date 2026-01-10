import { Finding } from "../models/finding";
import { parseK8sManifest } from "../parsers/k8s";

export function analyzeK8s(filePath: string): Finding[] {
    const documents = parseK8sManifest(filePath);
    const findings: Finding[] = [];

    for (const doc of documents) {
        // Check for privileged containers
        if (doc.kind === "Pod" || doc.kind === "Deployment" || doc.kind === "DaemonSet" || doc.kind === "StatefulSet") {
            const containers = doc.spec?.template?.spec?.containers || doc.spec?.containers || [];

            for (const container of containers) {
                if (container.securityContext?.privileged) {
                    findings.push({
                        id: "K8S-001",
                        severity: "HIGH",
                        category: "K8S",
                        resource: `${filePath} (${doc.metadata?.name || 'unknown'})`,
                        issue: "Privileged container detected",
                        evidence: { container: container.name },
                        impact: "Privileged containers can access the host system.",
                        recommendation: "Remove 'privileged: true' from securityContext."
                    });
                }
            }
        }
    }

    return findings;
}
