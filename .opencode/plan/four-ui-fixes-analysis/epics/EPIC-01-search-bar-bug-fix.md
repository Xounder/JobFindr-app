# EPIC-01: Search Bar Bug Fix

**Change:** #4 — Search bar clear ("x") button triggers unwanted search
**Priority:** 🔴 Highest (bug fix)
**Effort:** Tiny (~5 min)
**Dependencies:** None

---

## Objective

Fix the clear button ("x") in the search bar so that it only clears the input field without triggering an immediate search request. The search should only be fired when the user clicks the "Search" button, presses Enter, or clicks a suggestion.

## Root Cause

In `SearchBar.tsx`, the `handleClear` callback calls `onSearch("")` immediately after clearing the input value. This propagates to `HomePage.tsx`, which calls `setQuery("")` and fires an API request — even though the user has not explicitly initiated a search.

```tsx
// Buggy code (lines 105-111):
const handleClear = useCallback(() => {
  setValue("");
  onSearch("");   // ← THIS LINE triggers an unwanted search
  setShowSuggestions(false);
  setHighlightedIndex(-1);
  inputRef.current?.focus();
}, [onSearch]);
```

## Deliverables

- [ ] `SearchBar.tsx` — `onSearch("")` removed from `handleClear`
- [ ] `SearchBar.test.tsx` — existing test updated to validate that `onSearch` is NOT called on clear

## Tasks

- [ ] **Task 1.1:** Remove `onSearch("")` from `handleClear` in `SearchBar.tsx` (1 line removed)
- [ ] **Task 1.2:** Update `SearchBar.test.tsx` — the test at line 69 (`"clears input and calls onSearch with empty string on clear"`) currently validates the buggy behavior. Update it to expect that `onSearch` is NOT called when clearing.

## Acceptance Criteria

- [ ] Clicking the "x" clear button clears the input field text
- [ ] Clicking the "x" clear button does **not** trigger a network request (no API call)
- [ ] Typing a new query after clearing and clicking "Search" still works normally
- [ ] Pressing Enter after clearing still triggers a search
- [ ] All existing tests pass (with the updated test reflecting the correct behavior)
