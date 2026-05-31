# EPIC 01 — Foundation & Monorepo Setup

## TASK-001 — Initialize Monorepo
**Layer:** Shared (infra)
**Depends on:** Nenhuma
### Description
Create the monorepo structure using pnpm workspaces and Turborepo.
### Deliverables
- Root package.json
- pnpm-workspace.yaml
- turbo.json
### Status: ✅ Concluído (Turborepo não utilizado — monorepo gerenciavel via pnpm workspaces)

---

## TASK-002 — Setup Frontend Application
**Layer:** Frontend
**Depends on:** TASK-001
### Description
Initialize React + Vite + TypeScript frontend.
### Deliverables
- React app
- Vite config
- TypeScript strict mode

---

## TASK-003 — Setup Backend Application
**Layer:** Backend
**Depends on:** TASK-001
### Description
Initialize Fastify backend with TypeScript.
### Deliverables
- Fastify server
- Base routes
- Environment support

---

## TASK-004 — Shared Packages Setup
**Layer:** Shared (types/utils/configs)
**Depends on:** TASK-001
### Description
Create shared packages structure.
### Deliverables
- packages/shared
- packages/types
- packages/utils
- packages/configs

---

## TASK-005 — Configure Linting & Formatting
**Layer:** Shared (infra)
**Depends on:** TASK-001
### Description
Configure ESLint, Prettier, Husky and lint-staged.
### Deliverables
- ESLint config
- Prettier config
- Pre-commit hooks

---

## TASK-006 — Configure Docker Environment
**Layer:** Backend (infra)
**Depends on:** TASK-003
### Description
Create Docker development environment.
### Deliverables
- Dockerfiles
- docker-compose.yml

---

## TASK-007 — Environment Variables Setup
**Layer:** Shared (infra)
**Depends on:** TASK-001
### Description
Setup env validation and env examples.
### Deliverables
- env.example
- env validation layer

---

## TASK-008 — CI Pipeline Setup
**Layer:** Shared (infra)
**Depends on:** TASK-005
### Description
Setup GitHub Actions pipeline.
### Deliverables
- Lint workflow
- Build workflow

---
