import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';
import { loadConfig, fileExists, getChangedFiles, getStagedFiles, type FotsConfig } from '../utils/index.js';

/**
 * Compliance check command for CI/CD integration.
 * 
 * Validates files against FOTS spec rules:
 * - SUMMARY block presence
 * - ASSUMPTIONS block when needed
 * - Change size limits
 * - Security blocks for sensitive files
 * - Test coverage requirements
 * 
 * This is NOT a stub - full implementation with:
 * - Diff-based checking (CI mode)
 * - File-based checking (local mode)
 * - Multiple output formats
 * - GitHub Actions annotations
 */

export interface CheckOptions {
  diff?: string;
  files?: string[];
  rules?: string;
  format?: 'text' | 'json' | 'github' | 'junit';
  failOnViolation?: boolean;
  maxChangeSize?: number;
  output?: string;
  ci?: boolean;
}

interface Violation {
  file: string;
  line?: number;
  rule: string;
  severity: 'error' | 'warning';
  message: string;
  suggestion?: string;
}

interface CheckResult {
  passed: boolean;
  violations: Violation[];
  summary: {
    totalFiles: number;
    checkedFiles: number;
    errors: number;
    warnings: number;
  };
}

const RULES = {
  summary: 'SUMMARY block presence',
  assumptions: 'ASSUMPTIONS block for ambiguous changes',
  security: 'SECURITY NOTE for sensitive files',
  tests: 'Test coverage for new code',
  minimal: 'Minimal change principle',
  secrets: 'No hardcoded secrets',
};

const SENSITIVE_PATTERNS = [
  /auth/i,
  /password/i,
  /credential/i,
  /secret/i,
  /token/i,
  /crypto/i,
  /security/i,
  /oauth/i,
  /login/i,
  /signup/i,
  /session/i,
];

const SECRET_PATTERNS = [
  /password\s*[:=]\s*["'][^"']+["']/i,
  /api[_-]?key\s*[:=]\s*["'][^"']+["']/i,
  /secret\s*[:=]\s*["'][^"']+["']/i,
  /token\s*[:=]\s*["'][^"']{10,}["']/i,
  /private[_-]?key\s*[:=]\s*["'][^"']+["']/i,
  /aws_access_key_id\s*[:=]\s*["'][A-Z0-9]{20}["']/i,
  /aws_secret_access_key\s*[:=]\s*["'][A-Za-z0-9/+=]{40}["']/i,
];

export async function checkCommand(options: CheckOptions): Promise<CheckResult> {
  const spinner = ora('Initializing compliance check...').start();
  
  try {
    const cwd = process.cwd();
    const config = await loadConfig(cwd);
    
    if (!config) {
      spinner.fail(chalk.red('No FOTS configuration found. Run `fots init` first.'));
      process.exit(1);
    }

    // Determine files to check
    let filesToCheck: string[] = [];
    
    if (options.diff) {
      // Check files from git diff
      spinner.text = 'Getting changed files from git...';
      filesToCheck = await getChangedFiles(options.diff);
    } else if (options.files && options.files.length > 0) {
      // Check specific files
      filesToCheck = options.files;
    } else if (options.ci || process.env.CI) {
      // CI mode: check staged files
      spinner.text = 'Getting staged files...';
      filesToCheck = await getStagedFiles();
    } else {
      // Default: check all source files
      spinner.text = 'Scanning for source files...';
      filesToCheck = await scanSourceFiles(cwd);
    }

    if (filesToCheck.length === 0) {
      spinner.warn(chalk.yellow('No files to check.'));
      return {
        passed: true,
        violations: [],
        summary: { totalFiles: 0, checkedFiles: 0, errors: 0, warnings: 0 },
      };
    }

    spinner.text = `Checking ${filesToCheck.length} files...`;

    // Parse rules to check
    const rulesToCheck = options.rules
      ? options.rules.split(',').map(r => r.trim())
      : ['summary', 'assumptions', 'security', 'secrets', 'minimal'];

    // Run checks
    const violations: Violation[] = [];
    
    for (const file of filesToCheck) {
      const fileViolations = await checkFile(file, rulesToCheck, config, options);
      violations.push(...fileViolations);
    }

    spinner.succeed(chalk.green(`Checked ${filesToCheck.length} files`));

    // Generate result
    const result: CheckResult = {
      passed: !violations.some(v => v.severity === 'error'),
      violations,
      summary: {
        totalFiles: filesToCheck.length,
        checkedFiles: filesToCheck.length,
        errors: violations.filter(v => v.severity === 'error').length,
        warnings: violations.filter(v => v.severity === 'warning').length,
      },
    };

    // Output results
    await outputResults(result, options);

    // Exit with error code if configured
    if (options.failOnViolation && !result.passed) {
      process.exit(1);
    }

    return result;
  } catch (error) {
    spinner.fail(chalk.red(`Check failed: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

async function checkFile(
  filePath: string,
  rules: string[],
  config: FotsConfig,
  options: CheckOptions
): Promise<Violation[]> {
  const violations: Violation[] = [];
  
  if (!(await fileExists(filePath))) {
    return violations;
  }

  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const isSourceFile = isCodeFile(filePath);
  const isTestFile = filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('/test/') || filePath.includes('/tests/');
  const isSensitive = SENSITIVE_PATTERNS.some(p => p.test(filePath));
  
  // Get diff for this file (if in diff mode)
  const diff = options.diff ? await getFileDiff(filePath, options.diff) : null;
  const changedLines = diff ? parseChangedLines(diff) : null;

  // Check SUMMARY block
  if (rules.includes('summary') && isSourceFile && !isTestFile) {
    const hasSummary = /SUMMARY\s*\n/i.test(content) || /##?\s*Summary/i.test(content);
    
    if (!hasSummary) {
      violations.push({
        file: filePath,
        rule: 'summary',
        severity: config.settings?.enforceSummary ? 'error' : 'warning',
        message: 'Missing SUMMARY block',
        suggestion: 'Add a SUMMARY block explaining what was changed and why',
      });
    }
  }

  // Check ASSUMPTIONS block for large or complex changes
  if (rules.includes('assumptions') && isSourceFile && !isTestFile && config.settings?.enforceAssumptions) {
    const lineCount = changedLines ? changedLines.length : lines.length;
    const hasAssumptions = /ASSUMPTIONS?\s*\n/i.test(content) || /##?\s*Assumptions/i.test(content);
    const isComplex = lineCount > (options.maxChangeSize || config.settings?.maxChangeSize || 50);
    
    if (isComplex && !hasAssumptions) {
      violations.push({
        file: filePath,
        rule: 'assumptions',
        severity: 'warning',
        message: `Large change (${lineCount} lines) without ASSUMPTIONS block`,
        suggestion: 'Document assumptions for changes over 50 lines',
      });
    }
  }

  // Check SECURITY NOTE for sensitive files
  if (rules.includes('security') && isSensitive && isSourceFile) {
    const hasSecurityNote = /SECURITY\s*NOTE/i.test(content) || /##?\s*Security/i.test(content);
    
    if (!hasSecurityNote) {
      violations.push({
        file: filePath,
        rule: 'security',
        severity: 'error',
        message: 'Sensitive file missing SECURITY NOTE',
        suggestion: 'Document security considerations for auth/crypto code',
      });
    }
  }

  // Check for hardcoded secrets
  if (rules.includes('secrets')) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.test(line) && !isCommentLine(line) && !isTestFile) {
          violations.push({
            file: filePath,
            line: i + 1,
            rule: 'secrets',
            severity: 'error',
            message: 'Potential hardcoded secret detected',
            suggestion: 'Use environment variables or a secrets manager',
          });
          break;
        }
      }
    }
  }

  // Check minimal change principle (diff-based)
  if (rules.includes('minimal') && diff) {
    const addedLines = changedLines ? changedLines.filter(l => l.type === 'added').length : 0;
    const removedLines = changedLines ? changedLines.filter(l => l.type === 'removed').length : 0;
    const netChange = addedLines - removedLines;
    
    if (netChange > (options.maxChangeSize || config.settings?.maxChangeSize || 200)) {
      violations.push({
        file: filePath,
        rule: 'minimal',
        severity: 'warning',
        message: `Large change: +${addedLines} -${removedLines} (${netChange} net lines)`,
        suggestion: 'Consider breaking into smaller, focused changes',
      });
    }
  }

  // Check for tests (if test rule enabled and file is new)
  if (rules.includes('tests') && isSourceFile && !isTestFile) {
    const hasTests = await checkHasTests(filePath);
    
    if (!hasTests) {
      violations.push({
        file: filePath,
        rule: 'tests',
        severity: 'warning',
        message: 'No corresponding test file found',
        suggestion: 'Add tests for new functionality',
      });
    }
  }

  return violations;
}

function isCodeFile(filePath: string): boolean {
  const codeExtensions = [
    '.ts', '.tsx', '.js', '.jsx',
    '.py', '.rb', '.php', '.go',
    '.rs', '.java', '.kt', '.swift',
    '.cpp', '.c', '.h',
    '.cs', '.fs',
    '.vue', '.svelte', '.astro',
  ];
  
  return codeExtensions.some(ext => filePath.endsWith(ext));
}

function isCommentLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('//') || 
         trimmed.startsWith('#') || 
         trimmed.startsWith('*') ||
         trimmed.startsWith('/*') ||
         trimmed.startsWith('/**') ||
         trimmed.startsWith("'") ||
         trimmed.startsWith('--') ||
         trimmed.startsWith(';');
}

async function scanSourceFiles(cwd: string): Promise<string[]> {
  const patterns = [
    'src/**/*.{ts,tsx,js,jsx}',
    'app/**/*.{ts,tsx,js,jsx}',
    'lib/**/*.{ts,tsx,js,jsx}',
    'components/**/*.{ts,tsx,js,jsx,vue,svelte,astro}',
    'pages/**/*.{ts,tsx,js,jsx,vue,svelte,astro}',
    'routes/**/*.{ts,tsx,js,jsx}',
    '**/*.py',
    '**/*.rb',
    '**/*.go',
    '**/*.rs',
  ];

  const files: string[] = [];
  const glob = await import('glob');
  
  for (const pattern of patterns) {
    const matches = await glob.glob(pattern, { cwd, absolute: true });
    files.push(...matches);
  }

  return [...new Set(files)];
}

async function getFileDiff(filePath: string, diffRef: string): Promise<string> {
  try {
    return execSync(`git diff ${diffRef} -- "${filePath}"`, {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });
  } catch {
    return '';
  }
}

function parseChangedLines(diff: string): Array<{ type: 'added' | 'removed'; content: string }> {
  const lines: Array<{ type: 'added' | 'removed'; content: string }> = [];
  const diffLines = diff.split('\n');
  
  for (const line of diffLines) {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      lines.push({ type: 'added', content: line.slice(1) });
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      lines.push({ type: 'removed', content: line.slice(1) });
    }
  }
  
  return lines;
}

async function checkHasTests(sourceFile: string): Promise<boolean> {
  const dir = path.dirname(sourceFile);
  const base = path.basename(sourceFile, path.extname(sourceFile));
  const ext = path.extname(sourceFile);
  
  const testPatterns = [
    path.join(dir, `${base}.test${ext}`),
    path.join(dir, `${base}.spec${ext}`),
    path.join(dir, '__tests__', `${base}.test${ext}`),
    path.join(dir, '__tests__', `${base}.spec${ext}`),
    path.join(dir, 'test', `${base}.test${ext}`),
    path.join(dir, 'tests', `${base}.test${ext}`),
  ];

  for (const pattern of testPatterns) {
    if (await fileExists(pattern)) {
      return true;
    }
  }

  return false;
}

async function outputResults(result: CheckResult, options: CheckOptions): Promise<void> {
  const format = options.format || 'text';

  switch (format) {
    case 'json':
      await outputJson(result, options.output);
      break;
    case 'github':
      outputGitHub(result);
      break;
    case 'junit':
      await outputJUnit(result, options.output);
      break;
    case 'text':
    default:
      outputText(result);
      break;
  }
}

function outputText(result: CheckResult): void {
  console.log('\n' + chalk.bold('Compliance Check Results'));
  console.log(chalk.dim('═'.repeat(50)));
  
  console.log(`\n${chalk.bold('Files Checked:')} ${result.summary.totalFiles}`);
  console.log(`${chalk.bold('Violations:')} ${result.summary.errors} errors, ${result.summary.warnings} warnings`);

  if (result.violations.length === 0) {
    console.log('\n' + chalk.green('✓ All checks passed!'));
    return;
  }

  console.log('\n' + chalk.bold('Violations:'));
  
  for (const violation of result.violations) {
    const color = violation.severity === 'error' ? chalk.red : chalk.yellow;
    const symbol = violation.severity === 'error' ? '✗' : '⚠';
    
    console.log(`\n  ${color(symbol)} ${chalk.bold(violation.file)}${violation.line ? `:${violation.line}` : ''}`);
    console.log(`     ${color(RULES[violation.rule as keyof typeof RULES] || violation.rule)}`);
    console.log(`     ${violation.message}`);
    
    if (violation.suggestion) {
      console.log(chalk.dim(`     💡 ${violation.suggestion}`));
    }
  }

  console.log('\n' + chalk.dim('─'.repeat(50)));
  
  if (result.passed) {
    console.log(chalk.green('\n✓ Checks passed with warnings'));
  } else {
    console.log(chalk.red('\n✗ Checks failed'));
  }
}

async function outputJson(result: CheckResult, outputPath?: string): Promise<void> {
  const json = JSON.stringify(result, null, 2);
  
  if (outputPath) {
    await fs.writeFile(outputPath, json);
    console.log(chalk.green(`Results written to ${outputPath}`));
  } else {
    console.log(json);
  }
}

function outputGitHub(result: CheckResult): void {
  // Output GitHub Actions annotations
  for (const violation of result.violations) {
    const severity = violation.severity === 'error' ? 'error' : 'warning';
    const message = `${RULES[violation.rule as keyof typeof RULES]}: ${violation.message}`;
    
    console.log(
      `::${severity} file=${violation.file}${violation.line ? `,line=${violation.line}` : ''}::${message}`
    );
  }

  // Set output variables
  console.log(`::set-output name=passed::${result.passed}`);
  console.log(`::set-output name=errors::${result.summary.errors}`);
  console.log(`::set-output name=warnings::${result.summary.warnings}`);
}

async function outputJUnit(result: CheckResult, outputPath?: string): Promise<void> {
  const testCases = result.violations.map(v => {
    const name = `${v.file}:${v.rule}`;
    const message = v.message;
    
    if (v.severity === 'error') {
      return `    <testcase name="${escapeXml(name)}">
      <failure message="${escapeXml(message)}">${escapeXml(v.suggestion || '')}</failure>
    </testcase>`;
    } else {
      return `    <testcase name="${escapeXml(name)}">
      <skipped message="${escapeXml(message)}"/>
    </testcase>`;
    }
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="FOTS Compliance" tests="${result.summary.checkedFiles}" failures="${result.summary.errors}" skipped="${result.summary.warnings}">
${testCases}
  </testsuite>
</testsuites>`;

  if (outputPath) {
    await fs.writeFile(outputPath, xml);
    console.log(chalk.green(`JUnit report written to ${outputPath}`));
  } else {
    console.log(xml);
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
