# Stack: Python
# Append to any root LLM spec file (CLAUDE.md, AGENTS.md, etc.) for Python projects.

## Type Hinting
- Follow the existing convention — match it exactly (full annotations or none).
- New functions: annotate parameters and return types.
- Avoid `Any` — use `Union`, `Optional`, `TypeVar`, `Protocol` appropriately.
- Use `TypedDict` or `dataclasses` for structured data, not `dict[str, Any]`.

## Async
- No blocking I/O inside `async` functions without offloading to a thread pool (`asyncio.to_thread`).
- Never mix `asyncio` and `threading` without explicit justification.
- If the codebase is sync, do not introduce async without discussion.

## Error Handling
- No bare `except:` — catch specific exception types.
- No silencing: `except Exception: pass` is forbidden.
- Re-raise with context: `raise NewError("...") from original`.
- Use custom exception classes for domain errors.

## Package Management
- Respect the tool in use: `pip`, `poetry`, `pipenv`, or `uv`.
- Do not edit `requirements.txt` directly if `pyproject.toml` is the source of truth.
- Pin versions in production. Use `~=` for compatible releases in libraries.

## Formatting & Linting
- Match the formatter: `black`, `ruff format`, or project config.
- Match the linter: `ruff`, `flake8`, `pylint`.
- Do not reformat the whole file — format only changed lines.

## Imports
- Order: stdlib → third-party → local (isort order).
- No relative imports in scripts or top-level modules.
- No `import *`.

## Logging
- Use `logging`, not `print()`, in library or service code.
- Use structured logging if the project uses `structlog`.

## Verification Checklist
- [ ] `mypy` / `pyright` passes (if configured)
- [ ] `ruff` / `flake8` passes
- [ ] `pytest` passes
- [ ] No `print()` in non-script code
- [ ] No bare `except:`
- [ ] Async boundaries respected
