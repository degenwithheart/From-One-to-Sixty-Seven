import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { glob } from 'glob';
import { execSync } from 'child_process';
import { loadConfig, getGitRoot } from '../utils/index.js';

interface ValidationResult {
  file: string;
  violations: Violation[];
}

interface Violation {
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  line?: number;
  column?: number;
}

interface ValidateOptions {
  rules?: string;
  diff?: string;
  staged?: boolean;
  format?: string;
  failOnViolation?: boolean;
  fix?: boolean;
}

export async function validateCommand(files: string[], options: ValidateOptions): Promise<void> {
  const spinner = ora('Validating compliance...').start();
  
  try {
    const cwd = process.cwd();
    const config = await loadConfig(cwd).catch(() => null);
    const rulesToCheck = (options.rules || 'summary,assumptions,security').split(',');
    
    let filesToCheck: string[] = files || [];
    
    if (filesToCheck.length === 0) {
      if (options.staged) {
        const stagedFiles = execSync('git diff --cached --name-only', { cwd, encoding: 'utf8' });
        filesToCheck = stagedFiles.trim().split('\n').filter(f => f && isCodeFile(f));
      } else if (options.diff) {
        const diffFiles = execSync(`git diff --name-only ${options.diff}`, { cwd, encoding: 'utf8' });
        filesToCheck = diffFiles.trim().split('\n').filter(f => f && isCodeFile(f));
      } else {
        filesToCheck = await glob('src/**/*.{ts,js,tsx,jsx,py,go,rs,java,kt,cs,rb,php,swift,dart,cpp,c,h,sql,sh,bash}', { 
          cwd,
          ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**']
        });
      }
    }
    
    if (filesToCheck.length === 0) {
      spinner.succeed(chalk.green('No files to validate'));
      return;
    }
    
    spinner.text = `Validating ${filesToCheck.length} files...`;
    
    const results: ValidationResult[] = [];
    let processed = 0;
    
    for (const file of filesToCheck) {
      processed++;
      if (processed % 10 === 0) {
        spinner.text = `Validated ${processed}/${filesToCheck.length} files...`;
      }
      
      const filePath = path.resolve(cwd, file);
      if (!(await fs.pathExists(filePath))) continue;
      
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) continue;
      
      const content = await fs.readFile(filePath, 'utf8');
      const violations: Violation[] = [];
      
      if (rulesToCheck.includes('summary')) {
        violations.push(...checkSummaryRule(content, file, config));
      }
      
      if (rulesToCheck.includes('assumptions')) {
        violations.push(...checkAssumptionsRule(content, file));
      }
      
      if (rulesToCheck.includes('security')) {
        violations.push(...checkSecurityRule(content, file));
      }
      
      if (rulesToCheck.includes('tests')) {
        violations.push(...checkTestsRule(content, file, cwd));
      }
      
      if (violations.length > 0) {
        results.push({ file, violations });
      }
    }
    
    spinner.stop();
    
    const format = options.format || 'pretty';
    
    switch (format) {
      case 'json':
        console.log(JSON.stringify(results, null, 2));
        break;
      case 'github':
        outputGitHubFormat(results);
        break;
      case 'sarif':
        outputSarifFormat(results, cwd);
        break;
      default:
        outputPrettyFormat(results, filesToCheck.length);
    }
    
    if (options.fix) {
      await autoFix(results, cwd);
    }
    
    const hasErrors = results.some(r => r.violations.some(v => v.severity === 'error'));
    
    if (options.failOnViolation && hasErrors) {
      process.exit(1);
    }
    
  } catch (error) {
    spinner.fail(chalk.red(`Validation failed: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

function isCodeFile(file: string): boolean {
  const extensions = ['.ts', '.js', '.tsx', '.jsx', '.py', '.go', '.rs', '.java', '.kt', '.cs', '.rb', '.php', '.swift', '.dart', '.cpp', '.c', '.h', '.sql', '.sh', '.bash'];
  return extensions.some(ext => file.endsWith(ext));
}

function checkSummaryRule(content: string, file: string, config: any): Violation[] {
  const violations: Violation[] = [];
  
  if (content.length < 200) return violations;
  
  const hasSummaryBlock = /SUMMARY:\s*\n[\s\S]*?-\s*What changed:/i.test(content);
  const hasSummaryComment = /SUMMARY:/i.test(content);
  
  if (!hasSummaryBlock) {
    if (hasSummaryComment) {
      violations.push({
        rule: 'summary',
        message: 'SUMMARY block exists but may be incomplete (missing required fields: What changed, Why, Verified, Assumptions, Risks)',
        severity: 'warning'
      });
    } else if (config?.settings?.enforceSummary) {
      violations.push({
        rule: 'summary',
        message: 'Missing SUMMARY block. Required format:\nSUMMARY:\n- What changed:\n- Why:\n- Verified:\n- Assumptions:\n- Risks:',
        severity: config.settings.enforceSummary ? 'error' : 'warning'
      });
    }
  }
  
  return violations;
}

function checkAssumptionsRule(content: string, file: string): Violation[] {
  const violations: Violation[] = [];
  
  const hasAssumptions = /ASSUMPTIONS:\s*\n/i.test(content);
  const hasAmbiguousComment = /\/(\/|\*)\s*(TODO|FIXME|HACK|XXX|NOTE|BUG)/i.test(content);
  const hasMaybePerhaps = /\b(maybe|perhaps|possibly|probably|might|could be)\b/i.test(content);
  
  if (!hasAssumptions && hasAmbiguousComment) {
    violations.push({
      rule: 'assumptions',
      message: 'Code contains TODO/FIXME comments but no explicit ASSUMPTIONS block. Consider declaring assumptions.',
      severity: 'info'
    });
  }
  
  if (!hasAssumptions && hasMaybePerhaps) {
    violations.push({
      rule: 'assumptions',
      message: 'Language suggests uncertainty ("maybe", "perhaps"). Consider formalizing with ASSUMPTIONS block.',
      severity: 'info'
    });
  }
  
  return violations;
}

function checkSecurityRule(content: string, file: string): Violation[] {
  const violations: Violation[] = [];
  
  const secretPatterns = [
    { pattern: /(password|passwd|pwd)\s*=\s*["'][^"']{8,}["']/i, message: 'Potential hardcoded password' },
    { pattern: /(api[_-]?key|apikey)\s*=\s*["'][^"']{16,}["']/i, message: 'Potential hardcoded API key' },
    { pattern: /(secret[_-]?key|secretkey)\s*=\s*["'][^"']{16,}["']/i, message: 'Potential hardcoded secret key' },
    { pattern: /(token|access[_-]?token)\s*=\s*["'][^"']{20,}["']/i, message: 'Potential hardcoded token' },
    { pattern: /sk-[a-zA-Z0-9]{20,}/, message: 'Potential OpenAI API key pattern' },
    { pattern: /gh[pousr]_[A-Za-z0-9_]{10,}/, message: 'Potential GitHub token pattern' }
  ];
  
  const isEnvFile = file.includes('.env') || file.endsWith('.env.example');
  const isConfigWithEnv = content.includes('process.env') || content.includes('os.environ') || content.includes('import.meta.env');
  
  for (const { pattern, message } of secretPatterns) {
    if (pattern.test(content)) {
      if (!isEnvFile && !isConfigWithEnv) {
        violations.push({
          rule: 'security',
          message: `${message}. Use environment variables instead of hardcoding secrets.`,
          severity: 'error'
        });
      }
      break;
    }
  }
  
  const sqlInjectionPattern = /(execute|query|exec)\s*\(\s*["'`][^"'`]*\$\{[^}]+\}/;
  if (sqlInjectionPattern.test(content)) {
    violations.push({
      rule: 'security',
      message: 'Potential SQL injection risk: string interpolation in query. Use parameterized queries.',
      severity: 'error'
    });
  }
  
  const shellInjectionPattern = /(exec|execSync|spawn)\s*\([^)]*\+\s*[^)]*\)/;
  if (shellInjectionPattern.test(content)) {
    violations.push({
      rule: 'security',
      message: 'Potential command injection: string concatenation in shell execution. Validate all user input.',
      severity: 'error'
    });
  }
  
  return violations;
}

function checkTestsRule(content: string, file: string, cwd: string): Violation[] {
  const violations: Violation[] = [];
  
  if (file.includes('.test.') || file.includes('.spec.') || file.includes('__tests__')) {
    return violations;
  }
  
  const isTestable = content.length > 100 && !file.includes('config') && !file.includes('constant');
  
  if (isTestable) {
    const testFileVariants = [
      file.replace(/\.ts$/, '.test.ts').replace(/\.js$/, '.test.js'),
      file.replace(/\.ts$/, '.spec.ts').replace(/\.js$/, '.spec.js'),
      path.join('__tests__', path.basename(file).replace(/\.ts$/, '.test.ts').replace(/\.js$/, '.test.js'))
    ];
    
    const hasTestFile = testFileVariants.some(async testFile => {
      return await fs.pathExists(path.join(cwd, testFile));
    });
    
    if (!hasTestFile) {
      violations.push({
        rule: 'tests',
        message: 'No corresponding test file found. Consider adding tests for this module.',
        severity: 'info'
      });
    }
  }
  
  return violations;
}

function outputPrettyFormat(results: ValidationResult[], totalFiles: number): void {
  const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0);
  
  if (results.length === 0) {
    console.log(chalk.green(`✓ All ${totalFiles} files pass validation`));
    return;
  }
  
  const errors = results.reduce((sum, r) => sum + r.violations.filter(v => v.severity === 'error').length, 0);
  const warnings = results.reduce((sum, r) => sum + r.violations.filter(v => v.severity === 'warning').length, 0);
  const infos = results.reduce((sum, r) => sum + r.violations.filter(v => v.severity === 'info').length, 0);
  
  console.log(chalk.yellow(`\n⚠ Found ${totalViolations} violations in ${results.length} files:`));
  console.log(chalk.dim(`  Errors: ${errors}, Warnings: ${warnings}, Info: ${infos}\n`));
  
  for (const result of results) {
    console.log(chalk.underline(result.file));
    for (const v of result.violations) {
      const color = v.severity === 'error' ? chalk.red : v.severity === 'warning' ? chalk.yellow : chalk.dim;
      const icon = v.severity === 'error' ? '✗' : v.severity === 'warning' ? '⚠' : 'ℹ';
      console.log(`  ${color(`${icon} [${v.severity.toUpperCase()}]`)} ${v.message}`);
      if (v.line) {
        console.log(chalk.dim(`    at line ${v.line}${v.column ? `:${v.column}` : ''}`));
      }
    }
    console.log();
  }
}

function outputGitHubFormat(results: ValidationResult[]): void {
  for (const result of results) {
    for (const v of result.violations) {
      const level = v.severity === 'error' ? 'error' : v.severity === 'warning' ? 'warning' : 'notice';
      console.log(`::${level} file=${result.file}${v.line ? `,line=${v.line}` : ''}::${v.message}`);
    }
  }
}

function outputSarifFormat(results: ValidationResult[], cwd: string): void {
  const sarif = {
    version: '2.1.0',
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    runs: [{
      tool: {
        driver: {
          name: 'fots',
          version: '2.0.0',
          informationUri: 'https://github.com/degenwithheart/llm-engineering-spec'
        }
      },
      results: results.flatMap(r => 
        r.violations.map(v => ({
          ruleId: v.rule,
          level: v.severity === 'error' ? 'error' : v.severity === 'warning' ? 'warning' : 'note',
          message: { text: v.message },
          locations: [{
            physicalLocation: {
              artifactLocation: { uri: path.relative(cwd, r.file) },
              region: v.line ? { startLine: v.line, startColumn: v.column || 1 } : undefined
            }
          }]
        }))
      )
    }]
  };
  
  console.log(JSON.stringify(sarif, null, 2));
}

async function autoFix(results: ValidationResult[], cwd: string): Promise<void> {
  console.log(chalk.blue('\n🔧 Auto-fixing violations...'));
  
  let fixed = 0;
  
  for (const result of results) {
    const filePath = path.join(cwd, result.file);
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;
    
    for (const violation of result.violations) {
      if (violation.rule === 'summary' && violation.severity === 'error') {
        if (!content.includes('SUMMARY:')) {
          content += '\n\nSUMMARY:\n- What changed:\n- Why:\n- Verified:\n- Assumptions:\n- Risks:\n';
          modified = true;
          fixed++;
        }
      }
    }
    
    if (modified) {
      await fs.writeFile(filePath, content);
    }
  }
  
  console.log(chalk.green(`  Fixed ${fixed} violations`));
}
