import { walkFiles } from "../utils/FileWalker";
import { analyzeIamPolicies } from "./analyzeIam";
import { analyzeNetwork } from "./analyzeNetwork";
import { analyzeK8s } from "./analyzeK8s";
import { Finding } from "../models/finding";
import { calculateRiskScore } from "../utils/risk";
import * as fs from "fs";

function looksLikeIamPolicy(filePath: string): boolean {
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(content);
        return Boolean(parsed?.Statement || parsed?.statement);
    } catch {
        return false;
    }
}

export async function scanConfigPath(path: string): Promise<Finding[]> {
    const files = walkFiles(path);
    let findings: Finding[] = [];

    for (const file of files) {
        if (file.endsWith(".json") && looksLikeIamPolicy(file)) {
            findings.push(...analyzeIamPolicies(file));
        }

        if (file.endsWith(".yaml") || file.endsWith(".yml")) {
            findings.push(...analyzeK8s(file));
        }

        if (file.endsWith(".tf")) {
            findings.push(...analyzeNetwork(file));
        }
    }

    findings = findings.map(f => ({
        ...f,
        riskScore: calculateRiskScore(f)
    }));

    return findings;
}
