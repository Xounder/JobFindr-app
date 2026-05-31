# Epics Overview — Three Changes Analysis

**Date:** 2026-05-30
**Status:** Draft (awaiting Tech Lead refinement)

## Summary

This document outlines the epics derived from the Three Changes Analysis for the JobFindr job search aggregator. The analysis covered three proposed changes; after user consultation, these were consolidated into **2 epics** based on the recommended combination of Changes 2 and 3.

## Epic Mapping

| Epic ID | Epic Name | Changes Included | Priority | Effort |
|---------|-----------|-----------------|----------|--------|
| EPIC-01 | Trust Model Rework | Change 2 (Trust Display Fix) + Change 3 (Trust Redefinition) | High | Medium |
| EPIC-02 | User Skills & Personalized Matchmaking | Change 1 (User Skills Tab) | Medium | Medium |

## Prioritization Rationale

Per user agreement with the Planning Analyst's recommendation:

1. **EPIC-01 → EPIC-02**: Changes 2 and 3 both modify `trustLabel()` and `JobCard.tsx` color thresholds — combining them avoids merge conflicts and duplicate work. The trust display bug (Change 2) is a high-visibility issue that should be fixed first, while the trust redefinition (Change 3) builds on the same code paths.
2. **EPIC-02 is independent**: User Skills & Matchmaking touches no trust-related code and can be developed after EPIC-01 without conflicts.

## Success Criteria (cross-epic)

- Application working without regressions
- All existing tests passing + new tests for changed logic
- Requirements fully implemented per each epic's acceptance criteria
- Project specifications and rules maintained (statelessness, frontend has zero business logic, etc.)

## Constraints (cross-epic)

- **No server-side persistence**: User skills stored only in Zustand (localStorage via persist middleware)
- **Scale consistency**: All trust scores are 0-10 everywhere (backend, frontend types, API responses, cache)
- **Backward compatibility**: `userSkills` param absent → falls back to `skills`; cache self-heals on TTL expiry
- **No breaking changes** to external API contracts

## Dependency Graph

```
EPIC-01 (Trust Model Rework)
      │
      │  No dependency (orthogonal features)
      ▼
EPIC-02 (User Skills & Personalized Matchmaking)
```

EPIC-02 has no technical dependency on EPIC-01, but the implementation order prioritizes the bug fix and trust model first.

## Related Documents

| Document | Description |
|----------|-------------|
| `../index.md` | Three Changes Analysis overview |
| `../change-2-trust-display.md` | Detailed analysis of Change 2 (trust display bug) |
| `../change-3-trust-redefinition.md` | Detailed analysis of Change 3 (trust redefinition) |
| `../change-1-user-skills.md` | Detailed analysis of Change 1 (user skills) |
| `../recommendations.md` | Cross-cutting recommendations and prioritization |
