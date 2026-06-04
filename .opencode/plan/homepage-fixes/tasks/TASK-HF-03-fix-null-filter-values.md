# TASK-HF-03 — Fix "null" Initial Values in Filter Fields

**Layer:** frontend
**Depends on:** None
**Epic origin:** [EPIC-03-fix-null-filter-values.md](../epics/EPIC-03-fix-null-filter-values.md)

## Description

Fix filter fields displaying "null" as initial values when the page loads, which creates a broken and untrustworthy appearance.

### Root Cause

Two contributing factors:

1. **Corrupted localStorage**: Previous sessions may have stored `null` values for array-type filter fields in the Zustand persist cache (`jobfindr-filters`). The store has `version: 1` but no `migrate` function to clean up corrupted entries on load.
2. **Missing null guard**: `AutocompleteInput.tsx` passes the `selectedItems` prop directly to rendering logic without null coalescing, so `null` propagates to the visible UI field.

## Deliverables

1. **Add persist `migrate` function** in `apps/frontend/src/store/searchStore.ts`:
   - Add a `migrate` function to the `persist` configuration
   - Convert any `null` array fields (`skills`, `remoteMode`, `countries`, `companies`, `excludeCompanies`, `userSkills`) to `[]`
   - Handle the case where the persisted state is completely `null` or undefined
   - Keep `version: 1` (already present)

2. **Add null coalescing guard** in `apps/frontend/src/components/AutocompleteInput.tsx`:
   - Add `?? []` guard when using the `selectedItems` prop value inside the component to safely handle unexpected `null` values at render time
   - This is a defensive measure that protects against any future null values regardless of the migration

3. **Test with both valid and corrupted localStorage entries**:
   - Clear localStorage → reload → verify empty arrays
   - Manually set `localStorage.setItem("jobfindr-filters", '{"skills":null,"state":{"skills":null},"version":0}')` → reload → verify migration cleans it up
   - Set valid data → reload → verify data is preserved

## Acceptance Criteria

- [ ] Filter autocomplete inputs never display "null" as a value on page load
- [ ] Corrupted localStorage entries from previous sessions are cleaned up on first load after the fix
- [ ] Fresh sessions (no localStorage) initialize correctly with empty arrays
- [ ] Valid existing filter data is preserved and unaffected by the migration
- [ ] No regressions in filter functionality (adding, removing, searching)

## Files Changed

- `apps/frontend/src/store/searchStore.ts` — Add `migrate` function in persist config (~5-8 lines)
- `apps/frontend/src/components/AutocompleteInput.tsx` — Add `?? []` guard (~1-2 lines)

## Technical Notes

- The persist config is at the bottom of `searchStore.ts` (around lines 64-81). It already has `name: "jobfindr-filters"` and `version: 1`.
- The `migrate` function signature: `migrate: (persistedState: unknown, version: number) => PersistedState`
- Only array fields that could be `null` need migration: `skills`, `remoteMode`, `countries`, `companies`, `excludeCompanies`, `userSkills`
- In `AutocompleteInput.tsx`, the `selectedItems` prop is used in several places:
  - Line 40: `!selectedItems.includes(s)` — would crash on `null`
  - Line 48: `!selectedItems.includes(trimmed)` — would crash on `null`
  - Line 118: `selectedItems.length === 0` — would crash on `null`
  - Line 155: `selectedItems.map(...)` — would crash on `null`
  - The guard `?? []` should be applied where `selectedItems` is first used in the component body, or at the top with a local alias
