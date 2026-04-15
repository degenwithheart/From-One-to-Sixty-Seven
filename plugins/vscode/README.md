# VS Code — AI Plugin Configs

Copy the `.vscode/` folder from this directory into your project root.
It configures the major AI coding plugins available for VS Code.

## Supported Plugins

| Plugin | Publisher | Config Key |
|---|---|---|
| GitHub Copilot | GitHub | `github.copilot.*` |
| GitHub Copilot Chat | GitHub | `github.copilot.chat.*` |
| Codeium | Codeium | `codeium.*` |
| Tabnine | Tabnine | `tabnine.*` |
| Continue | Continue | `continue.*` |
| Amazon Q | AWS | `aws.amazonQ.*` |
| Gemini Code Assist | Google | `cloudcode.gemini.*` |

## Installation (copy to your project)

```bash
cp -r plugins/vscode/.vscode/ /your-project/.vscode/
```

Then update the values in `.vscode/settings.json` to match your project.

## Notes

- `settings.json` configures plugin behaviour and enforces spec-aligned defaults.
- `extensions.json` recommends AI plugins to anyone opening the project in VS Code.
- These configs tell plugins to: ask before large changes, prefer minimal completions,
  and respect project conventions.
