# Stack: Swift
# Append to any root LLM spec file for Swift / iOS / macOS projects.

## Optionals
- Avoid force-unwrap (`!`) except where the nil case is truly a programming error.
- Use `guard let`, `if let`, and optional chaining — not force-unwrap chains.
- `fatalError()` is acceptable for unrecoverable programmer mistakes — never for user input errors.

## Concurrency (Swift Concurrency / async-await)
- Use `async/await` and structured concurrency for new code.
- No `DispatchQueue` workarounds where Swift Concurrency is available.
- Mark types as `@MainActor` when their state must be read/written on the main thread.
- Avoid data races: prefer `actor` for shared mutable state.
- No `Task.detached` without explicit reasoning — prefer structured tasks.

## Value vs Reference Types
- Prefer `struct` for data types. Use `class` only when reference semantics or inheritance is required.
- Enums with associated values for modelling states — not multiple optional properties.

## Memory Management
- No retain cycles: use `[weak self]` or `[unowned self]` in closures that capture `self`.
- Prefer `[weak self]` over `[unowned self]` unless you can prove the object always outlives the closure.

## SwiftUI (if applicable)
- Keep `View` bodies thin — extract sub-views and view models.
- No business logic in `View` structs — delegate to `ObservableObject` / `@Observable` view models.
- Use `@State` for local ephemeral state only.

## UIKit (if applicable)
- All UI updates on the main thread — use `DispatchQueue.main.async` or `@MainActor`.
- No strong delegate references — delegates must be `weak`.

## Formatting & Linting
- Run `swiftformat` and `swiftlint` if configured.
- Respect the project's `.swiftlint.yml` settings — do not disable rules inline without justification.

## Verification Checklist
- [ ] Builds without warnings in Xcode / `swift build`
- [ ] Tests pass: `swift test` / `xcodebuild test`
- [ ] No force-unwrap without justification
- [ ] No retain cycles in closures
- [ ] No UI updates off the main thread
