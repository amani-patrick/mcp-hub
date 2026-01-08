#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { glob } from 'glob';
import { detectBreakingChanges, Severity, ChangeType } from '../tools/breaking.js';
import { validateResponse } from '../tools/validate.js';
import { parseSpec } from '../openapi.js';

const program = new Command();

program
  .name('api-contract-validator')
  .description('CLI tool for validating API contracts and detecting breaking changes')
  .version('0.1.0');

// Breaking changes detection command
program
  .command('diff')
  .description('Compare two OpenAPI specs and detect breaking changes')
  .requiredOption('-o, --old <path>', 'Path to old OpenAPI spec')
  .requiredOption('-n, --new <path>', 'Path to new OpenAPI spec')
  .option('-f, --format <format>', 'Output format (json|table)', 'table')
  .option('--severity <severity>', 'Filter by severity (critical|major|minor|info)')
  .option('--type <type>', 'Filter by change type (breaking|non_breaking)')
  .action(async (options) => {
    try {
      const oldSpec = readFileSync(options.old, 'utf8');
      const newSpec = readFileSync(options.new, 'utf8');
      
      const result = detectBreakingChanges(oldSpec, newSpec);
      
      let filteredChanges = result.changes;
      
      if (options.severity) {
        filteredChanges = filteredChanges.filter(c => c.severity === options.severity);
      }
      
      if (options.type) {
        filteredChanges = filteredChanges.filter(c => c.type === options.type);
      }
      
      if (options.format === 'json') {
        console.log(JSON.stringify({
          breaking: result.breaking,
          summary: result.summary,
          changes: filteredChanges
        }, null, 2));
      } else {
        console.log(chalk.bold('\n API Contract Change Analysis\n'));
        
        // Summary table
        console.log(chalk.bold('Summary:'));
        console.log(`  Critical: ${chalk.red(result.summary.critical)}`);
        console.log(`  Major: ${chalk.hex('#FFA500')(result.summary.major)}`);
        console.log(`  Minor: ${chalk.yellow(result.summary.minor)}`);
        console.log(`  Info: ${chalk.blue(result.summary.info)}`);
        console.log(`  Breaking: ${chalk.red(result.summary.breaking)}`);
        console.log(`  Non-breaking: ${chalk.green(result.summary.nonBreaking)}`);
        
        if (filteredChanges.length === 0) {
          console.log(chalk.green('\n[+] No changes found matching your filters.'));
          return;
        }
        
        console.log(chalk.bold('\n Changes:'));
        filteredChanges.forEach(change => {
          const icon = change.type === ChangeType.BREAKING ? '❌' : '✅';
          let severityColor = chalk.white;
          
          switch (change.severity) {
            case Severity.CRITICAL:
              severityColor = chalk.red;
              break;
            case Severity.MAJOR:
              severityColor = chalk.hex('#FFA500');
              break;
            case Severity.MINOR:
              severityColor = chalk.yellow;
              break;
            case Severity.INFO:
              severityColor = chalk.blue;
              break;
          }
          
          console.log(`  ${icon} ${severityColor(change.message)} [${change.severity.toUpperCase()}]`);
          if (change.path) {
            console.log(`     📍 ${change.method?.toUpperCase()} ${change.path}`);
          }
        });
        
        if (result.breaking) {
          console.log(chalk.red('\n⚠️  Breaking changes detected!'));
          process.exit(1);
        } else {
          console.log(chalk.green('\n✅ No breaking changes detected.'));
        }
      }
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Validate response command
program
  .command('validate')
  .description('Validate API response against OpenAPI spec')
  .requiredOption('-s, --spec <path>', 'Path to OpenAPI spec')
  .requiredOption('-r, --response <path>', 'Path to response JSON file')
  .option('-p, --path <path>', 'API path (e.g., /users)')
  .option('-m, --method <method>', 'HTTP method (e.g., GET)')
  .action(async (options) => {
    try {
      const spec = readFileSync(options.spec, 'utf8');
      const response = readFileSync(options.response, 'utf8');
      
      const parsedSpec = parseSpec(spec);
      const responseData = JSON.parse(response);
      
      // This is a simplified validation - you'd want to enhance this
      const result = validateResponse(parsedSpec, responseData);
      
      console.log(chalk.bold('\n🔍 Response Validation\n'));
      
      if (result.valid) {
        console.log(chalk.green('✅ Response is valid against the OpenAPI spec'));
      } else {
        console.log(chalk.red('❌ Response validation failed'));
        if (result.errors) {
          result.errors.forEach((error: any) => {
            console.log(chalk.red(`  • ${error}`));
          });
        }
        process.exit(1);
      }
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Batch processing command
program
  .command('batch')
  .description('Process multiple OpenAPI specs in a directory')
  .requiredOption('-d, --directory <path>', 'Directory containing OpenAPI specs')
  .requiredOption('-b, --baseline <path>', 'Baseline spec to compare against')
  .option('-p, --pattern <pattern>', 'File pattern (default: "**/*.yaml")', '**/*.yaml')
  .option('-f, --format <format>', 'Output format (json|table)', 'table')
  .action(async (options) => {
    try {
      const baselineSpec = readFileSync(options.baseline, 'utf8');
      const files = await glob(options.pattern, { cwd: options.directory });
      
      console.log(chalk.bold(`\n📁 Batch Processing: ${files.length} files\n`));
      
      const results = [];
      
      for (const file of files) {
        const filePath = `${options.directory}/${file}`;
        const newSpec = readFileSync(filePath, 'utf8');
        const result = detectBreakingChanges(baselineSpec, newSpec);
        
        results.push({
          file,
          breaking: result.breaking,
          summary: result.summary
        });
        
        if (options.format === 'table') {
          const status = result.breaking ? chalk.red('❌') : chalk.green('✅');
          console.log(`${status} ${file} - ${result.summary.breaking} breaking, ${result.summary.nonBreaking} non-breaking`);
        }
      }
      
      if (options.format === 'json') {
        console.log(JSON.stringify(results, null, 2));
      }
      
      const hasBreaking = results.some(r => r.breaking);
      if (hasBreaking) {
        console.log(chalk.red('\n⚠️  Some files have breaking changes!'));
        process.exit(1);
      } else {
        console.log(chalk.green('\n✅ All files are compatible with baseline!'));
      }
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program.parse();
