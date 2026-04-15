# Skill: Security Rules
# Auto-loaded by Claude Code from .claude/skills/

## Hard Rules — Never Violate

- No hardcoded secrets, credentials, or API keys anywhere in code or config
- No logging of passwords, tokens, PII, or session identifiers
- No SQL query construction via string concatenation or f-strings
- No shell command construction from user-supplied input
- No path traversal — validate and canonicalize all file paths before use
- No unsafe deserialization of untrusted data
- No disabling of TLS certificate verification

## Near Auth / Crypto / Network Boundaries

Always include a security reasoning note:

```
SECURITY NOTE:
- Boundary affected:
- Attack vectors considered:
- Mitigations applied:
```

## Input Validation

All external input (user, API, file, environment) is untrusted by default.
Validate at the boundary. Use allowlists, not denylists. Reject unexpected input.
