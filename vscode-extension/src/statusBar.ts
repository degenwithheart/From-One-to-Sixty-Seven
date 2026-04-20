import * as vscode from 'vscode';

export class FotsStatusBar {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.statusBarItem.command = 'fots.showStatus';
  }

  show(): void {
    this.update();
    this.statusBarItem.show();
  }

  update(): void {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    
    if (!workspaceFolders) {
      this.statusBarItem.text = '$(circle-slash) FOTS';
      this.statusBarItem.tooltip = 'No workspace open';
      return;
    }

    const hasFots = this.checkFotsInstallation(workspaceFolders);
    
    if (hasFots) {
      this.statusBarItem.text = '$(check) FOTS';
      this.statusBarItem.tooltip = 'FOTS is active';
    } else {
      this.statusBarItem.text = '$(circle-outline) FOTS';
      this.statusBarItem.tooltip = 'FOTS not initialized. Click to initialize.';
    }
  }

  private checkFotsInstallation(folders: readonly vscode.WorkspaceFolder[]): boolean {
    for (const folder of folders) {
      const fotsConfig = vscode.Uri.joinPath(folder.uri, '.fots', 'config.json');
      try {
        const stat = vscode.workspace.fs.stat(fotsConfig);
        return true;
      } catch {
        continue;
      }
    }
    return false;
  }

  dispose(): void {
    this.statusBarItem.dispose();
  }
}
