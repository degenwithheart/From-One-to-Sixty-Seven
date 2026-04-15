# Stack: Rust
# Append to any root LLM spec file for Rust projects.

## Ownership & Borrowing
- Do not clone data to avoid borrow checker complexity — fix the root cause.
- Prefer borrowing (`&T`, `&mut T`) over cloning where lifetime allows.
- If fighting the borrow checker: reconsider the data structure first.
- Use `Rc` / `Arc` deliberately — not reflexively when lifetimes get hard.

## Error Handling
- Use `Result<T, E>` for all fallible operations.
- No `unwrap()` or `expect()` in library code.
- `unwrap()` acceptable in tests and in `main` only for truly unrecoverable cases.
- Use `?` to propagate — do not re-wrap without adding context.
- Define custom error types with `thiserror` or implement `std::error::Error`.

## Panics
- No panics in library code — only for programming invariant violations.
- Document when a function can panic with `# Panics` in the doc comment.

## Unsafe
- No `unsafe` blocks without a written justification comment.
- Every `unsafe` block must explain why it is safe despite the keyword.
- Do not expand scope of existing `unsafe` blocks.

## Compiler Warnings
- Build must be warning-free before finishing.
- No `#[allow(...)]` without a comment explaining why.

## Concurrency
- Prefer message passing (channels) over shared state.
- If sharing state: `Mutex` or `RwLock` with documented lock ordering.
- Use `Arc<Mutex<T>>` deliberately — not as the default for all shared data.

## Formatting & Linting
- All code must pass `rustfmt`.
- All code must pass `clippy` — address lints, do not suppress without justification.

## Verification Checklist
- [ ] `cargo build` succeeds
- [ ] `cargo test` passes
- [ ] `cargo clippy` passes with no suppressed warnings
- [ ] `rustfmt --check` passes
- [ ] No new `unsafe` blocks without justification comments
- [ ] No `unwrap()` in library code
