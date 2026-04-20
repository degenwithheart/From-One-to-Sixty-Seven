import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig, getPkgRoot, fileExists } from '../utils/index.js';

interface DoctorOptions {
  fix?: boolean;
}

interface Issue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  file?: string;
  fix?: () => Promise<void>;
}

export async function doctorCommand(options: DoctorOptions): Promise<void> {
  const spinner = ora('Diagnosing FOTS installation...').start();
  
  try {
    const cwd = process.cwd();
    const issues: Issue[] = [];
    
    issues.push(...await checkConfiguration(cwd));
    issues.push(...await checkToolConfigs(cwd));
    issues.push(...await checkSpecFiles(cwd));
    issues.push(...await checkGitIntegration(cwd));
    
    spinner.stop();
    
    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');
    const infos = issues.filter(i => i.severity === 'info');
    
    if (issues.length === 0) {
      console.log(chalk.green('✓ No issues found. FOTS installation is healthy!'));
      return;
    }
    
    console.log(chalk.blue(`\n🔍 Found ${issues.length} issues:\n`));
    
    if (errors.length > 0) {
      console.log(chalk.red('Errors:'));
      errors.forEach(issue => printIssue(issue));
    }
    
    if (warnings.length > 0) {
      console.log(chalk.yellow('Warnings:'));
      warnings.forEach(issue => printIssue(issue));
    }
    
    if (infos.length > 0) {
      console.log(chalk.dim('Info:'));
      infos.forEach(issue => printIssue(issue));
    }
    
    const fixable = issues.filter(i => i.fix);
    
    if (options.fix && fixable.length > 0) {
      console.log(chalk.blue(`\n🔧 Attempting to fix ${fixable.length} issues...\n`));
      
      let fixed = 0;
      for (const issue of fixable) {
        try {
          if (issue.fix) {
            await issue.fix();
            console.log(chalk.green(`  ✓ ${issue.message}`));
            fixed++;
          }
        } catch (error) {
          console.log(chalk.red(`  ✗ Failed to fix: ${issue.message}`));
        }
      }
      
      console.log(chalk.green(`\nFixed ${fixed}/${fixable.length} issues`));
      
      if (fixed < fixable.length) {
        console.log(chalk.dim('Some issues require manual intervention'));
      }
    } else if (fixable.length > 0) {
      console.log(chalk.dim(`\n${fixable.length} issues can be auto-fixed with --fix`));
    }
    
    if (errors.length > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    spinner.fail(chalk.red(`Diagnosis failed: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

function printIssue(issue: Issue): void {
  const icon = issue.severity === 'error' ? '✗' : issue.severity === 'warning' ? '⚠' : 'ℹ';
  const color = issue.severity === 'error' ? chalk.red : issue.severity === 'warning' ? chalk.yellow : chalk.dim;
  
  console.log(color(`  ${icon} ${issue.message}`));
  if (issue.file) {
    console.log(chalk.dim(`    → ${issue.file}`));
  }
}

async function checkConfiguration(cwd: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  const configPath = path.join(cwd, '.fots', 'config.json');
  
  if (!(await fileExists(configPath))) {
    issues.push({
      severity: 'error',
      message: 'No FOTS configuration found',
      fix: async () => {
        const { initCommand } = await import('./init.js');
        await initCommand({ yes: true });
      }
    });
    return issues;
  }
  
  try {
    const config = await loadConfig(cwd);
    
    if (!config.version) {
      issues.push({
        severity: 'warning',
        message: 'Configuration missing version field',
        fix: async () => {
          config.version = '2.0.0';
          await fs.writeJson(configPath, config, { spaces: 2 });
        }
      });
    }
    
    if (!config.stack) {
      issues.push({
        severity: 'error',
        message: 'Configuration missing stack field'
      });
    }
    
  } catch (error) {
    issues.push({
      severity: 'error',
      message: `Invalid configuration file: ${error instanceof Error ? error.message : String(error)}`,
      file: configPath
    });
  }
  
  return issues;
}

async function checkToolConfigs(cwd: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  
  try {
    const config = await loadConfig(cwd);
    const configuredTools = new Set(config.tools || []);
    
    const existingTools: string[] = [];
    
    const toolFiles = [
      { tool: 'claude', file: '.claude/CLAUDE.md' },
      { tool: 'cursor', file: '.cursorrules' },
      { tool: 'copilot', file: '.github/copilot-instructions.md' },
      { tool: 'gemini', file: 'GEMINI.md' },
      { tool: 'aider', file: 'CONVENTIONS.md' },
      { tool: 'codeium', file: '.windsurfrules' },
      { tool: 'tabnine', file: 'TABNINE.md' },
      { tool: 'codewhisperer', file: 'CODEWHISPERER.md' },
      { tool: 'agents', file: 'AGENTS.md' }
    ];
    
    for (const { tool, file } of toolFiles) {
      if (await fileExists(path.join(cwd, file))) {
        existingTools.push(tool);
      }
    }
    
    const configuredButMissing = [...configuredTools].filter(t => !existingTools.includes(t));
    const existingButNotConfigured = existingTools.filter(t => !configuredTools.has(t));
    
    for (const tool of configuredButMissing) {
      issues.push({
        severity: 'warning',
        message: `Tool '${tool}' is configured but config file is missing`,
        fix: async () => {
          const { generateConfigs } = await import('../utils/generator.js');
          await generateConfigs(cwd, { tools: [tool] });
        }
      });
    }
    
    for (const tool of existingButNotConfigured) {
      issues.push({
        severity: 'info',
        message: `Found ${tool} config not registered in FOTS`,
        fix: async () => {
          const config = await loadConfig(cwd);
          config.tools = [...new Set([...config.tools, tool])];
          await fs.writeJson(path.join(cwd, '.fots', 'config.json'), config, { spaces: 2 });
        }
      });
    }
    
  } catch {
    // Config error already reported
  }
  
  return issues;
}

async function checkSpecFiles(cwd: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  const fotsDir = path.join(cwd, '.fots');
  
  try {
    const config = await loadConfig(cwd);
    
    const stackFile = path.join(fotsDir, 'stacks', `${config.stack}.md`);
    if (!(await fileExists(stackFile))) {
      issues.push({
        severity: 'warning',
        message: `Stack specification file missing for '${config.stack}'`,
        file: stackFile,
        fix: async () => {
          const pkgRoot = getPkgRoot();
          const source = path.join(pkgRoot, 'stacks', `${config.stack}.md`);
          if (await fileExists(source)) {
            await fs.ensureDir(path.dirname(stackFile));
            await fs.copy(source, stackFile);
          }
        }
      });
    }
    
    if (config.variant && config.variant !== 'default') {
      const variantFile = path.join(fotsDir, 'variants', `${config.variant}.md`);
      if (!(await fileExists(variantFile))) {
        issues.push({
          severity: 'warning',
          message: `Variant specification file missing for '${config.variant}'`,
          file: variantFile,
          fix: async () => {
            const pkgRoot = getPkgRoot();
            const source = path.join(pkgRoot, 'variants', `${config.variant.toUpperCase().replace(/-/g, '_')}.md`);
            if (await fileExists(source)) {
              await fs.ensureDir(path.dirname(variantFile));
              await fs.copy(source, variantFile);
            }
          }
        });
      }
    }
    
  } catch {
    // Config error already reported
  }
  
  return issues;
}

async function checkGitIntegration(cwd: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  const gitDir = path.join(cwd, '.git');
  const gitignore = path.join(cwd, '.gitignore');
  
  if (!(await fileExists(gitDir))) {
    issues.push({
      severity: 'info',
      message: 'Not a git repository'
    });
    return issues;
  }
  
  if (await fileExists(gitignore)) {
    const content = await fs.readFile(gitignore, 'utf8');
    
    if (!content.includes('.fots/')) {
      issues.push({
        severity: 'info',
        message: '.fots/ not in .gitignore (consider adding for local overrides)',
        file: gitignore,
        fix: async () => {
          await fs.appendFile(gitignore, '\n# FOTS local overrides\n.fots/*.local.md\n');
        }
      });
    }
  }
  
  return issues;
}
