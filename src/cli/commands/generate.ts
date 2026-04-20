import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { getPkgRoot, loadConfig, fileExists } from '../utils/index.js';

interface GenerateOptions {
  claude?: boolean;
  cursor?: boolean;
  copilot?: boolean;
  gemini?: boolean;
  aider?: boolean;
  codeium?: boolean;
  tabnine?: boolean;
  codewhisperer?: boolean;
  agents?: boolean;
  all?: boolean;
  stack?: string;
  variant?: string;
}

const TOOL_CONFIGS: Record<string, { files: string[]; mainFile: string; sourceFile: string }> = {
  claude: {
    files: ['.claude/CLAUDE.md', '.claude/skills/core-spec.md', '.claude/skills/security.md', '.claude/skills/testing.md'],
    mainFile: '.claude/CLAUDE.md',
    sourceFile: 'CLAUDE.md'
  },
  cursor: {
    files: ['.cursorrules', '.cursor/rules/core.mdc', '.cursor/rules/security.mdc', '.cursor/rules/testing.mdc'],
    mainFile: '.cursorrules',
    sourceFile: 'CURSOR.md'
  },
  copilot: {
    files: ['.github/copilot-instructions.md'],
    mainFile: '.github/copilot-instructions.md',
    sourceFile: 'COPILOT.md'
  },
  gemini: {
    files: ['GEMINI.md'],
    mainFile: 'GEMINI.md',
    sourceFile: 'GEMINI.md'
  },
  aider: {
    files: ['CONVENTIONS.md'],
    mainFile: 'CONVENTIONS.md',
    sourceFile: 'AIDER.md'
  },
  codeium: {
    files: ['.windsurfrules', 'CODEIUM.md'],
    mainFile: '.windsurfrules',
    sourceFile: 'CODEIUM.md'
  },
  tabnine: {
    files: ['TABNINE.md'],
    mainFile: 'TABNINE.md',
    sourceFile: 'TABNINE.md'
  },
  codewhisperer: {
    files: ['CODEWHISPERER.md'],
    mainFile: 'CODEWHISPERER.md',
    sourceFile: 'CODEWHISPERER.md'
  },
  agents: {
    files: ['AGENTS.md'],
    mainFile: 'AGENTS.md',
    sourceFile: 'AGENTS.md'
  }
};

export async function generateCommand(options: GenerateOptions): Promise<void> {
  const spinner = ora('Generating AI assistant configurations...').start();
  
  try {
    const cwd = process.cwd();
    const config = await loadConfig(cwd).catch(() => null);
    
    const requestedTools = options.all 
      ? Object.keys(TOOL_CONFIGS)
      : Object.keys(TOOL_CONFIGS).filter(tool => options[tool as keyof GenerateOptions]);
    
    if (requestedTools.length === 0) {
      spinner.fail(chalk.red('No tools specified. Use --claude, --cursor, --all, etc.'));
      console.log(chalk.dim('\nAvailable tools:'));
      Object.keys(TOOL_CONFIGS).forEach(tool => {
        console.log(chalk.dim(`  --${tool.padEnd(15)} ${getToolFile(tool)}`));
      });
      process.exit(1);
    }
    
    const stack = options.stack || config?.stack;
    const variant = options.variant || config?.variant;
    
    const generated: string[] = [];
    const failed: string[] = [];
    
    for (const tool of requestedTools) {
      try {
        const result = await generateToolConfig(tool, cwd, { stack, variant });
        if (result) {
          generated.push(result);
        }
      } catch (error) {
        failed.push(tool);
        spinner.warn(chalk.yellow(`Failed to generate ${tool}: ${error instanceof Error ? error.message : String(error)}`));
      }
    }
    
    if (failed.length > 0 && failed.length === requestedTools.length) {
      spinner.fail(chalk.red('All generations failed'));
      process.exit(1);
    }
    
    spinner.succeed(chalk.green(`Generated ${generated.length} configuration files`));
    
    console.log(chalk.blue('\n✓ Generated files:'));
    generated.forEach(file => console.log(chalk.dim(`  ${file}`)));
    
    if (failed.length > 0) {
      console.log(chalk.yellow('\n⚠ Failed:'));
      failed.forEach(tool => console.log(chalk.dim(`  ${tool}`)));
    }
    
    console.log(chalk.blue('\n📖 Tool-specific notes:'));
    if (requestedTools.includes('claude')) {
      console.log(chalk.dim('  Claude Code: .claude/ configs are auto-loaded'));
    }
    if (requestedTools.includes('cursor')) {
      console.log(chalk.dim('  Cursor: .cursorrules is read automatically'));
    }
    if (requestedTools.includes('copilot')) {
      console.log(chalk.dim('  Copilot: .github/copilot-instructions.md is auto-read'));
    }
    if (requestedTools.includes('codeium')) {
      console.log(chalk.dim('  Windsurf: .windsurfrules is read by Cascade'));
    }
    
    if (config) {
      const updatedTools = [...new Set([...config.tools, ...requestedTools])];
      config.tools = updatedTools;
      config.updatedAt = new Date().toISOString();
      await fs.writeJson(path.join(cwd, '.fots', 'config.json'), config, { spaces: 2 });
    }
    
  } catch (error) {
    spinner.fail(chalk.red(`Generation failed: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

async function generateToolConfig(
  tool: string, 
  cwd: string, 
  options: { stack?: string; variant?: string }
): Promise<string | null> {
  const toolConfig = TOOL_CONFIGS[tool];
  if (!toolConfig) return null;
  
  const pkgRoot = getPkgRoot();
  const sourcePath = path.join(pkgRoot, toolConfig.sourceFile);
  
  if (!(await fileExists(sourcePath))) {
    throw new Error(`Source file not found: ${toolConfig.sourceFile}`);
  }
  
  let content = await fs.readFile(sourcePath, 'utf8');
  
  if (options.stack) {
    const stackPath = path.join(pkgRoot, 'stacks', `${options.stack}.md`);
    if (await fileExists(stackPath)) {
      const stackContent = await fs.readFile(stackPath, 'utf8');
      content += `\n\n---\n\n# Stack-Specific Rules: ${options.stack}\n\n${stackContent}`;
    }
  }
  
  if (options.variant && options.variant !== 'default') {
    const variantFileName = `${options.variant.toUpperCase().replace(/-/g, '_')}.md`;
    const variantPath = path.join(pkgRoot, 'variants', variantFileName);
    if (await fileExists(variantPath)) {
      const variantContent = await fs.readFile(variantPath, 'utf8');
      content += `\n\n---\n\n${variantContent}`;
    }
  }
  
  const mainDest = path.join(cwd, toolConfig.mainFile);
  await fs.ensureDir(path.dirname(mainDest));
  await fs.writeFile(mainDest, content);
  
  return toolConfig.mainFile;
}

function getToolFile(tool: string): string {
  return TOOL_CONFIGS[tool]?.mainFile || tool;
}
