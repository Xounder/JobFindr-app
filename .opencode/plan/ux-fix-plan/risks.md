# Risks — UX Fix Plan

## Risk Matrix

### Risk R1 — Search flow inversion breaks existing behavior

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Existing users/tests rely on auto-search; inversion causes confusion or silent failures | High | High | Update ALL tests first; add a clear visual indicator (glowing button); keep the current behavior as a temporary fallback behind a feature flag if needed |

### Risk R2 — Dirty flag state management bugs

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `isDirty` gets out of sync (stuck at true or false) — button glows when it shouldn't or doesn't glow when it should | Medium | Medium | Derive `isDirty` from a comparison of "committed" vs "current" params instead of a boolean flag (Option C from analysis). Falls back to Option B if complexity is too high. Write tests for dirty state transitions. |

### Risk R3 — UserSkillsModal local state loses changes

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| User edits skills in modal, closes via overlay click/X/Escape, and changes are discarded without warning | Medium | Medium | Only sync on close button click (not on overlay click). Show a confirmation dialog if there are unsaved changes and user clicks overlay/Escape. |

### Risk R4 — Move-to-required logic with local state

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| The "Move Selected to Required" button moves skills from userSkills to required skills. With local state, this must operate on local copies. If not handled correctly, moves may apply to the wrong state snapshot. | Medium | Medium | Keep the move-to-required handler operating on local state copies. Sync both userSkills AND skills (required) to the store on modal close. |

### Risk R5 — Match/trust breakdown data not available in response

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Backend doesn't currently compute or return matchBreakdown/trustBreakdown. Adding them means modifying the aggregation pipeline. May require restructuring the data flow. | Medium | Medium | Start with existing data only (matchSummary text + trustScore number) in the modal. Add backend breakdown as a separate follow-up. This de-risks the feature. |

### Risk R6 — ExpandableDescription modal regression

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Replacing inline toggle with modal could break existing functionality for long descriptions or handle edge cases (empty description, HTML in description) poorly | Low | Medium | Keep `maxLength` trimming logic; modal just shows the full `description` text as-is. Test with empty, short, and very long descriptions. |

### Risk R7 — SortToggle keyboard accessibility broken

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Adding dirty flag propagation to SortToggle may break the existing keyboard navigation (ArrowRight/ArrowLeft) | Low | Medium | Ensure `onChange` callback signature remains the same; dirty flag is set inside the callback, not interfering with keyboard handlers. |

## Regression Points

| Area | What could break | How to detect |
|------|-----------------|---------------|
| SearchBar | Query submission flow, autocomplete, keyboard nav | Run SearchBar.test.ts |
| SortToggle | Radio group behavior, keyboard nav, aria attributes | Run SortToggle.test.ts |
| FiltersPanel | All filter categories, reset button | Visual regression + integration tests |
| UserSkillsModal | Add/remove skills, seniority select, move-to-required, remove-all confirmation | Run UserSkillsModal.test.ts |
| JobCard | Trust badge, match badge, skills list, description | Visual regression |
| ExpandableDescription | Show more/less behavior (changed to modal) | Run ExpandableDescription.test.ts |
| Pagination | Page navigation with new committed params | Run Pagination tests |
| Backend aggregation | Trust evaluation, match scoring, sorting | Run backend tests |
| Zustand persistence | `isDirty` should NOT be persisted (filters should persist, dirty flag should not) | Check persisted state in localStorage |
| TanStack Query cache | Stale data when committed params change | Manual testing |

## State management risks

The most critical risk is the interaction between Zustand (persisted filters) and the new dirty/commit flow:

```
Current: Store change → API call (debounced)
New:     Store change → isDirty=true → UI glows → Search click → commit → API call
```

Edge cases to handle:
1. **Page load**: On initial load, should there be an auto-search with persisted filters? Yes — the committed params should initialize from the persisted store, and isDirty should be `false`.
2. **Reset filters**: `resetFilters()` should reset committed params too and trigger an auto-search (since there's no "Search" button click).
3. **Pagination**: Clicking page numbers should trigger an immediate fetch (not wait for Search button). Page changes should NOT set isDirty.
