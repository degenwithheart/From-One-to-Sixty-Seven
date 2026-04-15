# Variant: ENTERPRISE
# For regulated environments — finance, healthcare, critical infrastructure.
# All base rules from the root spec apply. This file adds constraints on top.

## E1: Schema Change Protocol

No schema or serialization changes without:
- Written migration plan in the PR
- Rollback procedure documented
- Confirmation existing data is not corrupted
- Human review before merge

```
SCHEMA CHANGE:
- Table/collection affected:
- Nature of change:
- Migration plan:
- Rollback plan:
- Data integrity risk:
```

## E2: API Versioning

No public or internal API changes without:
- Version bump (semver)
- CHANGELOG entry
- Deprecation notice for removed/changed endpoints
- Migration guide for breaking changes

## E3: Security Change Review

Any change touching auth, crypto, key management, network boundaries, or input sanitisation:

```
SECURITY REVIEW:
- Security boundary affected:
- Attack vectors considered:
- Mitigations in place:
- Human security review requested from:
```

Do not merge security changes without human sign-off.

## E4: Dependency Upgrades

No upgrades without:
- Version diff (old → new)
- Changelog/release notes reviewed
- Transitive dependency changes listed
- CVE check performed
- Licence compatibility confirmed

```
DEPENDENCY CHANGE:
- Package:
- Old version → New version:
- Reason:
- CVE check: pass/fail
- Licence: unchanged / changed to X
- Transitive changes: none / [list]
```

## E5: Rollback Requirement

Every production change must have a documented rollback procedure.
If rollback is impossible, this must be explicitly stated and human-approved.

## E6: Audit Trail

Do not reduce log verbosity without approval.
Do not change log formats without updating downstream consumers (SIEM, compliance tools).
Never log PII or credentials.

## E7: Four-Eyes Principle

These always require a second human reviewer — LLM assistance is not a substitute:
- Payment processing logic
- Auth and session management
- Data deletion or anonymisation
- Encryption key handling
- Regulatory reporting

## Enterprise Final Statement

```
ENTERPRISE SUMMARY:
- What changed:
- Schema impact:
- API contract impact:
- Security impact:
- Dependency changes:
- Rollback procedure:
- Human review required: yes/no
```
