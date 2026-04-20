import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';
import { getPkgRoot, fileExists, loadConfig } from '../utils/index.js';

interface TemplateOptions {
  framework: string;
  output: string;
  stack?: string;
  variant?: string;
  install?: boolean;
}

const FRAMEWORK_CONFIGS: Record<string, { 
  name: string; 
  defaultStack: string;
  packageManager: string;
  installCommand: string;
  devCommand: string;
}> = {
  nextjs: {
    name: 'Next.js Full Stack',
    defaultStack: 'typescript',
    packageManager: 'npm',
    installCommand: 'npm install',
    devCommand: 'npm run dev'
  },
  django: {
    name: 'Django REST API',
    defaultStack: 'python',
    packageManager: 'pip',
    installCommand: 'pip install -r requirements.txt',
    devCommand: 'python manage.py runserver'
  },
  fastapi: {
    name: 'FastAPI + React',
    defaultStack: 'python',
    packageManager: 'pip',
    installCommand: 'pip install -r requirements.txt',
    devCommand: 'uvicorn main:app --reload'
  },
  remix: {
    name: 'Remix + Prisma',
    defaultStack: 'typescript',
    packageManager: 'npm',
    installCommand: 'npm install',
    devCommand: 'npm run dev'
  },
  laravel: {
    name: 'Laravel + Vue',
    defaultStack: 'php',
    packageManager: 'composer',
    installCommand: 'composer install',
    devCommand: 'php artisan serve'
  },
  rails: {
    name: 'Rails + React',
    defaultStack: 'ruby',
    packageManager: 'bundle',
    installCommand: 'bundle install',
    devCommand: 'rails server'
  },
  astro: {
    name: 'Astro SSR',
    defaultStack: 'typescript',
    packageManager: 'npm',
    installCommand: 'npm install',
    devCommand: 'npm run dev'
  }
};

export async function templateCommand(options: TemplateOptions): Promise<void> {
  const spinner = ora(`Preparing ${options.framework} template...`).start();
  
  try {
    const pkgRoot = getPkgRoot();
    const frameworkKey = options.framework.toLowerCase();
    const frameworkConfig = FRAMEWORK_CONFIGS[frameworkKey];
    
    if (!frameworkConfig) {
      const available = Object.keys(FRAMEWORK_CONFIGS);
      spinner.fail(chalk.red(`Unknown framework: ${options.framework}`));
      console.log(chalk.dim(`\nAvailable frameworks:`));
      available.forEach(f => {
        console.log(chalk.dim(`  ${f.padEnd(10)} ${FRAMEWORK_CONFIGS[f].name}`));
      });
      process.exit(1);
    }
    
    const templateDir = path.join(pkgRoot, 'templates', 'frameworks', `${frameworkKey}-fullstack`);
    const outputDir = path.resolve(options.output);
    
    if (!(await fileExists(templateDir))) {
      spinner.fail(chalk.red(`Template not found: ${templateDir}`));
      console.log(chalk.dim('This framework is planned but not yet implemented.'));
      console.log(chalk.dim('Available templates:'));
      
      const templatesRoot = path.join(pkgRoot, 'templates', 'frameworks');
      if (await fileExists(templatesRoot)) {
        const dirs = await fs.readdir(templatesRoot);
        dirs.filter(d => !d.startsWith('.')).forEach(d => {
          console.log(chalk.dim(`  - ${d.replace('-fullstack', '')}`));
        });
      }
      process.exit(1);
    }
    
    if (await fileExists(outputDir)) {
      const files = await fs.readdir(outputDir);
      if (files.length > 0) {
        spinner.stop();
        console.log(chalk.yellow(`\n⚠ Output directory is not empty: ${outputDir}`));
        console.log(chalk.dim('Files in directory: ' + files.slice(0, 5).join(', ') + (files.length > 5 ? ` and ${files.length - 5} more` : '')));
        
        const { overwrite } = await inquirer.prompt([{
          type: 'confirm',
          name: 'overwrite',
          message: 'Continue anyway? (may overwrite files)',
          default: false
        }]);
        
        if (!overwrite) {
          console.log(chalk.yellow('Cancelled'));
          process.exit(0);
        }
        spinner.start();
      }
    }
    
    await fs.ensureDir(outputDir);
    
    spinner.text = 'Copying template files...';
    await fs.copy(templateDir, outputDir, {
      filter: (src) => {
        const relative = path.relative(templateDir, src);
        return !relative.includes('node_modules') && 
               !relative.includes('.git') && 
               !relative.includes('dist') &&
               !relative.includes('build');
      }
    });
    
    spinner.text = 'Customizing template...';
    
    const stack = options.stack || frameworkConfig.defaultStack;
    const variant = options.variant || 'default';
    
    await customizeTemplate(outputDir, {
      framework: frameworkKey,
      stack,
      variant,
      projectName: path.basename(outputDir)
    });
    
    spinner.succeed(chalk.green(`${frameworkConfig.name} template created!`));
    
    console.log(chalk.blue('\n📁 Project location:'));
    console.log(chalk.dim(`  ${outputDir}`));
    
    console.log(chalk.blue('\n⚙️  Configuration:'));
    console.log(chalk.dim(`  Stack:   ${stack}`));
    console.log(chalk.dim(`  Variant: ${variant}`));
    
    console.log(chalk.blue('\n🚀 Next steps:'));
    console.log(chalk.dim(`  cd ${path.relative(process.cwd(), outputDir)}`));
    
    if (options.install) {
      console.log(chalk.dim(`  ${frameworkConfig.installCommand}  (installing dependencies...)`));
      
      try {
        execSync(frameworkConfig.installCommand, { 
          cwd: outputDir, 
          stdio: 'inherit',
          timeout: 300000
        });
        console.log(chalk.green('\n✓ Dependencies installed'));
      } catch (error) {
        console.log(chalk.yellow('\n⚠ Installation failed, dependencies need manual installation'));
      }
    } else {
      console.log(chalk.dim(`  ${frameworkConfig.installCommand}  # Install dependencies`));
    }
    
    console.log(chalk.dim(`  ${frameworkConfig.devCommand}      # Start development server`));
    
    console.log(chalk.blue('\n📖 Documentation:'));
    console.log(chalk.dim('  README.md in project directory'));
    console.log(chalk.dim('  CLAUDE.md - AI assistant instructions'));
    
  } catch (error) {
    spinner.fail(chalk.red(`Template creation failed: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

async function customizeTemplate(
  outputDir: string, 
  options: { framework: string; stack: string; variant: string; projectName: string }
): Promise<void> {
  const pkgRoot = getPkgRoot();
  
  const claudePath = path.join(outputDir, 'CLAUDE.md');
  if (await fileExists(claudePath)) {
    let content = await fs.readFile(claudePath, 'utf8');
    
    content = content.replace(/\{\{PROJECT_NAME\}\}/g, options.projectName);
    content = content.replace(/\{\{FRAMEWORK\}\}/g, options.framework);
    
    const stackPath = path.join(pkgRoot, 'stacks', `${options.stack}.md`);
    if (await fileExists(stackPath)) {
      const stackContent = await fs.readFile(stackPath, 'utf8');
      if (!content.includes('Stack-Specific Rules')) {
        content += `\n\n---\n\n${stackContent}`;
      }
    }
    
    if (options.variant !== 'default') {
      const variantFileName = `${options.variant.toUpperCase().replace(/-/g, '_')}.md`;
      const variantPath = path.join(pkgRoot, 'variants', variantFileName);
      if (await fileExists(variantPath)) {
        const variantContent = await fs.readFile(variantPath, 'utf8');
        if (!content.includes(options.variant)) {
          content += `\n\n---\n\n${variantContent}`;
        }
      }
    }
    
    await fs.writeFile(claudePath, content);
  }
  
  const packageJsonPath = path.join(outputDir, 'package.json');
  if (await fileExists(packageJsonPath)) {
    const pkg = await fs.readJson(packageJsonPath);
    pkg.name = options.projectName;
    await fs.writeJson(packageJsonPath, pkg, { spaces: 2 });
  }
  
  const readmePath = path.join(outputDir, 'README.md');
  if (await fileExists(readmePath)) {
    let content = await fs.readFile(readmePath, 'utf8');
    content = content.replace(/\{\{PROJECT_NAME\}\}/g, options.projectName);
    await fs.writeFile(readmePath, content);
  }
}

import inquirer from 'inquirer';
