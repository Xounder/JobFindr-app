# Impact Analysis — Homepage Fixes

## Layer Impact Matrix

| Layer | Impact | Changes |
|-------|--------|---------|
| Frontend | Low | 3-4 files changed, no new components needed |
| Backend | None | No changes |
| Types (shared) | None | No changes |
| Utils (shared) | None | No changes |
| Configs | None | No changes |

## Breaking Changes

None. All changes are backwards-compatible.

## Performance Impact

Negligible. No new API calls, no expensive computations.

## Files Changed

| File | Issue | Change |
|------|-------|--------|
| `Layout.tsx` | 1 | Use `getState()` to read fresh `userSkills` |
| `FiltersPanel.tsx` | 2 | Add seniority label below SenioritySelector |
| Filter Zustand store | 3 | Add persist migration v1 |
| `AutocompleteInput.tsx` | 3 | Null coalescing on value prop |
