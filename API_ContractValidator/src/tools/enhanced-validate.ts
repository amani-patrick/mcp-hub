import { z } from "zod";
import { CustomRuleEngine } from "../enhanced/validation/custom-rules.js";
import { SecurityScanner } from "../enhanced/validation/security-scanner.js";
import { PerformanceAnalyzer } from "../enhanced/validation/performance-analyzer.js";
import { VisualDiffGenerator } from "../enhanced/diff/visual-diff.js";
import { detectBreakingChanges } from "./breaking.js";
import { parseSpec } from "../openapi.js";

const EnhancedValidationRequestSchema = z.object({
  spec: z.any(),
  companyStandards: z.object({
    namingConvention: z.enum(['camelCase', 'snake_case', 'kebab-case']),
    requiredFields: z.array(z.string()),
    maxResponseTime: z.number(),
    securityHeaders: z.array(z.string()),
    documentationRequirements: z.object({
      descriptionRequired: z.boolean(),
      examplesRequired: z.boolean(),
      schemaRequired: z.boolean()
    })
  }).optional(),
  teamId: z.string().optional(),
  includeSecurity: z.boolean().default(true),
  includePerformance: z.boolean().default(true)
});

const EnhancedDiffRequestSchema = z.object({
  oldSpec: z.any(),
  newSpec: z.any(),
  includeVisualDiff: z.boolean().default(true),
  includeClientImpact: z.boolean().default(true),
  includeMigrationSuggestions: z.boolean().default(true)
});

const securityScanner = new SecurityScanner();
const performanceAnalyzer = new PerformanceAnalyzer();
const visualDiffGenerator = new VisualDiffGenerator();

function normalizeSpec(spec: unknown): any {
  if (typeof spec === 'string') {
    return parseSpec(spec);
  }
  return spec;
}

function specToString(spec: unknown): string {
  return typeof spec === 'string' ? spec : JSON.stringify(spec);
}

export const enhancedValidateResponse = {
  name: "enhanced_validate_response",
  description: "Enhanced API response validation with custom rules, security scanning, and performance analysis",
  inputSchema: EnhancedValidationRequestSchema,
  handler: async (input: z.infer<typeof EnhancedValidationRequestSchema>) => {
    const { spec, companyStandards, includeSecurity, includePerformance } = input;

    const results: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      enhancedFeatures: [] as string[],
    };

    try {
      const parsedSpec = normalizeSpec(spec);

      if (companyStandards) {
        const ruleEngine = new CustomRuleEngine(companyStandards);
        results.customRules = ruleEngine.validate(parsedSpec);
        (results.enhancedFeatures as string[]).push('custom-rules');
      }

      if (includeSecurity) {
        const vulnerabilities = securityScanner.scan(parsedSpec);
        results.security = {
          vulnerabilities,
          recommendations: [...new Set(vulnerabilities.map(v => v.recommendation))],
        };
        (results.enhancedFeatures as string[]).push('security-scanning');
      }

      if (includePerformance) {
        results.performance = performanceAnalyzer.analyze(parsedSpec);
        (results.enhancedFeatures as string[]).push('performance-analysis');
      }

      const features = results.enhancedFeatures as string[];

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
          {
            type: "text",
            text: `Enhanced validation completed. Features: ${features.join(', ')}`,
          }
        ],
        isError: false,
        data: results
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Enhanced validation failed: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }
};

export const enhancedBreakingChanges = {
  name: "enhanced_breaking_changes",
  description: "Enhanced breaking change detection with visual diffs and client impact analysis",
  inputSchema: EnhancedDiffRequestSchema,
  handler: async (input: z.infer<typeof EnhancedDiffRequestSchema>) => {
    const { oldSpec, newSpec, includeVisualDiff, includeClientImpact, includeMigrationSuggestions } = input;

    try {
      const basicResult = detectBreakingChanges(specToString(oldSpec), specToString(newSpec));
      const oldObj = normalizeSpec(oldSpec);
      const newObj = normalizeSpec(newSpec);
      const diff = visualDiffGenerator.generateSideBySideDiff(oldObj, newObj);

      const results: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        breaking: basicResult.breaking,
        breakingChanges: basicResult.changes,
        summary: basicResult.summary,
        enhancedFeatures: ['basic-diff'],
      };

      if (includeVisualDiff) {
        results.visualDiff = {
          summary: diff.summary,
          changes: diff.changes,
        };
        (results.enhancedFeatures as string[]).push('visual-diff');
      }

      if (includeClientImpact) {
        results.clientImpact = diff.clientImpacts;
        (results.enhancedFeatures as string[]).push('client-impact');
      }

      if (includeMigrationSuggestions) {
        results.migrationSuggestions = diff.migrationSuggestions;
        (results.enhancedFeatures as string[]).push('migration-suggestions');
      }

      const features = results.enhancedFeatures as string[];

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
          {
            type: "text",
            text: `Enhanced breaking change analysis completed. Found ${basicResult.changes.length} changes (${basicResult.summary.breaking} breaking). Features: ${features.join(', ')}`,
          }
        ],
        isError: false,
        data: results
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Enhanced breaking change analysis failed: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }
};
