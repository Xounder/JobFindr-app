# EPIC 03 — Fix "null" Initial Values in Filter Fields

## Objective

Fix filter fields displaying "null" as initial values when the page loads, which creates a broken and untrustworthy appearance.

## Motivation

After a fresh page load (or when localStorage contains corrupted/legacy data), filter fields such as autocomplete inputs render "null" as their displayed value. This happens because persisted Zustand state can contain `null` for array fields that previously had no value stored, or because the store initialization doesn't guard against missing data. This makes the UI look broken and confuses users.

## Deliverables

- Add Zustand persist migration v1 to clean up corrupted localStorage entries
- Add null coalescing guard in `AutocompleteInput.tsx` for defensive rendering

## Root Cause

Two contributing factors:
1. **Corrupted localStorage**: Previous sessions may have stored `null` values for array-type filter fields in the Zustand persist cache, and there is no migration mechanism to clean them up on load.
2. **Missing null guard**: Components like `AutocompleteInput.tsx` pass values directly to the UI without null coalescing, so `null` propagates to the visible field.

## Approach (Recommended)

**Approach A — Zustand persist migration + null coalescing:**
- Add a version field and `migrate` function to the filter store's `persist` configuration that converts `null` array fields to `[]`
- Add `?? []` guard in `AutocompleteInput.tsx` so the component safely handles any unexpected null values at render time

## Affected Files

- Filter Zustand store (persist config)
- `apps/frontend/src/components/filters/AutocompleteInput.tsx`

## Tasks

- [ ] Identify the filter Zustand store file and locate the `persist` configuration
- [ ] Add a `version: 1` field to the persist config
- [ ] Add a `migrate` function that converts `null` array fields to `[]`
- [ ] Add `?? []` null coalescing guard on the value prop in `AutocompleteInput.tsx`
- [ ] Test with both valid and corrupted localStorage entries
- [ ] Verify no regressions in filter autocomplete behavior for valid data

## Acceptance Criteria

- [ ] Filter autocomplete inputs never display "null" as a value on page load
- [ ] Corrupted localStorage entries from previous sessions are cleaned up on first load after the fix
- [ ] Fresh sessions (no localStorage) initialize correctly with empty arrays
- [ ] Valid existing filter data is preserved and unaffected by the migration
- [ ] No regressions in filter functionality (adding, removing, searching)

## Priority

Medium — visual bug that degrades perceived quality and trust.

## Effort

Small (~10 lines across 2 files).
