import { Finding } from "../models/finding";
import { parseTerraform } from "../parsers/terraform";

export function analyzeNetwork(filePath: string): Finding[] {
    const resources = parseTerraform(filePath);
    const findings: Finding[] = [];

    for (const resource of resources) {
        if (resource.type === "aws_security_group") {
            // Check ingress rules
            if (resource.properties.ingress) {
                const ingressBlocks = Array.isArray(resource.properties.ingress)
                    ? resource.properties.ingress
                    : [resource.properties.ingress];

                for (const block of ingressBlocks) {
                    // Check for 0.0.0.0/0 in cidr_blocks
                    const cidrBlocks = block.cidr_blocks || [];
                    const isPublic = Array.isArray(cidrBlocks) && cidrBlocks.includes("0.0.0.0/0");

                    // Check ports (handle both number and string)
                    const fromPort = Number(block.from_port);
                    const isRiskyPort = fromPort === 22 || fromPort === 3389;

                    if (isPublic && isRiskyPort) {
                        findings.push({
                            id: "NET-001",
                            severity: "CRITICAL",
                            category: "NETWORK",
                            resource: `${filePath} (${resource.name})`,
                            issue: "SSH/RDP open to the world",
                            evidence: { block },
                            impact: "Attackers can brute force access to the instance.",
                            recommendation: "Restrict ingress to specific IP ranges."
                        });
                    }
                }
            }
        }
    }

    return findings;
}
