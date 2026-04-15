# Stack: Docker / Kubernetes
# Append to any root LLM spec file for containerized projects.

## Dockerfile Rules

- Pin base image versions: `FROM node:20.11-alpine3.19` not `FROM node:latest`.
- Use minimal base images: `alpine`, `distroless`, or `slim` variants.
- Run as non-root: add `USER nonroot` or equivalent — never run containers as root in production.
- One process per container — no process supervisors unless explicitly justified.
- Multi-stage builds: separate build from runtime image to minimize final image size.
- No secrets in `ENV`, `ARG`, or `COPY` during build — use runtime secret injection.
- `.dockerignore` must exist and exclude: `node_modules/`, `.git/`, `*.md`, test files, local config.

```dockerfile
# Good pattern
FROM node:20.11-alpine3.19 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20.11-alpine3.19 AS runtime
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=app:app . .
USER app
EXPOSE 3000
CMD ["node", "server.js"]
```

## Docker Compose Rules

- Pin image versions — no `latest` tags.
- Declare health checks for all services.
- Use named volumes, not anonymous volumes.
- Do not hardcode secrets in `docker-compose.yml` — use `.env` files or Docker secrets.
- Networks: use custom networks, not the default bridge.

## Kubernetes Rules

### Resource Limits
- Every container must have `resources.requests` and `resources.limits` set.
- No containers without memory limits — they can OOM the node.

### Security Context
- `runAsNonRoot: true` on all pods.
- `readOnlyRootFilesystem: true` where possible.
- `allowPrivilegeEscalation: false` always.
- Drop all capabilities: `capabilities.drop: [ALL]`.

### Secrets
- No secrets in ConfigMaps — use Secrets objects, Vault, or External Secrets Operator.
- No secrets in pod spec environment variables as plain text — reference Secret keys.

### Health Probes
- All pods must define `livenessProbe` and `readinessProbe`.
- `startupProbe` for slow-starting applications.

### Images
- Never use `imagePullPolicy: Always` with mutable tags in production.
- Use immutable image references (digest-pinned) for production deployments.

### Changes
- Test manifests with `kubectl apply --dry-run=server` before applying.
- For destructive changes (delete Deployment, PVC), require explicit human approval.

## Verification Checklist

- [ ] Base images pinned to specific versions
- [ ] Container does not run as root
- [ ] No secrets in image layers or compose files
- [ ] `.dockerignore` present and correct
- [ ] K8s resource limits set on all containers
- [ ] K8s security context configured
- [ ] Health probes defined
- [ ] `kubectl apply --dry-run=server` passes
