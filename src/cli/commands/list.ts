import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { 
  SUPPORTED_STACKS, 
  SUPPORTED_VARIANTS, 
  SUPPORTED_TOOLS,
  loadConfig,
  getPkgRoot,
  fileExists 
} from '../utils/index.js';

interface ListOptions {
  stacks?: boolean;
  variants?: boolean;
  frameworks?: boolean;
  tools?: boolean;
  installed?: boolean;
}

const FRAMEWORKS = [
  { name: 'nextjs', description: 'Next.js 14 + Prisma + tRPC', stack: 'typescript' },
  { name: 'django', description: 'Django REST API + PostgreSQL', stack: 'python' },
  { name: 'fastapi', description: 'FastAPI + React + SQLAlchemy', stack: 'python' },
  { name: 'remix', description: 'Remix + Prisma + TypeScript', stack: 'typescript' },
  { name: 'laravel', description: 'Laravel + Vue + MySQL', stack: 'php' },
  { name: 'rails', description: 'Rails + React + PostgreSQL', stack: 'ruby' },
  { name: 'astro', description: 'Astro SSR + Content Collections', stack: 'typescript' }
];

const TOOL_DESCRIPTIONS: Record<string, string> = {
  claude: 'Anthropic Claude Code',
  cursor: 'Cursor AI Editor',
  copilot: 'GitHub Copilot',
  gemini: 'Google Gemini Code Assist',
  aider: 'Aider CLI',
  codeium: 'Codeium / Windsurf',
  tabnine: 'Tabnine Enterprise',
  codewhisperer: 'Amazon Q / CodeWhisperer',
  agents: 'OpenAI GPT-4 / Codex / Generic Agents'
};

const VARIANT_DESCRIPTIONS: Record<string, string> = {
  'enterprise': 'Regulated environments, strict processes, compliance requirements',
  'lean-startup': 'Rapid iteration, minimal overhead, MVPs',
  'security-hardened': 'Security-critical systems, mandatory security blocks',
  'test-first': 'Strict TDD, red-green-refactor cycle',
  'monorepo': 'Multi-package repositories, cross-module discipline'
};

export async function listCommand(options: ListOptions): Promise<void> {
  const cwd = process.cwd();
  
  const showAll = !options.stacks && !options.variants && !options.frameworks && !options.tools && !options.installed;
  
  if (showAll || options.stacks) {
    console.log(chalk.blue('\n📚 Tech Stacks'));
    console.log(chalk.dim('Supported programming languages and platforms:\n'));
    
    const columns = 3;
    const rows = Math.ceil(SUPPORTED_STACKS.length / columns);
    
    for (let i = 0; i < rows; i++) {
      const row = SUPPORTED_STACKS.slice(i * columns, (i + 1) * columns);
      console.log('  ' + row.map(s => chalk.green(s.padEnd(15))).join(''));
    }
    
    console.log(chalk.dim(`\nUse with: fots init --stack=<stack>`));
  }
  
  if (showAll || options.variants) {
    console.log(chalk.blue('\n🎯 Environment Variants'));
    console.log(chalk.dim('Specialized configurations for different contexts:\n'));
    
    for (const variant of SUPPORTED_VARIANTS) {
      const desc = VARIANT_DESCRIPTIONS[variant] || '';
      console.log(`  ${chalk.yellow(variant.padEnd(20))} ${chalk.dim(desc)}`);
    }
    
    console.log(chalk.dim(`\nUse with: fots init --variant=<variant>`));
  }
  
  if (showAll || options.frameworks) {
    console.log(chalk.blue('\n🏗️  Framework Templates'));
    console.log(chalk.dim('Pre-configured project templates:\n'));
    
    const pkgRoot = getPkgRoot();
    
    for (const fw of FRAMEWORKS) {
      const templateDir = path.join(pkgRoot, 'templates', 'frameworks', `${fw.name}-fullstack`);
      const exists = await fileExists(templateDir);
      const status = exists ? chalk.green('✓') : chalk.red('✗');
      console.log(`  ${status} ${chalk.cyan(fw.name.padEnd(12))} ${chalk.dim(fw.description)}`);
    }
    
    console.log(chalk.dim(`\nUse with: fots template --framework=<framework> --output=./my-app`));
  }
  
  if (showAll || options.tools) {
    console.log(chalk.blue('\n🤖 AI Assistants'));
    console.log(chalk.dim('Supported AI coding tools:\n'));
    
    for (const tool of SUPPORTED_TOOLS) {
      const desc = TOOL_DESCRIPTIONS[tool] || '';
      const configFile = getToolConfigFile(tool);
      console.log(`  ${chalk.magenta(tool.padEnd(15))} ${chalk.dim(desc)}`);
      console.log(chalk.dim(`    Config: ${configFile}`));
    }
    
    console.log(chalk.dim(`\nUse with: fots generate --<tool> or fots generate --all`));
  }
  
  if (options.installed) {
    console.log(chalk.blue('\n📦 Current Installation'));
    
    try {
      const config = await loadConfig(cwd);
      
      console.log(chalk.dim('\nConfiguration:'));
      console.log(`  Version:  ${config.version}`);
      console.log(`  Stack:    ${chalk.green(config.stack)}`);
      console.log(`  Variant:  ${chalk.yellow(config.variant)}`);
      console.log(`  Tools:    ${config.tools.map((t: string) => chalk.magenta(t)).join(', ')}`);
      console.log(`  Created:  ${new Date(config.createdAt).toLocaleDateString()}`);
      
      if (config.settings) {
        console.log(chalk.dim('\nSettings:'));
        console.log(`  Enforce SUMMARY:      ${config.settings.enforceSummary ? 'yes' : 'no'}`);
        console.log(`  Enforce ASSUMPTIONS:  ${config.settings.enforceAssumptions ? 'yes' : 'no'}`);
        console.log(`  Max change size:      ${config.settings.maxChangeSize} lines`);
      }
      
      const fotsDir = path.join(cwd, '.fots');
      if (await fileExists(fotsDir)) {
        const files = await fs.readdir(fotsDir, { recursive: true, withFileTypes: true });
        const mdFiles = files
          .filter((f: fs.Dirent) => f.isFile() && f.name.endsWith('.md'))
          .map((f: fs.Dirent) => f.name);
        console.log(chalk.dim(`\nInstalled specs: ${mdFiles.length} files`));
      }
      
    } catch {
      console.log(chalk.yellow('\n⚠ No FOTS configuration found in current directory'));
      console.log(chalk.dim('Run `fots init` to initialize'));
    }
  }
  
  if (showAll) {
    console.log(chalk.blue('\n💡 Quick Start'));
    console.log(chalk.dim('  fots init                    # Initialize with prompts'));
    console.log(chalk.dim('  fots init --stack=typescript --variant=lean-startup'));
    console.log(chalk.dim('  fots generate --all          # Generate all AI configs'));
    console.log(chalk.dim('  fots validate                # Check compliance'));
    console.log(chalk.dim('  fots template -f nextjs -o . # Use a template'));
    console.log();
  }
}

function getToolConfigFile(tool: string): string {
  const configs: Record<string, string> = {
    claude: '.claude/CLAUDE.md',
    cursor: '.cursorrules',
    copilot: '.github/copilot-instructions.md',
    gemini: 'GEMINI.md',
    aider: 'CONVENTIONS.md',
    codeium: '.windsurfrules',
    tabnine: 'TABNINE.md',
    codewhisperer: 'CODEWHISPERER.md',
    agents: 'AGENTS.md'
  };
  return configs[tool] || `${tool.toUpperCase()}.md`;
}
