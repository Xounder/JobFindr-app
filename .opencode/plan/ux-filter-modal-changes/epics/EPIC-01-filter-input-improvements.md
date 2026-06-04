# EPIC-01: Filter Input Improvements

**Source Items:** Item 1 (Clean button) + Item 2 (Company mutual exclusion)
**Layer:** Frontend-only
**Effort:** Small-Medium
**Dependencies:** None
**Source Docs:** `item-1-clean-button.md`, `item-2-company-exclusion.md`

## Objective

Improve the usability of filter inputs in the search sidebar by replacing the "Add" button with a "Clean" button (clears selections) and adding mutual exclusion between the Include/Exclude company lists so the same company cannot appear in both simultaneously.

## Deliverables

1. **Clean button** — `AutocompleteInput` gains an `onClear` prop; when provided, the button renders as "Clean" instead of "Add" and clears all selected items
2. **Company mutual exclusion** — `AutocompleteInput` gains an `excludeItems` prop; `CompanyFilters` passes cross-list items so a company in Include is blocked from Exclude and vice versa

## Tasks

- [ ] Add `onClear?: () => void` prop to `AutocompleteInput` component
- [ ] When `onClear` is provided, render "Clean" button instead of "Add"
- [ ] Disable Clean button when `selectedItems.length === 0`
- [ ] Wire `onClear` in `CompanyFilters.tsx` for both Include and Exclude inputs
- [ ] Wire `onClear` in `SkillsTagsInput.tsx` for Required Skills input
- [ ] Wire `onClear` in `UserSkillsModal.tsx` for "Add your skills" input (see EPIC-02)
- [ ] Add `excludeItems?: string[]` prop to `AutocompleteInput`
- [ ] Update suggestion filtering to exclude items in `excludeItems`
- [ ] Update `addItem` logic to reject items present in `excludeItems`
- [ ] Wire `excludeItems={excluded}` in Include Companies input
- [ ] Wire `excludeItems={included}` in Exclude Companies input
- [ ] Ensure backward compatibility: existing callers without `onClear`/`excludeItems` keep "Add" button and current behavior

## Acceptance Criteria

- [ ] All `AutocompleteInput` instances that should show "Clean" (Required Skills, Include Companies, Exclude Companies, Add your skills) display a "Clean" button instead of "Add"
- [ ] Clean button is disabled when no items are selected
- [ ] Clicking Clean removes all selected items and clears the input
- [ ] A company added to Include Companies is no longer selectable/suggestable in Exclude Companies
- [ ] A company added to Exclude Companies is no longer selectable/suggestable in Include Companies
- [ ] Typing a company name that exists in the other list is silently rejected (not added)
- [ ] Existing callers not using `onClear`/`excludeItems` remain unchanged (backward compatible)
- [ ] All existing tests pass (no regressions)
- [ ] Suggestion dropdown correctly filters out items from both `selectedItems` and `excludeItems`
