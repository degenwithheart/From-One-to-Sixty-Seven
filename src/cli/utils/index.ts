import fs from 'fs-extra';
import path from 'path';

export const SUPPORTED_STACKS = [
  'python', 'typescript', 'go', 'rust', 'java', 'kotlin', 'csharp', 
  'ruby', 'php', 'swift', 'dart', 'cpp', 'sql', 'terraform', 'docker', 'shell'
];

export const SUPPORTED_VARIANTS = [
  'enterprise', 'lean-startup', 'security-hardened', 'test-first', 'monorepo'
];

export const SUPPORTED_TOOLS = [
  'claude', 'cursor', 'copilot', 'gemini', 'aider', 'codeium', 'tabnine', 'codewhisperer', 'agents'
];

export interface FotsConfig {
  version: string;
  stack: string;
  variant: string;
  tools: string[];
  createdAt: string;
  updatedAt: string;
  settings?: {
    enforceSummary: boolean;
    enforceAssumptions: boolean;
    maxChangeSize: number;
  };
}

export function getPkgRoot(): string {
  // Try to find package root by looking for package.json
  let currentDir = process.cwd();
  
  // First check if we're in a development environment (src/cli/utils)
  const devPath = path.join(currentDir, 'src', 'cli', 'utils');
  if (fs.existsSync(path.join(currentDir, 'package.json')) && 
      fs.existsSync(path.join(currentDir, 'CLAUDE.md'))) {
    return currentDir;
  }
  
  // Check if we're in dist (production)
  if (currentDir.includes('dist')) {
    return path.resolve(currentDir, '../../..');
  }
  
  // Default to current working directory
  return currentDir;
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function loadConfig(cwd: string): Promise<FotsConfig> {
  const configPath = path.join(cwd, '.fots', 'config.json');
  
  if (!(await fileExists(configPath))) {
    throw new Error(`No FOTS configuration found at ${configPath}`);
  }
  
  const config = await fs.readJson(configPath);
  return config as FotsConfig;
}

export async function saveConfig(cwd: string, config: FotsConfig): Promise<void> {
  const configPath = path.join(cwd, '.fots', 'config.json');
  await fs.ensureDir(path.dirname(configPath));
  await fs.writeJson(configPath, config, { spaces: 2 });
}

export async function detectStack(cwd: string): Promise<string | null> {
  const indicators: Record<string, string[]> = {
    python: ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile'],
    typescript: ['tsconfig.json', 'package.json'],
    go: ['go.mod', 'go.sum'],
    rust: ['Cargo.toml', 'Cargo.lock'],
    java: ['pom.xml', 'build.gradle', 'gradlew'],
    kotlin: ['build.gradle.kts'],
    csharp: ['.csproj', '.sln'],
    ruby: ['Gemfile', 'Gemfile.lock'],
    php: ['composer.json', 'composer.lock'],
    swift: ['Package.swift'],
    dart: ['pubspec.yaml'],
    cpp: ['CMakeLists.txt', 'Makefile'],
    docker: ['Dockerfile', 'docker-compose.yml'],
    terraform: ['.tf', 'terraform.tfstate']
  };
  
  for (const [stack, files] of Object.entries(indicators)) {
    for (const file of files) {
      if (await fileExists(path.join(cwd, file))) {
        return stack;
      }
    }
  }
  
  return null;
}

export function getGitRoot(cwd: string): string | null {
  try {
    const { execSync } = require('child_process');
    const result = execSync('git rev-parse --show-toplevel', { 
      cwd, 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return result.trim();
  } catch {
    return null;
  }
}

export function isGitRepo(cwd: string): boolean {
  return getGitRoot(cwd) !== null;
}

/**
 * Get list of files changed in a git diff.
 * 
 * @param diffRef - Git ref to diff against (e.g., 'HEAD~1', 'main')
 * @returns Array of file paths
 */
export async function getChangedFiles(diffRef: string): Promise<string[]> {
  try {
    const { execSync } = require('child_process');
    const result = execSync(`git diff --name-only ${diffRef}`, {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });
    
    return result
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);
  } catch {
    return [];
  }
}

/**
 * Get list of staged files in git.
 * 
 * @returns Array of file paths
 */
export async function getStagedFiles(): Promise<string[]> {
  try {
    const { execSync } = require('child_process');
    const result = execSync('git diff --cached --name-only', {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });
    
    return result
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);
  } catch {
    return [];
  }
}
