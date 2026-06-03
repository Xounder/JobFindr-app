# UX Fix Plan — Epics Overview

**Date:** 2026-06-03
**Status:** Ready for Tech Lead
**Reference:** [Planning Analysis](../index.md)

## Epic Mapping

| Epic | Code | Phase | Changes | Effort | Dependencies |
|------|------|-------|---------|--------|--------------|
| [EPIC-01: Reusable Modal Component & Trust Labels](./EPIC-01-modal-and-trust-labels.md) | EPIC-01 | Phase 1 | Change 2 (trust labels), Cross-cutting (Modal) | Small | None |
| [EPIC-02: Search Flow Rework — Draft/Commit Pattern](./EPIC-02-search-flow-rework.md) | EPIC-02 | Phase 2 | Change 4 (search button), Change 1 (sort bug) | Large | None |
| [EPIC-03: Your Skills Modal — Local State & Sync on Close](./EPIC-03-skills-modal-sync.md) | EPIC-03 | Phase 3 | Change 3 (Your Skills sync) | Small | EPIC-02 (store refactor) |
| [EPIC-04: Show More as Modal](./EPIC-04-show-more-modal.md) | EPIC-04 | Phase 4 | Change 7 (Show More modal) | Small | EPIC-01 (Modal component) |
| [EPIC-05: Match & Trust Explanation Modals](./EPIC-05-match-trust-explanation-modals.md) | EPIC-05 | Phase 5 (Follow-up) | Change 5 (Match%), Change 6 (Trust) | Medium | EPIC-01 (Modal), EPIC-02 (button wiring) |

## Build Order

```
EPIC-01 ────────────────────────┐
                                ├── EPIC-04 ──┐
EPIC-02 ─── EPIC-03 ────────────┘             │
                                              ├── EPIC-05 (follow-up)
                                              │
◀── MVP (this cycle) ────────────────────────▶│
```

## This Cycle (MVP) — Epics 01, 02, 03, 04

- **Phase 1 (EPIC-01):** Modal component foundation + Trust slider labels — parallelizable, no dependencies
- **Phase 2 (EPIC-02):** Search flow rework — the biggest UX impact; fixes the sort bug naturally
- **Phase 3 (EPIC-03):** Your Skills modal sync — depends on EPIC-02 store changes
- **Phase 4 (EPIC-04):** Show More as modal — depends on EPIC-01 Modal component

## Follow-up Cycle — Epic 05

- **Phase 5 (EPIC-05):** Match% and Trust score explanation modals — requires backend breakdown embedding + Modal component

## Key Decisions

- **MVP scope:** Phases 1-4 only. Phase 5 deferred to follow-up.
- **Sort bug (Change 1):** Fixed naturally by EPIC-02 (search flow rework). No separate effort needed.
- **No backend-only endpoints:** Match/trust breakdown data is embedded in the existing search response.
- **isDirty NOT persisted:** Excluded from Zustand `partialize` function.
- **Page auto-search on load:** Committed params initialize from persisted store, triggering immediate search.
- **Pagination bypasses dirty:** Page changes always trigger immediate fetch without setting isDirty.

## Related Documents

| File | Description |
|------|-------------|
| `../feasibility.md` | Technical feasibility and approaches per change |
| `../impact-analysis.md` | File-level impact, breaking changes, test impact |
| `../risks.md` | Risk matrix and mitigation strategies |
| `../recommendations.md` | Build order, phasing, constraints for Tech Lead |
