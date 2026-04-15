# Stack: PHP
# Append to any root LLM spec file for PHP projects.

## Type Safety
- Use strict types: `declare(strict_types=1);` at the top of every file.
- Type-hint all function parameters and return types.
- No `mixed` type without a comment explaining why it cannot be more specific.
- Use named arguments for calls with many parameters to improve readability.

## Error Handling
- No suppression operator (`@`) — handle errors properly.
- Use typed exceptions — not generic `\Exception` everywhere.
- Log exceptions with context before re-throwing or handling.
- Set a proper error handler and exception handler in the application bootstrap.

## Security
- No string interpolation in SQL — use PDO prepared statements or an ORM with parameterized queries.
- No direct `$_GET` / `$_POST` / `$_REQUEST` in business logic — sanitize and validate at the entry point.
- Use `htmlspecialchars()` / Twig auto-escaping / Blade auto-escaping for all HTML output.
- No `eval()`, no `shell_exec()`, no `exec()` with user-supplied data.
- Session: regenerate ID on login/logout/privilege change.

## Composer & Dependencies
- Respect `composer.json` and `composer.lock`.
- Do not add packages without checking for existing equivalents.
- Run `composer audit` to check for known vulnerabilities.

## Laravel (if applicable)
- Use Eloquent safely: `findOrFail()` not `find()` where failure is exceptional.
- No raw DB queries with user input — use query builder bindings.
- Validation in Form Requests, not in controllers.
- Jobs for long-running tasks — not synchronous request handlers.

## Symfony (if applicable)
- Services must be autowired and configured in `services.yaml` — not instantiated manually.
- Use the Symfony validator component for input validation.

## Verification Checklist
- [ ] `php -l` syntax check passes on changed files
- [ ] PHPStan / Psalm at configured level passes
- [ ] PHPUnit tests pass
- [ ] `declare(strict_types=1)` present in new files
- [ ] No raw user input in SQL or HTML output
