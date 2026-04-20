import * as vscode from 'vscode';
import { FotsValidator } from './validator';
import { FotsStatusBar } from './statusBar';
import { FotsDiagnostics } from './diagnostics';

export class FotsCommands {
  constructor(
    private validator: FotsValidator,
    private statusBar: FotsStatusBar,
    private diagnostics: FotsDiagnostics
  ) {}

  async validateCurrentFile(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor');
      return;
    }

    const doc = editor.document;
    const result = await this.validator.validateDocument(doc);

    if (result.violations.length === 0) {
      vscode.window.showInformationMessage('✓ File passes FOTS validation');
    } else {
      const errors = result.violations.filter(v => v.severity === 'error').length;
      const warnings = result.violations.filter(v => v.severity === 'warning').length;
      
      vscode.window.showWarningMessage(
        `Found ${errors} errors, ${warnings} warnings`,
        'Show Details'
      ).then(selection => {
        if (selection === 'Show Details') {
          this.showValidationDetails(result);
        }
      });
    }

    this.diagnostics.updateDiagnostics(doc, result.violations);
  }

  async validateWorkspace(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showWarningMessage('No workspace open');
      return;
    }

    const progress = await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Validating workspace...',
      cancellable: true
    }, async (progress, token) => {
      const files = await vscode.workspace.findFiles(
        'src/**/*.{ts,js,py,go,rs,java,kt,cs,rb,php,swift,dart,cpp,c,sql}',
        '**/node_modules/**'
      );

      let processed = 0;
      const results = [];

      for (const file of files) {
        if (token.isCancellationRequested) break;
        
        try {
          const doc = await vscode.workspace.openTextDocument(file);
          const result = await this.validator.validateDocument(doc);
          if (result.violations.length > 0) {
            results.push({ file: file.fsPath, violations: result.violations });
          }
        } catch {
          // Skip files that can't be opened
        }

        processed++;
        progress.report({ 
          increment: 100 / files.length,
          message: `${processed}/${files.length} files`
        });
      }

      return results;
    });

    const totalViolations = progress.reduce((sum, r) => sum + r.violations.length, 0);
    
    if (totalViolations === 0) {
      vscode.window.showInformationMessage('✓ Workspace passes FOTS validation');
    } else {
      vscode.window.showWarningMessage(
        `Found ${totalViolations} violations in ${progress.length} files`,
        'View Report'
      );
    }
  }

  async insertSummary(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const summaryBlock = `SUMMARY:
- What changed:
- Why:
- Verified:
- Assumptions:
- Risks:
`;

    const position = editor.selection.active;
    await editor.edit(editBuilder => {
      editBuilder.insert(position, summaryBlock);
    });

    vscode.window.showInformationMessage('SUMMARY block inserted');
  }

  async insertAssumptions(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const assumptionsBlock = `ASSUMPTIONS:
- 
`;

    const position = editor.selection.active;
    await editor.edit(editBuilder => {
      editBuilder.insert(position, assumptionsBlock);
    });

    vscode.window.showInformationMessage('ASSUMPTIONS block inserted');
  }

  async insertSecurityNote(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const securityBlock = `SECURITY NOTE:
- Boundary affected:
- Attack vectors considered:
- Mitigations applied:
`;

    const position = editor.selection.active;
    await editor.edit(editBuilder => {
      editBuilder.insert(position, securityBlock);
    });

    vscode.window.showInformationMessage('SECURITY NOTE block inserted');
  }

  async checkUpdates(): Promise<void> {
    vscode.window.showInformationMessage(
      'Checking for FOTS updates...',
      'Check CLI'
    ).then(selection => {
      if (selection === 'Check CLI') {
        const terminal = vscode.window.createTerminal('FOTS Update');
        terminal.sendText('fots update --check');
        terminal.show();
      }
    });
  }

  async showStatus(): Promise<void> {
    const config = await this.getFotsConfig();
    
    if (!config) {
      vscode.window.showWarningMessage('FOTS not initialized in this workspace');
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'fotsStatus',
      'FOTS Status',
      vscode.ViewColumn.One,
      {}
    );

    panel.webview.html = this.getStatusHtml(config);
  }

  async initFots(): Promise<void> {
    const terminal = vscode.window.createTerminal('FOTS Init');
    terminal.sendText('fots init');
    terminal.show();
  }

  private showValidationDetails(result: any): void {
    const panel = vscode.window.createWebviewPanel(
      'fotsValidation',
      'FOTS Validation Results',
      vscode.ViewColumn.Two,
      {}
    );

    let html = '<h2>Validation Results</h2>';
    
    for (const violation of result.violations) {
      const color = violation.severity === 'error' ? '#f14c4c' : 
                    violation.severity === 'warning' ? '#cca700' : '#3794ff';
      
      html += `
        <div style="margin: 10px 0; padding: 10px; border-left: 4px solid ${color};">
          <strong style="color: ${color};">[${violation.severity.toUpperCase()}]</strong> ${violation.rule}
          <p>${violation.message}</p>
        </div>
      `;
    }

    panel.webview.html = html;
  }

  private async getFotsConfig(): Promise<any | null> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return null;

    for (const folder of workspaceFolders) {
      const configUri = vscode.Uri.joinPath(folder.uri, '.fots', 'config.json');
      try {
        const data = await vscode.workspace.fs.readFile(configUri);
        return JSON.parse(data.toString());
      } catch {
        continue;
      }
    }

    return null;
  }

  private getStatusHtml(config: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: var(--vscode-font-family); padding: 20px; }
          h1 { color: var(--vscode-foreground); }
          .section { margin: 20px 0; }
          .label { font-weight: bold; color: var(--vscode-descriptionForeground); }
          .value { color: var(--vscode-foreground); }
        </style>
      </head>
      <body>
        <h1>FOTS Status</h1>
        <div class="section">
          <span class="label">Version:</span> <span class="value">${config.version}</span>
        </div>
        <div class="section">
          <span class="label">Stack:</span> <span class="value">${config.stack}</span>
        </div>
        <div class="section">
          <span class="label">Variant:</span> <span class="value">${config.variant}</span>
        </div>
        <div class="section">
          <span class="label">Tools:</span> <span class="value">${config.tools?.join(', ') || 'none'}</span>
        </div>
      </body>
      </html>
    `;
  }
}
