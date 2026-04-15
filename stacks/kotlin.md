# Stack: Kotlin
# Append to any root LLM spec file for Kotlin projects.

## Null Safety
- Exploit Kotlin's type system — avoid `!!` (non-null assertion) except where provably safe.
- Prefer `?.let { }`, `?:`, and safe calls over null checks.
- Do not introduce nullable types unnecessarily — design APIs to be non-null by default.

## Immutability
- Prefer `val` over `var`. Use `var` only when mutation is genuinely required.
- Use immutable collections: `listOf`, `mapOf`, `setOf` — not their mutable counterparts unless needed.
- Data classes for value types — leverage `copy()` over mutation.

## Coroutines
- Respect the existing coroutine scope and dispatcher structure — do not introduce new ones without justification.
- Never block a coroutine with `Thread.sleep()` — use `delay()`.
- Always handle cancellation: respect `CancellationException`, do not swallow it.
- Use `Dispatchers.IO` for I/O, `Dispatchers.Default` for CPU-bound — not `Dispatchers.Main` for heavy work.
- `runBlocking` is acceptable in tests only — not in production coroutine contexts.

## Functions & Lambdas
- Keep lambda bodies short. Extract to named functions if longer than 3 lines.
- Use trailing lambda syntax only when the lambda is the last and only meaningful argument.
- Prefer extension functions for functionality that belongs conceptually to a type.

## Classes & Objects
- Prefer data classes for pure data holders.
- Sealed classes for exhaustive state modelling.
- `object` for singletons — not companion objects with mutable state.

## Android (if applicable)
- No long-running work on the main thread.
- ViewModel survives configuration changes — do not hold Activity references in it.
- Use `StateFlow` / `SharedFlow` over `LiveData` in new code unless the project already uses LiveData.

## Verification Checklist
- [ ] `./gradlew compileKotlin` passes
- [ ] `./gradlew test` passes
- [ ] No `!!` assertions without justification
- [ ] No `var` where `val` works
- [ ] No blocking calls inside coroutines
