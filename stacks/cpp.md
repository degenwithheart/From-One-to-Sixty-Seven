# Stack: C / C++
# Append to any root LLM spec file for C/C++ projects.

## Memory Management
- Every allocation has a corresponding deallocation — no leaks.
- In C++: prefer RAII. Use smart pointers (`unique_ptr`, `shared_ptr`) over raw `new`/`delete`.
- No raw `delete` for arrays — use `delete[]` or, better, `std::vector`.
- No use-after-free: do not access memory after it has been freed or gone out of scope.
- No buffer overflows: use bounds-checked APIs. No `strcpy`, `strcat`, `gets`, `sprintf` — use `strncpy`, `snprintf`, or C++ string types.

## Undefined Behaviour
- No signed integer overflow — use checked arithmetic or unsigned types where appropriate.
- No out-of-bounds array access.
- No reading uninitialized variables.
- No type-punning through raw casts — use `memcpy` or `std::bit_cast`.

## C++ Specific
- Prefer `std::` algorithms over hand-rolled loops where the intent is clearer.
- Use `const` and `constexpr` aggressively.
- Rule of Zero/Three/Five: if you define any of destructor, copy constructor, or copy assignment, define or delete all of them.
- No `using namespace std;` in header files.
- Prefer `nullptr` over `NULL` or `0` for pointer null values.
- Prefer `static_cast` over C-style casts.

## Concurrency (C++)
- Protect shared data with `std::mutex` or appropriate synchronization primitives.
- No data races — run with ThreadSanitizer (`-fsanitize=thread`).
- Prefer `std::atomic` for simple shared counters over mutex.

## Build & Tooling
- Enable and fix all compiler warnings: `-Wall -Wextra -Werror` (or equivalent for MSVC).
- Run AddressSanitizer (`-fsanitize=address`) on tests.
- Run UBSanitizer (`-fsanitize=undefined`) on tests.
- Respect the CMake / Bazel / Makefile structure — do not change build system without discussion.

## Verification Checklist
- [ ] Builds with zero warnings at max warning level
- [ ] Tests pass
- [ ] AddressSanitizer reports no issues
- [ ] Valgrind (or equivalent) reports no memory leaks
- [ ] No raw `strcpy`/`strcat`/`gets` in new code
