# Stack: Shell / Bash
# Append to any root LLM spec file for shell script projects.

## Always Use Strict Mode

Every script must begin with:

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'
```

- `set -e`: exit on error
- `set -u`: error on unset variables
- `set -o pipefail`: pipe failures propagate
- `IFS=$'\n\t'`: safe word splitting

## Variable Quoting

Always double-quote variable expansions: `"$var"` not `$var`.
Always double-quote command substitutions: `"$(command)"` not `$(command)`.
Exception: arithmetic `$(( ))` and `[[ ]]` conditions are safe unquoted.

## Security

- Never pass user-supplied input directly to `eval`, `exec`, or `bash -c`.
- Never construct file paths by concatenating unvalidated input.
- Use `mktemp` for temporary files — never hardcode `/tmp/myfile`.
- Clean up temp files with `trap 'rm -f "$tmpfile"' EXIT`.

## Error Handling

- Check return codes explicitly for commands where failure is significant.
- Provide error messages to stderr: `echo "Error: message" >&2`.
- Exit with non-zero on failure: `exit 1`.
- Use `|| { echo "failed" >&2; exit 1; }` pattern for critical commands.

## Functions

- Define functions before calling them.
- Use `local` for all function variables to avoid global namespace pollution.
- Name functions with verbs: `validate_input`, `create_backup`, not `input`, `backup`.

## Portability

- Target bash explicitly (not `sh`) if using bash features.
- Avoid GNU-specific flags if the script must run on macOS/BSD as well.
- Test on both Linux and macOS if cross-platform compatibility is required.

## Readability

- One command per line — no command chains without line continuation `\`.
- Comment non-obvious commands.
- Use `[[ ]]` for conditionals, not `[ ]` (bash).
- Use `(( ))` for arithmetic, not `expr` or `let`.

## Linting

- All scripts must pass `shellcheck` with zero warnings.
- Run: `shellcheck -x script.sh` (the `-x` flag follows `source` directives).

## Verification Checklist

- [ ] `#!/usr/bin/env bash` shebang present
- [ ] `set -euo pipefail` at top
- [ ] All variables double-quoted
- [ ] `shellcheck` passes with zero warnings
- [ ] Temp files cleaned up with `trap`
- [ ] No user input passed to `eval` or `exec`
- [ ] Error messages go to stderr
