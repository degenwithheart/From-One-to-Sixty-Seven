# Variant: SECURITY_HARDENED
# For systems where a security failure means breach, privilege escalation, or harm.

## Mandatory Security Block (Every Change)

```
SECURITY REVIEW:
- Touches auth/authz boundary: yes/no
- Handles untrusted input: yes/no
- Affects data at rest or in transit: yes/no
- Attack vectors considered:
- Mitigations applied:
```

## S1: Input — All External Input Is Untrusted

Validate at the boundary. Use allowlists. Reject unexpected input.
Never pass raw input to: SQL, shell commands, eval, deserializers, template engines, file paths.

## S2: Output Encoding

- HTML: escape by default
- SQL: parameterized queries only
- Shell: argument arrays, not string construction
- File paths: canonicalize and validate before use

## S3: Auth & Sessions

- No custom crypto — use established libraries
- Tokens: ≥128 bits of randomness, time-limited, invalidated on logout
- Regenerate session ID on any privilege change
- Passwords: bcrypt, argon2, or scrypt only

## S4: Authorization

- Check at every layer — not only at the API gateway
- Verify users can only access their own resources (horizontal privilege escalation)
- Principle of least privilege on all service accounts

## S5: Secrets

- Zero hardcoded secrets — including test, dev, and staging
- Use the existing secrets management system
- Never log secrets, not even partially

## S6: Dependencies

- CVE check before adding any new dependency
- Pin versions — no floating ranges in production

## S7: Error Handling

- No stack traces, internal paths, or system details to end users
- Generic messages externally; detail in logs internally
- Fail securely: on error, default to deny

## S8: Cryptography

- TLS 1.2+ for all network communication
- No disabling of certificate verification
- Authenticated encryption only (AES-GCM, ChaCha20-Poly1305)
- No custom encryption schemes

## Security Verification Checklist

- [ ] All external input validated at boundary
- [ ] No injection surfaces introduced
- [ ] No secrets in code or logs
- [ ] Auth/authz checked at all relevant layers
- [ ] Error messages safe for external exposure
- [ ] Dependencies CVE-checked
- [ ] Security review block completed

## Security Final Statement

```
SECURITY SUMMARY:
- What changed:
- Security boundaries affected:
- Attack vectors considered:
- Mitigations in place:
- Trust assumptions about callers:
- Risks remaining:
- Human security review required: yes/no
```
