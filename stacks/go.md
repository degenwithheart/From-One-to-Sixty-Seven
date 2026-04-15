# Stack: Go
# Append to any root LLM spec file for Go projects.

## Error Handling
- Always handle errors explicitly — never discard with `_` unless function is infallible.
- Return errors; do not panic in library code.
- Wrap with context: `fmt.Errorf("doing X: %w", err)`.
- Use `errors.Is` and `errors.As` for inspection — never string matching.
- Sentinel errors: `var ErrX = errors.New("...")`.

## Function Design
- Small, focused functions — one responsibility.
- Flat, early-return style over deeply nested if/else.
- Accept interfaces, return concrete types (in most cases).

## Goroutines & Concurrency
- Every goroutine must have a clear owner responsible for waiting on it.
- Use `context.Context` for cancellation — first argument always.
- No shared memory without synchronization. Prefer channels.
- Check for data races: `go test -race ./...`.

## Interfaces
- Define at the consumer side, not the implementation side.
- Keep interfaces small (1-2 methods is often correct).
- No speculative interfaces "in case we need another implementation."

## Package Design
- Package names: short, lowercase, no underscores. Not `util`, `common`, `helpers`.
- No package-level mutable state.
- No `init()` unless absolutely necessary.
- All exported symbols must have godoc comments.

## Formatting & Linting
- All code must pass `gofmt` — no exceptions.
- Run `go vet ./...` before finishing.
- Respect `golangci-lint` config if present.

## Verification Checklist
- [ ] `go build ./...` succeeds
- [ ] `go test ./...` passes
- [ ] `go test -race ./...` passes
- [ ] `go vet ./...` passes
- [ ] `gofmt -l .` returns nothing
- [ ] All errors handled explicitly
- [ ] All goroutines have clear lifecycle ownership
