import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { 
  SUPPORTED_STACKS, 
  SUPPORTED_VARIANTS, 
  SUPPORTED_TOOLS,
  getPkgRoot,
  loadConfig,
  saveConfig,
  detectStack,
  fileExists
} from '../utils/index.js';

interface InitOptions {
  stack?: string;
  variant?: string;
  tools?: string;
  dryRun?: boolean;
  yes?: boolean;
}

interface FotsConfig {
  version: string;
  stack: string;
  variant: string;
  tools: string[];
  createdAt: string;
  updatedAt: string;
  settings: {
    enforceSummary: boolean;
    enforceAssumptions: boolean;
    maxChangeSize: number;
  };
}

export async function initCommand(options: InitOptions): Promise<void> {
  const spinner = ora('Initializing FOTS spec...').start();
  
  try {
    const cwd = process.cwd();
    const fotsDir = path.join(cwd, '.fots');
    
    if (!options.dryRun) {
      await fs.ensureDir(fotsDir);
    }
    
    const existingConfig = await loadConfig(cwd).catch(() => null);
    if (existingConfig && !options.yes) {
      spinner.stop();
      const { overwrite } = await inquirer.prompt([{
        type: 'confirm',
        name: 'overwrite',
        message: 'FOTS is already initialized. Overwrite existing configuration?',
        default: false
      }]);
      if (!overwrite) {
        console.log(chalk.yellow('Initialization cancelled.'));
        return;
      }
      spinner.start();
    }
    
    let stack = options.stack;
    let variant = options.variant;
    let tools: string[] = options.tools ? options.tools.split(',').map(t => t.trim()) : [];
    
    if (!stack && !options.yes) {
      spinner.stop();
      const detected = await detectStack(cwd);
      
      const { stack: selectedStack } = await inquirer.prompt([{
        type: 'list',
        name: 'stack',
        message: 'Select your tech stack:',
        default: detected || 'typescript',
        choices: [
          new inquirer.Separator('Auto-detected'),
          ...(detected ? [{ name: `${detected} (detected)`, value: detected }] : []),
          new inquirer.Separator('All stacks'),
          ...SUPPORTED_STACKS.map(s => ({ name: s, value: s }))
        ]
      }]);
      stack = selectedStack;
      spinner.start();
    } else if (!stack) {
      stack = await detectStack(cwd) || 'typescript';
    }
    
    // Ensure stack is defined
    stack = stack || 'typescript';
    
    if (stack && !SUPPORTED_STACKS.includes(stack)) {
      spinner.fail(chalk.red(`Unsupported stack: ${stack}`));
      console.log(chalk.dim(`Supported stacks: ${SUPPORTED_STACKS.join(', ')}`));
      process.exit(1);
    }
    
    if (!variant && !options.yes) {
      spinner.stop();
      const { variant: selectedVariant } = await inquirer.prompt([{
        type: 'list',
        name: 'variant',
        message: 'Select environment variant:',
        choices: [
          { name: 'default (balanced for most projects)', value: 'default' },
          new inquirer.Separator('Specialized variants'),
          ...SUPPORTED_VARIANTS.map(v => ({ 
            name: `${v} (${getVariantDescription(v)})`, 
            value: v 
          }))
        ]
      }]);
      variant = selectedVariant;
      spinner.start();
    }
    
    variant = variant || 'default';
    
    // Ensure variant is defined
    variant = variant || 'default';
    
    if (variant !== 'default' && !SUPPORTED_VARIANTS.includes(variant)) {
      spinner.fail(chalk.red(`Unsupported variant: ${variant}`));
      process.exit(1);
    }
    
    if (tools.length === 0 && !options.yes) {
      spinner.stop();
      const { selectedTools } = await inquirer.prompt([{
        type: 'checkbox',
        name: 'selectedTools',
        message: 'Select AI assistants to configure:',
        choices: SUPPORTED_TOOLS.map(t => ({
          name: `${t} (${getToolDescription(t)})`,
          value: t,
          checked: ['claude', 'cursor', 'copilot'].includes(t)
        }))
      }]);
      tools = selectedTools;
      spinner.start();
    }
    
    const invalidTools = tools.filter(t => !SUPPORTED_TOOLS.includes(t));
    if (invalidTools.length > 0) {
      spinner.fail(chalk.red(`Unsupported tools: ${invalidTools.join(', ')}`));
      process.exit(1);
    }
    
    // Ensure values are defined before creating config
    const finalStack = stack || 'typescript';
    const finalVariant = variant || 'default';
    
    const config: FotsConfig = {
      version: '2.0.0',
      stack: finalStack,
      variant: finalVariant,
      tools,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        enforceSummary: true,
        enforceAssumptions: finalVariant === 'enterprise' || finalVariant === 'security-hardened',
        maxChangeSize: finalVariant === 'lean-startup' ? 500 : 200
      }
    };
    
    const filesToCreate = [
      { path: path.join(fotsDir, 'config.json'), content: JSON.stringify(config, null, 2) },
      { path: path.join(fotsDir, 'stacks', `${finalStack}.md`), source: path.join(getPkgRoot(), 'stacks', `${finalStack}.md`) }
    ];
    
    if (finalVariant !== 'default') {
      const variantFileName = `${finalVariant.toUpperCase().replace(/-/g, '_')}.md`;
      filesToCreate.push({
        path: path.join(fotsDir, 'variants', `${finalVariant}.md`),
        source: path.join(getPkgRoot(), 'variants', variantFileName)
      });
    }
    
    if (options.dryRun) {
      spinner.stop();
      console.log(chalk.blue('\n[DRY RUN] Would create the following:'));
      console.log(chalk.dim('Directories:'));
      console.log(chalk.dim(`  - .fots/`));
      console.log(chalk.dim(`  - .fots/stacks/`));
      if (variant !== 'default') console.log(chalk.dim(`  - .fots/variants/`));
      
      console.log(chalk.dim('\nFiles:'));
      filesToCreate.forEach(f => console.log(chalk.dim(`  - ${path.relative(cwd, f.path)}`)));
      
      if (tools.length > 0) {
        console.log(chalk.dim('\nTool configs that would be generated with `fots generate`'));
      }
      
      console.log(chalk.green('\nConfiguration:'));
      console.log(config);
      return;
    }
    
    await fs.writeJson(path.join(fotsDir, 'config.json'), config, { spaces: 2 });
    
    for (const file of filesToCreate) {
      if ('source' in file && file.source) {
        if (await fileExists(file.source)) {
          await fs.ensureDir(path.dirname(file.path));
          await fs.copy(file.source, file.path);
        }
      }
    }
    
    if (tools.length > 0) {
      spinner.text = 'Generating tool configurations...';
      const { generateConfigs } = await import('../utils/generator.js');
      await generateConfigs(cwd, { tools, stack, variant });
    }
    
    spinner.succeed(chalk.green('FOTS spec initialized successfully!'));
    
    console.log(chalk.blue('\n📋 Configuration:'));
    console.log(chalk.dim(`  Stack:    ${stack}`));
    console.log(chalk.dim(`  Variant:  ${variant}`));
    console.log(chalk.dim(`  Tools:    ${tools.length > 0 ? tools.join(', ') : 'none'}`));
    
    console.log(chalk.blue('\n🚀 Next steps:'));
    if (tools.length === 0) {
      console.log(chalk.dim('  fots generate --all          # Generate all AI assistant configs'));
    }
    console.log(chalk.dim('  fots validate                # Validate code compliance'));
    console.log(chalk.dim('  fots template -f nextjs -o . # Use a framework template'));
    
    console.log(chalk.dim(`\n📁 Config saved to: .fots/config.json`));
    
  } catch (error) {
    spinner.fail(chalk.red(`Initialization failed: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

function getVariantDescription(variant: string): string {
  const descriptions: Record<string, string> = {
    'enterprise': 'regulated environments, strict processes',
    'lean-startup': 'rapid iteration, minimal overhead',
    'security-hardened': 'security-critical systems',
    'test-first': 'strict TDD requirements',
    'monorepo': 'multi-package repositories'
  };
  return descriptions[variant] || '';
}

function getToolDescription(tool: string): string {
  const descriptions: Record<string, string> = {
    'claude': 'Claude Code',
    'cursor': 'Cursor AI',
    'copilot': 'GitHub Copilot',
    'gemini': 'Google Gemini',
    'aider': 'Aider CLI',
    'codeium': 'Codeium/Windsurf',
    'tabnine': 'Tabnine',
    'codewhisperer': 'Amazon Q/CodeWhisperer',
    'agents': 'OpenAI/Codex/Generic'
  };
  return descriptions[tool] || tool;
}
