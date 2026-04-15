# Contributing

## What's Welcome

- Bug reports: a rule that causes bad outcomes in practice
- Wording improvements: sharper without changing intent
- New rules: well-reasoned additions for genuine gaps
- New LLM assistant files (new `TOOLNAME.md` at root)
- New variants (new `variants/VARIANT.md`)
- New stack addenda (new `stacks/LANGUAGE.md`)
- New IDE plugin configs (new `plugins/EDITOR/`)
- Examples and docs improvements

## What's Not

- Weakening rules to let LLMs do more without verification
- Purely stylistic changes with no quality/safety rationale

## Process

1. Open an issue first for non-trivial changes
2. Fork, branch (`fix/rule-3-wording`, `feat/scala-stack`, etc.)
3. Make focused changes — one concern per PR
4. Open a PR using the pull request template

## Style Guide

- Plain, direct language
- Imperative voice: "Do not..." not "It is recommended to avoid..."
- One rule, one concern — keep rules atomic
- Tables for comparisons, checklists for verification steps
- No marketing language

## Adding a New LLM Assistant File

1. Copy `AGENTS.md` as a starting point
2. Add LLM-specific context (config file location, tool-specific behaviours, IDE integration)
3. Add the tool to the table in `README.md`
4. Add comparison notes to `docs/llm-comparison.md`

## Adding a New Stack

1. Copy an existing stack file (e.g. `stacks/python.md`) as a starting point
2. Cover: style, error handling, async/concurrency, package management, formatting, testing, verification checklist
3. Add the stack to the table in `README.md`

## Versioning

- MAJOR: a rule is removed or fundamentally changed
- MINOR: new rule, variant, stack, or LLM file added
- PATCH: wording, typo, clarification

Update `CHANGELOG.md` with every change.

## License

MIT. Contributions are accepted under the same license.
