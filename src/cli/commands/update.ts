import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import semver from 'semver';
import { loadConfig, saveConfig, getPkgRoot } from '../utils/index.js';

interface UpdateOptions {
  check?: boolean;
  apply?: boolean;
  force?: boolean;
}

const GITHUB_REPO = 'degenwithheart/llm-engineering-spec';
const NPM_PACKAGE = 'from-one-to-sixty-seven';

export async function updateCommand(options: UpdateOptions): Promise<void> {
  const spinner = ora('Checking for updates...').start();
  
  try {
    const cwd = process.cwd();
    const config = await loadConfig(cwd).catch(() => null);
    
    if (!config) {
      spinner.fail(chalk.red('No FOTS configuration found. Run `fots init` first.'));
      process.exit(1);
    }
    
    const currentVersion = config.version || '2.0.0';
    
    let latestVersion: string;
    let releaseInfo: any = null;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}`);
      }
      
      releaseInfo = await response.json();
      latestVersion = releaseInfo.tag_name?.replace(/^v/, '') || '2.0.0';
    } catch (error) {
      spinner.warn(chalk.yellow('Could not check remote version, using local package version'));
      
      const pkgPath = path.join(getPkgRoot(), 'package.json');
      if (await fs.pathExists(pkgPath)) {
        const pkg = await fs.readJson(pkgPath);
        latestVersion = pkg.version || '2.0.0';
      } else {
        latestVersion = currentVersion;
      }
    }
    
    const comparison = semver.compare(latestVersion, currentVersion);
    const hasUpdate = comparison > 0;
    const isDowngrade = comparison < 0;
    
    if (!hasUpdate && !options.force && !isDowngrade) {
      spinner.succeed(chalk.green(`FOTS is up to date (${currentVersion})`));
      
      if (releaseInfo?.html_url) {
        console.log(chalk.dim(`\nRelease notes: ${releaseInfo.html_url}`));
      }
      return;
    }
    
    if (isDowngrade && !options.force) {
      spinner.warn(chalk.yellow(`Local version (${currentVersion}) is newer than remote (${latestVersion})`));
      console.log(chalk.dim('Use --force to downgrade anyway'));
      return;
    }
    
    spinner.stop();
    
    if (hasUpdate) {
      console.log(chalk.blue(`\n📦 Update available: ${chalk.strikethrough(currentVersion)} → ${chalk.green(latestVersion)}`));
    } else if (options.force) {
      console.log(chalk.blue(`\n📦 Forcing update to: ${latestVersion}`));
    }
    
    if (releaseInfo?.body) {
      console.log(chalk.dim('\nRelease highlights:'));
      const highlights = releaseInfo.body
        .split('\n')
        .filter((line: string) => line.startsWith('- ') || line.startsWith('* '))
        .slice(0, 5);
      highlights.forEach((line: string) => console.log(chalk.dim(`  ${line}`)));
    }
    
    if (!options.apply) {
      console.log(chalk.dim('\nRun with --apply to update your configuration'));
      console.log(chalk.dim('Or visit: https://github.com/' + GITHUB_REPO + '/releases'));
      return;
    }
    
    spinner.start('Applying updates...');
    
    config.version = latestVersion;
    config.updatedAt = new Date().toISOString();
    
    await saveConfig(cwd, config);
    
    try {
      await updateToolConfigs(cwd, config);
    } catch (error) {
      spinner.warn(chalk.yellow('Could not update all tool configurations'));
    }
    
    spinner.succeed(chalk.green(`Updated to v${latestVersion}`));
    
    console.log(chalk.blue('\n📝 What\'s next:'));
    console.log(chalk.dim('  Review CHANGELOG for breaking changes'));
    console.log(chalk.dim('  Run `fots validate` to ensure compliance'));
    console.log(chalk.dim('  Check tool-specific configs for updates'));
    
  } catch (error) {
    spinner.fail(chalk.red(`Update failed: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

async function updateToolConfigs(cwd: string, config: any): Promise<void> {
  const { generateConfigs } = await import('../utils/generator.js');
  
  if (config.tools && config.tools.length > 0) {
    await generateConfigs(cwd, {
      tools: config.tools,
      stack: config.stack,
      variant: config.variant
    });
  }
}
