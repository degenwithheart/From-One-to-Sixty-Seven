import * as vscode from 'vscode';
import { FotsValidator } from './validator';
import { FotsStatusBar } from './statusBar';
import { FotsCommands } from './commands';
import { FotsDiagnostics } from './diagnostics';

let validator: FotsValidator;
let statusBar: FotsStatusBar;
let diagnostics: FotsDiagnostics;

export function activate(context: vscode.ExtensionContext) {
  console.log('FOTS extension is now active');

  validator = new FotsValidator();
  statusBar = new FotsStatusBar();
  diagnostics = new FotsDiagnostics();

  const commands = new FotsCommands(validator, statusBar, diagnostics);

  context.subscriptions.push(
    vscode.commands.registerCommand('fots.validate', () => commands.validateCurrentFile()),
    vscode.commands.registerCommand('fots.validateWorkspace', () => commands.validateWorkspace()),
    vscode.commands.registerCommand('fots.insertSummary', () => commands.insertSummary()),
    vscode.commands.registerCommand('fots.insertAssumptions', () => commands.insertAssumptions()),
    vscode.commands.registerCommand('fots.insertSecurityNote', () => commands.insertSecurityNote()),
    vscode.commands.registerCommand('fots.checkUpdates', () => commands.checkUpdates()),
    vscode.commands.registerCommand('fots.showStatus', () => commands.showStatus()),
    vscode.commands.registerCommand('fots.init', () => commands.initFots())
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (isCodeFile(doc)) {
        diagnostics.validateDocument(doc);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => {
      if (isCodeFile(doc)) {
        diagnostics.validateDocument(doc);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('fots')) {
        diagnostics.refresh();
      }
    })
  );

  statusBar.show();

  checkForFotsInstallation();
}

export function deactivate() {
  validator?.dispose();
  statusBar?.dispose();
  diagnostics?.dispose();
}

function isCodeFile(doc: vscode.TextDocument): boolean {
  const codeLanguages = [
    'typescript', 'javascript', 'python', 'go', 'rust', 
    'java', 'kotlin', 'csharp', 'ruby', 'php', 'swift', 
    'dart', 'cpp', 'c', 'sql'
  ];
  return codeLanguages.includes(doc.languageId);
}

async function checkForFotsInstallation(): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) return;

  for (const folder of workspaceFolders) {
    const fotsConfig = vscode.Uri.joinPath(folder.uri, '.fots', 'config.json');
    try {
      await vscode.workspace.fs.stat(fotsConfig);
      return;
    } catch {
      // Config doesn't exist
    }
  }

  const init = await vscode.window.showInformationMessage(
    'FOTS is not initialized in this workspace. Initialize now?',
    'Initialize',
    'Later'
  );

  if (init === 'Initialize') {
    vscode.commands.executeCommand('fots.init');
  }
}
