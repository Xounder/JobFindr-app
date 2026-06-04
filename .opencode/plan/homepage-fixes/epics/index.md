# Homepage Fixes — Epics

> Frontend-only fixes for the JobFindr homepage. All three issues are independent and can be done in any order.

## Scope

Frontend only — components, Zustand stores, and persist configuration. No backend, types, or utils changes.

## Epic Overview

| EPIC | File | Title | Priority | Effort |
|------|------|-------|----------|--------|
| 01 | [EPIC-01-fix-skill-move-bug.md](EPIC-01-fix-skill-move-bug.md) | Fix Skill Move Stale Closure Bug | High | Small (~2 lines, 1 file) |
| 02 | [EPIC-02-add-seniority-label.md](EPIC-02-add-seniority-label.md) | Add Seniority Label on Homepage | Medium | Small (~5 lines, 1 file) |
| 03 | [EPIC-03-fix-null-filter-values.md](EPIC-03-fix-null-filter-values.md) | Fix "null" Initial Values in Filter Fields | Medium | Small (~10 lines, 2 files) |

## Dependencies

None. All three epics are independent and can be implemented in any order or in parallel.

## Implementation Notes

- **Issue 1** (EPIC 01): Use `useSkillsStore.getState()` instead of closure-captured value in `Layout.tsx`
- **Issue 2** (EPIC 02): Import `useSkillsStore` in `FiltersPanel.tsx` and render `userSeniority` below `SenioritySelector`
- **Issue 3** (EPIC 03): Add Zustand persist migration v1 + null coalescing (`?? []`) in `AutocompleteInput.tsx`

## References

- [Feasibility Analysis](../feasibility.md)
- [Impact Analysis](../impact-analysis.md)
- [Risks](../risks.md)
- [Recommendations](../recommendations.md)
