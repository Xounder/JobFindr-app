# EPIC 15 — Deployment & DevOps

## TASK-104 — Create Frontend Dockerfile
**Layer:** Frontend
**Depends on:** TASK-002, TASK-006
### Description
Containerize frontend.

---

## TASK-105 — Create Backend Dockerfile
**Layer:** Backend
**Depends on:** TASK-003, TASK-006
### Description
Containerize backend.

---

## TASK-106 — Create Production Docker Compose
**Layer:** Shared (infra)
**Depends on:** TASK-104, TASK-105
### Description
Setup production compose environment.

---

## TASK-107 — Configure GitHub Actions
**Layer:** Shared (infra)
**Depends on:** TASK-008
### Description
Setup CI/CD workflows.

---

## TASK-108 — Configure Vercel Deployment
**Layer:** Frontend
**Depends on:** TASK-104
### Description
Deploy frontend automatically.

---

## TASK-109 — Configure Railway/Render Deployment
**Layer:** Backend
**Depends on:** TASK-105
### Description
Deploy backend automatically.

---

## TASK-110 — Create Environment Validation
**Layer:** Shared (infra)
**Depends on:** TASK-007
### Description
Validate production env variables.

---

## TASK-111 — Create Deployment Documentation
**Layer:** Shared (infra)
**Depends on:** TASK-106, TASK-107, TASK-108, TASK-109
### Description
Document deployment process.

---
