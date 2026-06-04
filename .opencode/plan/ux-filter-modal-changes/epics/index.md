# UX Filter & Modal Changes — Epics Overview

**Context:** `ux-filter-modal-changes`
**Date:** 2026-06-03
**Source Analysis:** `.opencode/plan/ux-filter-modal-changes/` (items 1-5)

## Epic Mapping

| Epic | Title | Source Items | Layer | Effort | Dependencies |
|------|-------|-------------|-------|--------|-------------|
| EPIC-01 | Filter Input Improvements | Item 1 (Clean button) + Item 2 (Company mutual exclusion) | Frontend-only | Small-Medium | None |
| EPIC-02 | Your Skills Modal Rework | Item 3 (Skills modal changes) | Frontend-only | Medium | EPIC-01 (conceptual overlap — Clean button in modal) |
| EPIC-03 | Job Detail Modal Enhancement | Item 4 (Show More sizing + title) | Frontend-only | Small | None |
| EPIC-04 | Interactive Trust & Match Explanations | Item 5 (Trust/Match badges → buttons) | Backend + Frontend | Large | None (backend first, then frontend) |

## Implementation Order (Recommended)

```
Phase 1 (parallel):
  EPIC-01 — Filter Input Improvements (standalone, frontend-only)
  EPIC-03 — Job Detail Modal Enhancement (standalone, frontend-only)

Phase 2:
  EPIC-02 — Your Skills Modal Rework (heavier, but independent)

Phase 3:
  EPIC-04 — Interactive Trust & Match Explanations (backend first, then frontend)
```

## Quick Reference

| File | What it Contains |
|------|-----------------|
| `EPIC-01-filter-input-improvements.md` | Clean button on AutocompleteInput + mutual exclusion between Include/Exclude companies |
| `EPIC-02-your-skills-modal-rework.md` | Save/discard flow, remove Move button, remove Remove All, fix move-to-required bug |
| `EPIC-03-job-detail-modal-enhancement.md` | 70vw/70vh sizing + job title in Show More modal |
| `EPIC-04-interactive-trust-match-explanations.md` | Backend breakdown types, TrustExplanationModal, MatchExplanationModal |

**Total epics:** 4
**Total source items:** 5 (EPIC-01 combines 2 items)
