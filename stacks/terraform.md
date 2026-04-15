# Stack: Terraform
# Append to any root LLM spec file for Terraform / OpenTofu projects.

## Before Any Change

Always run `terraform plan` and review the full output before applying.
Classify every resource change explicitly:

| Type | Risk | Action |
|---|---|---|
| Non-destructive (add, tag) | Low | Apply after review |
| In-place update | Medium | Verify downtime impact |
| Replacement (force new) | High | Requires human approval |
| Destructive (destroy) | Critical | Requires human approval + rollback plan |

```
INFRASTRUCTURE CHANGE:
- Resource:
- Change type:
- Downtime expected:
- Rollback plan:
```

## Resource Identifiers

- Do not rename Terraform resources without understanding that it often means destroy + recreate.
- Use `moved` blocks to rename without recreating.
- Do not change `name` fields on S3 buckets, IAM roles, RDS instances, or any resource where name is the identifier.

## State

- Never manually edit state files.
- Never run `terraform state rm` without documenting why.
- Always use remote state (S3 + DynamoDB, Terraform Cloud, etc.) — no local state in shared environments.

## IAM & Permissions

- No `*` in IAM Actions or Resources unless absolutely required — document why.
- Principle of least privilege for all service accounts.
- Document the reason for every permission granted.

## Secrets

- No secrets, passwords, or keys in `.tf` files or variable defaults.
- Use AWS Secrets Manager, SSM Parameter Store, Vault, or equivalent.

## Modules

- Pin module source versions — no floating references.
- Do not modify a shared module without assessing all consumers.
- Do not copy-paste resource blocks — extract shared patterns into modules.

## Workspace / Environment Separation

- Apply to lower environments first; validate before production.
- Use workspace or directory separation for environment isolation.

## Verification Checklist

- [ ] `terraform validate` passes
- [ ] `terraform plan` output reviewed in full
- [ ] Change type classified (non-destructive / in-place / replacement / destructive)
- [ ] Destructive changes approved by a human
- [ ] No secrets in `.tf` files
- [ ] Least privilege applied to new IAM resources
- [ ] Module versions pinned
