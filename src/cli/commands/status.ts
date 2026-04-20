import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { loadConfig, getPkgRoot, fileExists } from '../utils/index.js';

export async function statusCommand(): Promise<void> {
  console.log(chalk.blue('🔍 FOTS Status Report\n'));
  
  const cwd = process.cwd();
  const pkgRoot = getPkgRoot();
  
  console.log(chalk.dim('Project: ') + cwd);
  console.log(chalk.dim('FOTS Root: ') + pkgRoot);
  
  const fotsDir = path.join(cwd, '.fots');
  const configPath = path.join(fotsDir, 'config.json');
  
  const hasFotsDir = await fileExists(fotsDir);
  const hasConfig = await fileExists(configPath);
  
  console.log(chalk.blue('\n📦 Installation Status'));
  
  if (!hasFotsDir && !hasConfig) {
    console.log(chalk.yellow('  ⚠ Not initialized'));
    console.log(chalk.dim('    Run `fots init` to set up'));
    return;
  }
  
  if (hasFotsDir) {
    console.log(chalk.green('  ✓ .fots/ directory exists'));
  }
  
  if (hasConfig) {
    console.log(chalk.green('  ✓ Configuration file exists'));
    
    try {
      const config = await loadConfig(cwd);
      
      console.log(chalk.blue('\n⚙️  Configuration'));
      console.log(`  Version:  ${config.version}`);
      console.log(`  Stack:    ${chalk.green(config.stack)}`);
      console.log(`  Variant:  ${chalk.yellow(config.variant)}`);
      console.log(`  Tools:    ${config.tools.length > 0 ? config.tools.join(', ') : 'none'}`);
      
      if (config.updatedAt) {
        const updated = new Date(config.updatedAt);
        const daysSince = Math.floor((Date.now() - updated.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`  Updated:  ${daysSince === 0 ? 'today' : `${daysSince} days ago`}`);
      }
      
    } catch (error) {
      console.log(chalk.red(`  ✗ Invalid configuration: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
  
  console.log(chalk.blue('\n🤖 AI Assistant Configs'));
  
  const toolConfigs = [
    { name: 'Claude', file: '.claude/CLAUDE.md' },
    { name: 'Cursor', file: '.cursorrules' },
    { name: 'Copilot', file: '.github/copilot-instructions.md' },
    { name: 'Gemini', file: 'GEMINI.md' },
    { name: 'Aider', file: 'CONVENTIONS.md' },
    { name: 'Codeium', file: '.windsurfrules' },
    { name: 'Tabnine', file: 'TABNINE.md' },
    { name: 'CodeWhisperer', file: 'CODEWHISPERER.md' },
    { name: 'Agents', file: 'AGENTS.md' }
  ];
  
  let installedCount = 0;
  for (const tool of toolConfigs) {
    const toolPath = path.join(cwd, tool.file);
    const exists = await fileExists(toolPath);
    const status = exists ? chalk.green('✓') : chalk.dim('✗');
    console.log(`  ${status} ${tool.name.padEnd(15)} ${chalk.dim(tool.file)}`);
    if (exists) installedCount++;
  }
  
  console.log(chalk.dim(`\n  ${installedCount}/${toolConfigs.length} AI assistants configured`));
  
  console.log(chalk.blue('\n📋 Spec Files'));
  
  const specDirs = [
    { name: 'Stacks', path: path.join(fotsDir, 'stacks') },
    { name: 'Variants', path: path.join(fotsDir, 'variants') }
  ];
  
  for (const dir of specDirs) {
    if (await fileExists(dir.path)) {
      const files = await fs.readdir(dir.path).catch(() => []);
      const mdFiles = files.filter((f: string) => f.endsWith('.md'));
      console.log(`  ${chalk.green('✓')} ${dir.name.padEnd(12)} ${chalk.dim(`${mdFiles.length} files`)}`);
    } else {
      console.log(`  ${chalk.dim('✗')} ${dir.name.padEnd(12)} ${chalk.dim('not installed')}`);
    }
  }
  
  console.log(chalk.blue('\n🚀 Next Steps'));
  
  if (installedCount === 0) {
    console.log(chalk.dim('  fots generate --all          # Generate all AI configs'));
  }
  
  if (!hasConfig) {
    console.log(chalk.dim('  fots init                    # Initialize FOTS'));
  }
  
  console.log(chalk.dim('  fots validate                # Check compliance'));
  console.log(chalk.dim('  fots update --check          # Check for updates'));
  
  console.log();
}
