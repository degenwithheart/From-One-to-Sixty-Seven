import * as vscode from 'vscode';
import { FotsValidator, Violation } from './validator';

export class FotsDiagnostics {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private validator: FotsValidator;

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('fots');
    this.validator = new FotsValidator();
  }

  async validateDocument(doc: vscode.TextDocument): Promise<void> {
    const result = await this.validator.validateDocument(doc);
    this.updateDiagnostics(doc, result.violations);
  }

  updateDiagnostics(doc: vscode.TextDocument, violations: Violation[]): void {
    const diagnostics: vscode.Diagnostic[] = violations.map(v => {
      const range = v.line 
        ? new vscode.Range(v.line - 1, v.column || 0, v.line - 1, 100)
        : new vscode.Range(0, 0, 0, 100);

      const severity = v.severity === 'error' 
        ? vscode.DiagnosticSeverity.Error 
        : v.severity === 'warning'
          ? vscode.DiagnosticSeverity.Warning
          : vscode.DiagnosticSeverity.Information;

      const diagnostic = new vscode.Diagnostic(range, v.message, severity);
      diagnostic.code = v.rule;
      diagnostic.source = 'fots';

      return diagnostic;
    });

    this.diagnosticCollection.set(doc.uri, diagnostics);
  }

  refresh(): void {
    vscode.workspace.textDocuments.forEach(doc => {
      if (this.isCodeFile(doc)) {
        this.validateDocument(doc);
      }
    });
  }

  clear(): void {
    this.diagnosticCollection.clear();
  }

  private isCodeFile(doc: vscode.TextDocument): boolean {
    const codeLanguages = [
      'typescript', 'javascript', 'python', 'go', 'rust',
      'java', 'kotlin', 'csharp', 'ruby', 'php', 'swift',
      'dart', 'cpp', 'c', 'sql'
    ];
    return codeLanguages.includes(doc.languageId);
  }

  dispose(): void {
    this.diagnosticCollection.dispose();
    this.validator.dispose();
  }
}
