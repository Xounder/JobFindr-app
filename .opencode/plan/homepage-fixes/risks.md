# Risks — Homepage Fixes

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Persist migration overwrites valid state | Low | Medium | Test migration with both valid and corrupted localStorage |
| Seniority label breaks layout on narrow screens | Low | Low | Use responsive text sizing |
| Skill move fix still leaves stale state if other handlers also capture closure | Low | Low | Audit all `handleMoveToRequired` callers |
| Regression in filter autocomplete behavior | Low | Low | Null coalescing `?? []` preserves existing behavior for valid arrays |

## Regression Points

- Filter autocomplete component behavior for valid data (should be unchanged due to `?? []` preserving valid arrays)
- Skill move flow from "Your skills" modal to "Required Skills" filter
