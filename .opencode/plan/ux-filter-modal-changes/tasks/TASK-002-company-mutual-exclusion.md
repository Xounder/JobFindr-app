# TASK-002 — Company Mutual Exclusion

**Layer:** Frontend
**Depends on:** TASK-001 (both modify `AutocompleteInput.tsx` and `CompanyFilters.tsx`)
**Epic origin:** EPIC-01-filter-input-improvements.md (Item 2: Company mutual exclusion)
**Agent:** Senior Frontend

## Description

Add mutual exclusion between Include Companies and Exclude Companies lists. When a company is added to the Include list, it should be automatically blocked from being added to the Exclude list (and vice versa). This requires adding an `excludeItems` prop to `AutocompleteInput` that filters out disallowed items from the suggestion dropdown and silently rejects attempts to add them.

## Files to Modify

- `apps/frontend/src/components/AutocompleteInput.tsx` — Add `excludeItems` prop, filter suggestions and reject additions
- `apps/frontend/src/components/CompanyFilters.tsx` — Pass cross-list items as `excludeItems`
- Existing test files — Add/update tests for exclusion behavior

## Deliverables

1. Add `excludeItems?: string[]` prop to `AutocompleteInput` component interface
2. Update suggestion filtering to exclude items present in `excludeItems` (in addition to `selectedItems`)
3. Update `addItem` logic to reject items present in `excludeItems` (silently — no error message, just does not add)
4. Wire `excludeItems={excluded}` in the Include Companies `AutocompleteInput` in `CompanyFilters.tsx`
5. Wire `excludeItems={included}` in the Exclude Companies `AutocompleteInput` in `CompanyFilters.tsx`
6. Ensure backward compatibility: callers without `excludeItems` keep current behavior
7. Add tests verifying:
   - Suggestions dropdown correctly filters out items from `excludeItems`
   - Attempting to add an excluded item is silently rejected
   - Each list correctly receives the other list's items as exclusion
   - Removing an item from one list makes it available in the other

## Implementation Notes

The `filtered` variable in `AutocompleteInput` currently filters:
```tsx
const filtered = suggestions.filter(
  (s) =>
    s.toLowerCase().includes(input.toLowerCase()) &&
    !selectedItems.includes(s),
);
```

Update to also filter out `excludeItems`:
```tsx
const filtered = suggestions.filter(
  (s) =>
    s.toLowerCase().includes(input.toLowerCase()) &&
    !selectedItems.includes(s) &&
    !(excludeItems ?? []).includes(s),
);
```

Also update `addItem` to check `excludeItems` before calling `onAdd`.

## Acceptance Criteria

- [ ] A company added to Include Companies is no longer selectable/suggestable in Exclude Companies
- [ ] A company added to Exclude Companies is no longer selectable/suggestable in Include Companies
- [ ] Typing a company name that exists in the other list is silently rejected (not added, no error shown)
- [ ] Removing a company from one list makes it immediately available in the other
- [ ] Existing callers without `excludeItems` remain unchanged (backward compatible)
- [ ] All existing tests pass (no regressions)
