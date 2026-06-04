# Four UI Fixes — Planning Analysis

**Date:** 2026-06-03
**Requested by:** User (via Planning Analyst invocation)
**Status:** Draft

## Objective

Analyze 4 distinct UI/UX change requests for the JobFindr job search aggregator: (1) "Show More" modal sizing, (2) Trust & Match explanation modals with readable text, (3) Skill highlighting in job cards matching user skills, and (4) Search bar clear ("x") button search trigger bug.

## Scope

- **Frontend only** (all 4 changes are UI-layer)
- Backend data structures are examined only for Change 2 (what data exists for explanations)
- No backend code changes required for any of the 4 changes

## Summary of Findings

| # | Change | Feasibility | Effort | Risk |
|---|--------|-------------|--------|------|
| 1 | "Show More" modal size (70% screen) | ✅ Feasible — root cause identified: Modal base class conflicts with override | Small | Low |
| 2 | Trust & Match explanation text | ✅ Feasible — all data already exists in TrustBreakdown/MatchBreakdown; needs frontend rendering logic | Small | Low |
| 3 | Skill highlighting in job cards | ✅ Feasible — userSkills already in store; just need to compare and style | Small | Low |
| 4 | Search bar "x" button triggers search | ✅ Root cause found — `handleClear` calls `onSearch("")` unnecessarily | Tiny (< 5 lines) | Low |

## Documents

| File | Description |
|------|-------------|
| `feasibility.md` | Technical feasibility and approaches for all 4 changes |
| `impact-analysis.md` | Impact per layer and files affected |
| `risks.md` | Risk assessment and mitigations |
| `recommendations.md` | Implementation recommendations and ordering |

## Quick Links to Key Files

- `apps/frontend/src/components/Modal.tsx` — Modal base component (Change 1)
- `apps/frontend/src/components/ExpandableDescription.tsx` — "Show More" trigger and modal (Change 1)
- `apps/frontend/src/components/TrustExplanationModal.tsx` — Trust explanation modal (Change 2)
- `apps/frontend/src/components/MatchExplanationModal.tsx` — Match explanation modal (Change 2)
- `apps/frontend/src/components/JobCard.tsx` — Job card with skills display (Change 3)
- `apps/frontend/src/components/SearchBar.tsx` — Search bar with "x" button bug (Change 4)
