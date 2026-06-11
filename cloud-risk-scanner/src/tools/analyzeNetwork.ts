import { Finding } from "../models/finding";
import { parseTerraform } from "../parsers/terraform";

function normalizeCidrBlocks(block: unknown): string[] {
    if (!block) return [];
    if (Array.isArray(block)) return block.map(String);
    return [String(block)];
}

export function analyzeNetwork(filePath: string): Finding[] {
    const resources = parseTerraform(filePath);
    const findings: Finding[] = [];

    for (const resource of resources) {
        if (resource.type === "aws_security_group") {
            if (resource.properties.ingress) {
                const ingressBlocks = Array.isArray(resource.properties.ingress)
                    ? resource.properties.ingress
                    : [resource.properties.ingress];

                for (const block of ingressBlocks) {
                    const cidrBlocks = [
                        ...normalizeCidrBlocks(block.cidr_blocks),
                        ...normalizeCidrBlocks(block.ipv6_cidr_blocks),
                    ];
                    const isPublic = cidrBlocks.some(c => c === "0.0.0.0/0" || c === "::/0");

                    const fromPort = Number(block.from_port);
                    const toPort = Number(block.to_port ?? block.from_port);
                    const isRiskyPort =
                        fromPort === 22 || fromPort === 3389 ||
                        toPort === 22 || toPort === 3389 ||
                        (fromPort === 0 && toPort === 0);

                    if (isPublic && isRiskyPort) {
                        findings.push({
                            id: "NET-001",
                            severity: "CRITICAL",
                            category: "NETWORK",
                            resource: `${filePath} (${resource.name})`,
                            issue: "SSH/RDP or all ports open to the world",
                            evidence: { block },
                            impact: "Attackers can brute force or scan exposed services.",
                            recommendation: "Restrict ingress to specific IP ranges."
                        });
                    }
                }
            }
        }
    }

    return findings;
}
