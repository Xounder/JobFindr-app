# Tasks Overview — Three Changes Analysis

**Date:** 2026-05-30
**Status:** Refined by Tech Lead
**Total Tasks:** 14 (EPIC-01: 6, EPIC-02: 8)

---

## Execution Order

EPIC-01 and EPIC-02 are **independent** (no overlapping files) and can be worked on in parallel. However, EPIC-01 is **high priority** (trust display bug fix) and should be prioritized.

### EPIC-01 Execution Order

```
TASK-101 (Types: thresholds + classification)
   │
   ├──→ TASK-102 (Backend: ranking boost)
   │
   ├──→ TASK-103 (Frontend: trustLabel) ──→ TASK-104 (Frontend: JobCard colors)
   │                                             │
   │                                             └──→ TASK-105 (Frontend: TrustFilters)
   │
   └──→ TASK-106 (Tests: all layers)
   │
   └──→ TASK-107 (Docs: architecture)
```

- **TASK-101** must be completed first (types are consumed by all layers)
- **TASK-102, TASK-103** depend on TASK-101 but are parallelizable
- **TASK-104** depends on TASK-103 (trustLabel must exist before colors are updated)
- **TASK-105** depends on TASK-104 (same component area)
- **TASK-106** depends on TASK-101, TASK-102, TASK-103 (tests validate implemented code)
- **TASK-107** is documentation-only, can be done last

### EPIC-02 Execution Order

```
TASK-201 (Types: search-dto)
   │
   ├──→ TASK-202 (Backend: params + validation) ──→ TASK-203 (Backend: aggregation service)
   │                                                      │
   │                                                      └──→ TASK-204 (Backend: seniority default)
   │
   └──→ TASK-205 (Frontend: types + store) ──→ TASK-206 (Frontend: UserSkillsInput component)
   │                                                  │
   │                                                  └──→ TASK-207 (Frontend: FiltersPanel integration)
   │                                                         │
   │                                                         └──→ TASK-208 (Frontend: API + hook wiring)
   │
   └──→ TASK-209 (Tests: all layers)
```

- **TASK-201** must be completed first (types shared by both layers)
- **TASK-202 + TASK-205** can be parallel after TASK-201
- **TASK-203** depends on TASK-202
- **TASK-204** depends on TASK-202 conceptually (both backend matchmaking)
- **TASK-206** depends on TASK-205 (store state needed for component)
- **TASK-207** depends on TASK-206
- **TASK-208** depends on TASK-207
- **TASK-209** depends on all implementation tasks

---

## Dependency Graph

```
EPIC-01 (Trust Model Rework)                EPIC-02 (User Skills)
       │                                          │
       │  ┌──────────────────────────┐            │  ┌──────────────────────────┐
       │  │ TASK-101  (Types)        │            │  │ TASK-201  (Types)        │
       │  │ Thresholds + Classification│           │  │ search-dto extensions   │
       │  └──────────┬───────────────┘            │  └──────────┬───────────────┘
       │             │                             │             │
       │  ┌──────────▼───────────┐   ┌──────────┐  │  ┌──────────▼───────────┐   ┌──────────┐
       │  │ TASK-102  (Backend)  │   │ TASK-103 │  │  │ TASK-202  (Backend)  │   │ TASK-205 │
       │  │ Ranking boost logic  │   │(Frontend)│  │  │ Params + validation  │   │(Frontend)│
       │  └──────────────────────┘   │trustLabel│  │  └──────────┬───────────┘   │Store+Types│
       │                              └────┬─────┘  │             │               └────┬─────┘
       │                                    │        │  ┌──────────▼───────────┐        │
       │                           ┌────────▼──────┐ │  │ TASK-203 (Backend)  │        │
       │                           │ TASK-104      │ │  │ Aggregation update  │        │
       │                           │ (Frontend)    │ │  └──────────┬───────────┘        │
       │                           │ JobCard colors│ │             │                    │
       │                           └───────┬───────┘ │  ┌──────────▼───────────┐  ┌────▼─────┐
       │                                   │         │  │ TASK-204 (Backend)  │  │ TASK-206 │
       │                           ┌───────▼───────┐ │  │ Seniority default   │  │(Frontend)│
       │                           │ TASK-105      │ │  └──────────────────────┘  │Component │
       │                           │ (Frontend)    │ │                             └────┬─────┘
       │                           │ TrustFilters  │ │                                  │
       │                           └───────────────┘ │                          ┌────────▼───────┐
       │                                             │                          │ TASK-207       │
       │  ┌──────────────────┐  ┌──────────────────┐ │                          │ (Frontend)     │
       │  │ TASK-106 (Tests) │  │ TASK-107 (Docs)  │ │                          │ FiltersPanel   │
       │  └──────────────────┘  └──────────────────┘ │                          └────────┬───────┘
       │                                             │                                   │
       │  No dependency between epics                │                          ┌────────▼───────┐
       │  (orthogonal features)                      │                          │ TASK-208       │
       │                                             │                          │ (Frontend)     │
       │                                             │                          │ API + Hook     │
       │                                             │                          └────────┬───────┘
       │                                             │                                   │
       │                                             │                          ┌────────▼───────┐
       │                                             │                          │ TASK-209       │
       │                                             │                          │ (Tests)        │
       │                                             │                          └────────────────┘
```

---

## Agent Allocation Summary

| Agent | Tasks |
|-------|-------|
| **Types (shared)** | TASK-101, TASK-201 |
| **Backend** | TASK-102, TASK-202, TASK-203, TASK-204 |
| **Frontend** | TASK-103, TASK-104, TASK-105, TASK-205, TASK-206, TASK-207, TASK-208 |
| **Both** | TASK-106 (frontend + backend tests), TASK-209 (frontend + backend tests) |
| **Docs** | TASK-107 |

---

## Constraints Summary

- `verbatimModuleSyntax: true` → use `import type` for type-only imports
- `erasableSyntaxOnly: true` → no enums, namespaces, or parameter properties
- `composite: true` → build types before consuming
- **Stateless**: user skills in Zustand persist only; no server storage
- **Frontend has zero business logic**: match calculation stays on backend
- **Provider isolation**: no provider changes needed
- **Scale consistency**: trust scores are 0-10 everywhere
- Backward compatibility: `userSkills` absent → falls back to `skills`

---

## Source Files Used for Analysis

- `.opencode/plan/three-changes-analysis/epics/EPIC-01-trust-model-rework.md`
- `.opencode/plan/three-changes-analysis/epics/EPIC-02-user-skills-matchmaking.md`
- `packages/types/src/trust.types.ts`
- `packages/types/src/search-dto.ts`
- `apps/backend/src/modules/ranking/services/trust-score-weight.ts`
- `apps/backend/src/modules/search/dto/search-dto.ts`
- `apps/backend/src/modules/search/validation/search-validation.ts`
- `apps/backend/src/modules/search/services/aggregation-service.ts`
- `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts`
- `apps/frontend/src/utils/index.ts`
- `apps/frontend/src/components/JobCard.tsx`
- `apps/frontend/src/components/TrustFilters.tsx`
- `apps/frontend/src/components/FiltersPanel.tsx`
- `apps/frontend/src/types/index.ts`
- `apps/frontend/src/store/searchStore.ts`
- `apps/frontend/src/services/api.ts`
- `apps/frontend/src/hooks/useJobSearch.ts`
- `.opencode/architecture/12-trust-engine.md`
