import * as vscode from 'vscode';

export interface Violation {
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  line?: number;
  column?: number;
}

export interface ValidationResult {
  file: string;
  violations: Violation[];
}

export class FotsValidator {
  async validateDocument(doc: vscode.TextDocument): Promise<ValidationResult> {
    const content = doc.getText();
    const violations: Violation[] = [];
    const config = vscode.workspace.getConfiguration('fots');

    if (config.get('enforceSummary', true)) {
      violations.push(...this.checkSummaryRule(content, doc));
    }

    if (config.get('enforceAssumptions', false)) {
      violations.push(...this.checkAssumptionsRule(content, doc));
    }

    violations.push(...this.checkSecurityRule(content, doc));

    return {
      file: doc.fileName,
      violations
    };
  }

  private checkSummaryRule(content: string, doc: vscode.TextDocument): Violation[] {
    const violations: Violation[] = [];

    if (content.length < 200) return violations;

    const hasSummaryBlock = /SUMMARY:\s*\n[\s\S]*?-\s*What changed:/i.test(content);
    const hasSummaryComment = /SUMMARY:/i.test(content);

    if (!hasSummaryBlock) {
      if (hasSummaryComment) {
        violations.push({
          rule: 'summary',
          message: 'SUMMARY block exists but may be incomplete',
          severity: 'warning'
        });
      } else {
        violations.push({
          rule: 'summary',
          message: 'Missing SUMMARY block. End significant changes with SUMMARY block.',
          severity: 'warning',
          line: doc.lineCount
        });
      }
    }

    return violations;
  }

  private checkAssumptionsRule(content: string, doc: vscode.TextDocument): Violation[] {
    const violations: Violation[] = [];

    const hasAssumptions = /ASSUMPTIONS:\s*\n/i.test(content);
    const hasAmbiguousComment = /\/(\/|\*)\s*(TODO|FIXME|HACK)/i.test(content);

    if (!hasAssumptions && hasAmbiguousComment) {
      violations.push({
        rule: 'assumptions',
        message: 'Consider declaring ASSUMPTIONS for TODO/FIXME items',
        severity: 'info'
      });
    }

    return violations;
  }

  private checkSecurityRule(content: string, doc: vscode.TextDocument): Violation[] {
    const violations: Violation[] = [];

    const secretPatterns = [
      { pattern: /(password|secret|key|token)\s*=\s*["'][^"']{8,}["']/i, message: 'Potential hardcoded secret' },
      { pattern: /sk-[a-zA-Z0-9]{20,}/, message: 'Potential API key pattern' }
    ];

    for (const { pattern, message } of secretPatterns) {
      const match = pattern.exec(content);
      if (match) {
        const lines = content.substring(0, match.index).split('\n');
        const line = lines.length;
        
        violations.push({
          rule: 'security',
          message: `${message}. Use environment variables.`,
          severity: 'error',
          line
        });
      }
    }

    return violations;
  }

  dispose() {}
}
