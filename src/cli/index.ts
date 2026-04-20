#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { generateCommand } from './commands/generate.js';
import { validateCommand } from './commands/validate.js';
import { updateCommand } from './commands/update.js';
import { templateCommand } from './commands/template.js';
import { listCommand } from './commands/list.js';

program
  .name('fots')
  .description('From One to Sixty-Seven — AI coding assistant spec management')
  .version('2.0.0');

program
  .command('init')
  .description('Initialize project with FOTS spec')
  .option('-s, --stack <stack>', 'Tech stack (e.g., typescript, python, go)')
  .option('-v, --variant <variant>', 'Environment variant (e.g., lean-startup, enterprise)')
  .option('-t, --tools <tools>', 'Comma-separated list of AI tools (claude,cursor,copilot)')
  .option('--dry-run', 'Show what would be created without making changes')
  .option('--yes', 'Skip prompts and use defaults')
  .action(initCommand);

program
  .command('generate')
  .description('Generate AI assistant configuration files')
  .option('--claude', 'Generate Claude Code config')
  .option('--cursor', 'Generate Cursor config')
  .option('--copilot', 'Generate GitHub Copilot config')
  .option('--gemini', 'Generate Gemini config')
  .option('--aider', 'Generate Aider config')
  .option('--codeium', 'Generate Codeium/Windsurf config')
  .option('--tabnine', 'Generate Tabnine config')
  .option('--codewhisperer', 'Generate CodeWhisperer config')
  .option('--agents', 'Generate AGENTS.md for OpenAI/Codex')
  .option('--all', 'Generate all configs')
  .option('--stack <stack>', 'Include stack-specific rules')
  .option('--variant <variant>', 'Include variant-specific rules')
  .action(generateCommand);

program
  .command('validate [files...]')
  .description('Validate code compliance with FOTS spec')
  .option('--rules <rules>', 'Rules to check (summary,assumptions,security,tests)', 'summary,assumptions,security')
  .option('--diff <commit>', 'Validate PR diff against commit')
  .option('--staged', 'Validate staged files only')
  .option('--format <format>', 'Output format (pretty,json,github,sarif)', 'pretty')
  .option('--fail-on-violation', 'Exit with error code if violations found', true)
  .option('--fix', 'Auto-fix violations where possible')
  .action(validateCommand);

program
  .command('update')
  .description('Check for and apply FOTS spec updates')
  .option('--check', 'Check for available updates (default)')
  .option('--apply', 'Apply available updates')
  .option('--force', 'Force update even if no version change')
  .action(updateCommand);

program
  .command('template')
  .description('Generate framework-specific project template')
  .requiredOption('-f, --framework <framework>', 'Framework (nextjs, django, fastapi, remix, laravel, rails, astro)')
  .requiredOption('-o, --output <dir>', 'Output directory')
  .option('--stack <stack>', 'Tech stack override')
  .option('--variant <variant>', 'Variant override')
  .option('--install', 'Run package install after creation')
  .action(templateCommand);

program
  .command('list')
  .description('List available stacks, variants, frameworks, and tools')
  .option('--stacks', 'List available tech stacks')
  .option('--variants', 'List environment variants')
  .option('--frameworks', 'List framework templates')
  .option('--tools', 'List supported AI tools')
  .option('--installed', 'Show currently installed FOTS configuration')
  .action(listCommand);

program
  .command('status')
  .description('Show FOTS installation status and health check')
  .action(async () => {
    const { statusCommand } = await import('./commands/status.js');
    await statusCommand();
  });

program
  .command('doctor')
  .description('Diagnose and fix common FOTS configuration issues')
  .option('--fix', 'Attempt to fix issues automatically')
  .action(async (options) => {
    const { doctorCommand } = await import('./commands/doctor.js');
    await doctorCommand(options);
  });

export function runCLI(): void {
  program.parse();
}

// Entry point for direct execution
runCLI();
