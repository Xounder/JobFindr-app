# EPIC 03 — Provider Architecture

## TASK-017 — Create JobProvider Interface
**Layer:** Backend
**Depends on:** TASK-034
### Description
Create standard provider contract.

---

## TASK-018 — Create Provider Registry
**Layer:** Backend
**Depends on:** TASK-017
### Description
Create provider registration system.

---

## TASK-019 — Create Provider Loader
**Layer:** Backend
**Depends on:** TASK-018
### Description
Dynamically load providers.

---

## TASK-020 — Implement LinkedIn Provider
**Layer:** Backend
**Depends on:** TASK-017, TASK-026
### Description
Create LinkedIn jobs provider.
### Status: ❌ Removido (fora de escopo — ver .opencode/plan/provider-acquisition-plan/)

---

## TASK-021 — Implement Gupy Provider
**Layer:** Backend
**Depends on:** TASK-017, TASK-026
### Description
Create Gupy jobs provider.

---

## TASK-022 — Implement Greenhouse Provider
**Layer:** Backend
**Depends on:** TASK-017, TASK-026
### Description
Create Greenhouse jobs provider.

---

## TASK-023 — Implement Workday Provider
**Layer:** Backend
**Depends on:** TASK-017, TASK-026
### Description
Create Workday jobs provider.

---

## TASK-024 — Create Provider Fallback System
**Layer:** Backend
**Depends on:** TASK-018
### Description
Handle provider failures gracefully.

---
