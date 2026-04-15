# Stack: C# / .NET
# Append to any root LLM spec file for C#/.NET projects.

## Null Safety
- Enable `<Nullable>enable</Nullable>` if not already set — do not disable it.
- Use `?` nullable annotations and respect them — no `!` null-forgiving operator without justification.
- Return `null` from public APIs only with explicit `?` return type annotation.

## Async / Await
- All I/O must be async. No `Task.Result` or `.Wait()` on async tasks — this causes deadlocks.
- Use `CancellationToken` in all async public APIs — pass through, do not ignore.
- No `async void` except for event handlers.
- Use `ConfigureAwait(false)` in library code; not required in application code.

## LINQ
- Prefer LINQ for data transformation — avoid imperative loops where LINQ is clearer.
- Do not chain more than 5-6 operations without extracting to named variables.
- Materialize (`ToList()`, `ToArray()`) only when necessary — avoid multiple enumeration.

## Dependency Injection
- Constructor injection only — not property injection or service locator pattern.
- Register services with the appropriate lifetime: `Singleton`, `Scoped`, `Transient`.
- Do not resolve services manually from `IServiceProvider` in business logic.

## Error Handling
- No empty `catch` blocks.
- No catching `Exception` at low levels — let it propagate or wrap with context.
- Use custom exception types for domain errors.

## Entity Framework (if applicable)
- No lazy loading in production code — use explicit `Include()`.
- Do not call `SaveChanges()` inside loops.
- Async DB calls only — `SaveChangesAsync()`, `ToListAsync()`, etc.

## Formatting & Linting
- Respect `dotnet format` / `.editorconfig` settings.
- Respect Roslyn analyzers / StyleCop / SonarAnalyzer if configured.

## Verification Checklist
- [ ] `dotnet build` passes
- [ ] `dotnet test` passes
- [ ] No `Task.Result` or `.Wait()` on async tasks
- [ ] No `async void` outside event handlers
- [ ] No empty catch blocks
- [ ] Nullable warnings resolved
