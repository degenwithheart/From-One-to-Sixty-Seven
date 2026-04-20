#!/usr/bin/env node
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the compiled CLI from dist
const cliPath = path.join(__dirname, '..', 'dist', 'cli', 'index.js');

// Dynamic import to handle ES modules
const { runCLI } = await import(cliPath);

if (runCLI) {
  runCLI();
}
