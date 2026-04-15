# Stack: Dart / Flutter
# Append to any root LLM spec file for Dart/Flutter projects.

## Null Safety
- All new code must be sound null-safe (`dart analyze` must pass with no null safety issues).
- No `!` null assertion without a comment explaining why null is impossible here.
- Use `late` only when initialization is truly deferred and guaranteed before use.

## Widget Architecture
- Keep `build()` methods thin — extract sub-widgets and helper methods.
- No business logic in widgets — delegate to state management (Bloc, Riverpod, Provider, etc.).
- Stateless widgets wherever possible. Use `StatefulWidget` only when local ephemeral state is required.
- Avoid deep widget trees — flatten by extracting named widgets.

## State Management
- Respect the existing state management pattern in the project — do not mix patterns.
- Blocs/Cubits: pure functions in event handlers, side effects in listeners.
- Riverpod: prefer `AsyncNotifier` and `Notifier` for new code.

## Async
- All `async` functions that can fail should return `Future<Result<T, E>>` or use error handling.
- No `Future.value(null)` as a silent no-op — be explicit.
- Cancel streams and subscriptions in `dispose()`.

## Performance
- No expensive operations in `build()` — pre-compute or cache.
- Use `const` constructors wherever possible for widget subtrees.
- Use `ListView.builder` for long lists — not `ListView` with children.

## Platform Channels (if applicable)
- Isolate platform channel code in a dedicated class.
- Handle `MissingPluginException` gracefully.

## Formatting & Linting
- Run `dart format .` on changed files.
- Run `flutter analyze` / `dart analyze` — zero issues before finishing.

## Verification Checklist
- [ ] `flutter analyze` passes with zero issues
- [ ] `flutter test` passes
- [ ] `dart format --set-exit-if-changed .` passes
- [ ] No `!` null assertions without justification
- [ ] `const` used where applicable
- [ ] Streams cancelled in `dispose()`
