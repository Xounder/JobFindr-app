# Recommendations — UX Fix Plan

## For Product Manager / Tech Lead

### What to build (scope)

All 7 changes are approved and feasible. They break into two work streams:

**Stream A — Search flow rework (interdependent)**
1. Change 4 — Search on button click only (**highest priority**)
2. Change 1 — Sort toggle bug (naturally fixed by #4)
3. Change 3 — Your Skills modal sync (naturally aligned with #4)

**Stream B — Modal & explanation features (share the Modal component)**
1. Cross-cutting: Reusable Modal component (must be first in this stream)
2. Change 7 — Show More as modal (simplest consumer)
3. Change 5 — Match% explanation modal
4. Change 6 — Trust score explanation modal

**Stream C — Trust labels (independent)**
1. Change 2 — Trust descriptions on slider (completely isolated)

### What NOT to build (out of scope for this cycle)

- Do NOT add backend-only endpoints for match/trust explanation as separate API calls. Instead, embed `matchBreakdown` and `trustBreakdown` directly in the existing search response to avoid N+1 API calls on the results page.
- Do NOT re-architecture the entire state management. The "draft + commit" pattern is pragmatic and sufficient.
- Do NOT add animation or micro-interactions beyond the Search button glow (keep it simple).

### Dependencies between parts

```
Modal component
  └── Change 7 (Show More modal) — depends on Modal
  └── Change 5 (Match% modal) — depends on Modal + backend breakdown
  └── Change 6 (Trust modal) — depends on Modal + backend breakdown

Search button (Change 4)
  └── Change 1 (sort bug) — eliminated by Change 4
  └── Change 3 (Your Skills) — aligns with Change 4 (manual control)

Change 2 (Trust labels) — NO dependencies
```

### Suggested build order

```
Phase 1 — Foundation (parallel)
  [ ] Create reusable Modal component
  [ ] Add trust labels to slider (Change 2)

Phase 2 — Search flow (sequential)
  [ ] Add isDirty to store
  [ ] Refactor useJobSearch to accept committed params
  [ ] Refactor HomePage to use draft/commit pattern
  [ ] Add glow to Search button
  [ ] Remove debounced auto-search
  [ ] All existing tests are updated

Phase 3 — Your Skills (depends on Phase 2 store refactor)
  [ ] Refactor UserSkillsModal to use local state
  [ ] Sync only on modal close

Phase 4 — Show More modal (depends on Phase 1 Modal)
  [ ] Convert ExpandableDescription to use Modal

Phase 5 — Match/Trust modals (depends on Phase 1 Modal + backend work)
  [ ] Backend: embed matchBreakdown in search response
  [ ] Backend: embed trustBreakdown in search response
  [ ] Frontend: MatchExplanation component
  [ ] Frontend: TrustExplanation component
  [ ] Frontend: Add info buttons to JobCard badges
```

### Technical constraints for Tech Lead

1. **`isDirty` must NOT be persisted**: Add it to the store but exclude it from the `partialize` function that controls Zustand persist. Otherwise, `isDirty=true` would survive page reloads.

2. **Page loads should auto-search**: When the page loads with persisted filters, the committed params should initialize from the store and trigger an immediate search (this is what happens today implicitly via the reactive flow).

3. **Pagination bypasses dirty check**: Page number changes should always trigger a fetch immediately. Page is already excluded from persisted state. Do NOT set `isDirty` when page changes.

4. **Reset filters should auto-search**: When "Reset all" is clicked in FiltersPanel, it should reset BOTH draft and committed state, and trigger a fresh search.

5. **Backend breakdown is optional on day one**: The explanation modals can ship with only the existing data (matchSummary text, trustScore number + trustLabel). Backend breakdown can be added as a follow-up to keep Cycle 1 lean.

6. **Tests for dirty state**: Write dedicated tests for the dirty state lifecycle: init (false) → filter change (true) → search click (false) → filter change (true) → etc.

### Effort estimate by phase

| Phase | Effort | Files | Dependencies |
|-------|--------|-------|-------------|
| Phase 1: Modal + Trust labels | Small | 2 | None |
| Phase 2: Search flow | **Large** | 6-8 | None (but high test impact) |
| Phase 3: Your Skills modal | Small | 1 | Phase 2 |
| Phase 4: Show More modal | Small | 2 | Phase 1 Modal |
| Phase 5: Match/Trust modals | Medium | 6-8 | Phase 1 Modal + Phase 2 (for the button wiring in JobCard) |
| **Total** | **Large** | **18-22** | |

### Recommended phasing

**MVP (this cycle):** Phases 1, 2, 3, 4 — these deliver the most UX impact (fix broken sort, show descriptive labels, control search timing, show full description properly).

**Follow-up cycle:** Phase 5 — match/trust explanation modals. These are "delight" features that depend on the Modal component (built in Phase 1) but require additional backend work.
