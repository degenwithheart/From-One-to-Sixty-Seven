# Stack: Java
# Append to any root LLM spec file for Java projects.

## Code Style
- Follow the existing style: Google Java Style, Oracle conventions, or project config.
- Respect the formatter in use: `google-java-format`, `spotless`, or IDE-native.
- No whole-file reformats — only change what the task requires.

## Null Safety
- Prefer `Optional<T>` over returning `null` from methods.
- Document nullability with `@Nullable` / `@NonNull` annotations if the project uses them.
- Never return `null` from a public API without explicit contract documentation.

## Exceptions
- Checked exceptions: only for recoverable conditions the caller must handle.
- Unchecked exceptions: for programming errors and unrecoverable states.
- Never catch `Exception` or `Throwable` silently — always log or rethrow with context.
- No empty catch blocks.

## Collections & Streams
- Prefer immutable collections where possible (`List.of`, `Map.of`, `Collections.unmodifiableList`).
- Stream operations: keep chains short and readable — split into named variables if complex.
- Do not use streams where a simple loop is clearer.

## Concurrency
- No raw `Thread` creation — use `ExecutorService` or virtual threads (Java 21+).
- Synchronize on private final lock objects, not `this`.
- Document thread-safety contracts on shared classes.
- No `Thread.sleep()` in non-test production code without explicit justification.

## Build & Dependency Management
- Respect the build tool: Maven (`pom.xml`) or Gradle (`build.gradle` / `build.gradle.kts`).
- Do not add dependencies without checking for existing equivalents.
- Pin versions — no open-ended ranges in production.

## Spring (if applicable)
- Use constructor injection — not field injection (`@Autowired` on fields).
- Keep `@Service`, `@Component`, and `@Repository` classes focused on one responsibility.
- Do not put business logic in controllers.

## Verification Checklist
- [ ] `mvn compile` / `gradle compileJava` passes
- [ ] Tests pass (`mvn test` / `gradle test`)
- [ ] Checkstyle / SpotBugs / PMD passes (if configured)
- [ ] No empty catch blocks
- [ ] No raw `null` returns from public APIs without documentation
