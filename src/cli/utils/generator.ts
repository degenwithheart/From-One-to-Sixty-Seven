import fs from 'fs-extra';
import path from 'path';
import { getPkgRoot, fileExists } from './index.js';

interface GenerateOptions {
  tools: string[];
  stack?: string;
  variant?: string;
}

const TOOL_CONFIGS: Record<string, { 
  files: string[]; 
  mainFile: string; 
  sourceFile: string;
}> = {
  claude: {
    files: ['.claude/CLAUDE.md'],
    mainFile: '.claude/CLAUDE.md',
    sourceFile: 'CLAUDE.md'
  },
  cursor: {
    files: ['.cursorrules'],
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
    files: ['.windsurfrules'],
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

export async function generateConfigs(cwd: string, options: GenerateOptions): Promise<string[]> {
  const generated: string[] = [];
  
  for (const tool of options.tools) {
    const result = await generateToolConfig(tool, cwd, options);
    if (result) {
      generated.push(result);
    }
  }
  
  return generated;
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
