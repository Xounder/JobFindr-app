# TASK-001 — Clean Button on AutocompleteInput

**Layer:** Frontend
**Depends on:** None
**Epic origin:** EPIC-01-filter-input-improvements.md (Item 1: Clean button)
**Agent:** Senior Frontend

## Description

Replace the "Add" button in `AutocompleteInput` with a "Clean" button when the `onClear` prop is provided. The Clean button clears all selected items at once. Wire the new prop in all callers: `CompanyFilters` (Include + Exclude), `SkillsTagsInput` (Required Skills), and `UserSkillsModal` ("Add your skills").

## Files to Modify

- `apps/frontend/src/components/AutocompleteInput.tsx` — Add `onClear` prop, conditionally render "Clean" vs "Add"
- `apps/frontend/src/components/CompanyFilters.tsx` — Pass `onClear` to both Include and Exclude inputs
- `apps/frontend/src/components/SkillsTagsInput.tsx` — Pass `onClear` to Required Skills input
- `apps/frontend/src/components/UserSkillsModal.tsx` — Pass `onClear` to "Add your skills" input
- `apps/frontend/src/components/AutocompleteInput.test.tsx` (or create) — Tests for Clean button behavior

## Deliverables

1. Add `onClear?: () => void` prop to `AutocompleteInput` component interface
2. When `onClear` is provided, render a "Clean" button instead of "Add"
3. Disable the Clean button when `selectedItems.length === 0`
4. Add a `clearLabel?: string` prop (default: "Clean") for future extensibility
5. Wire `onClear` in `CompanyFilters.tsx` for both Include and Exclude inputs
6. Wire `onClear` in `SkillsTagsInput.tsx` for Required Skills input
7. Wire `onClear` in `UserSkillsModal.tsx` for "Add your skills" input
8. Ensure backward compatibility: callers without `onClear` keep the "Add" button
9. Add tests verifying:
   - Clean button renders when `onClear` is provided
   - Clean button is disabled when no items are selected
   - Clicking Clean calls `onClear` and clears all items
   - "Add" button still renders when `onClear` is not provided

## Implementation Notes

The `AutocompleteInput` component is at `apps/frontend/src/components/AutocompleteInput.tsx`. Current interface:

```tsx
interface AutocompleteInputProps {
  id: string;
  label: string;
  placeholder: string;
  suggestions: string[];
  selectedItems: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  renderTag: (item: string, onRemove: (item: string) => void) => React.ReactNode;
  buttonLabel?: string;
}
```

Add `onClear?: () => void` and `clearLabel?: string`. When `onClear` is provided, render the button as "Clean" (using `clearLabel`), otherwise keep "Add" using `buttonLabel`.

## Acceptance Criteria

- [ ] All `AutocompleteInput` instances that should show "Clean" display a "Clean" button
- [ ] Clean button is disabled when no items are selected
- [ ] Clicking Clean removes all selected items and clears the input
- [ ] Existing callers without `onClear` remain unchanged (still show "Add")
- [ ] All existing tests pass (no regressions)
