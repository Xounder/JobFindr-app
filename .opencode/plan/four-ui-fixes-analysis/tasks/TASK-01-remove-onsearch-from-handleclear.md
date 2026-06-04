# TASK-01 — Remove `onSearch("")` from `handleClear`

**Layer:** frontend
**Depends on:** (none)
**Epic origin:** EPIC-01-search-bar-bug-fix.md

## Description

Remove the `onSearch("")` call from the `handleClear` callback in `SearchBar.tsx`. The clear button ("x") should only clear the search input text — it should NOT trigger a search request.

## Current Buggy Code (lines 105-111)

```tsx
const handleClear = useCallback(() => {
  setValue("");
  onSearch("");   // ← THIS LINE triggers an unwanted search
  setShowSuggestions(false);
  setHighlightedIndex(-1);
  inputRef.current?.focus();
}, [onSearch]);
```

## Deliverable

Remove the `onSearch("")` line from `handleClear`. Also clean up the dependency array — `onSearch` should be removed from the `useCallback` deps since it's no longer referenced.

## Expected Result After Fix

```tsx
const handleClear = useCallback(() => {
  setValue("");
  setShowSuggestions(false);
  setHighlightedIndex(-1);
  inputRef.current?.focus();
}, []);
```

- `onSearch("")` removed (line removed)
- `onSearch` removed from `useCallback` dependency array
- No other changes to `handleClear`

## Acceptance Criteria

- [ ] Clicking the "x" clear button clears the input field text
- [ ] Clicking the "x" clear button does **not** trigger a network request
- [ ] Typing a new query after clearing and clicking "Search" still works normally
- [ ] Pressing Enter after clearing still triggers a search
- [ ] No TypeScript errors (no unused `onSearch` reference warnings)
- [ ] All tests pass after running `pnpm --filter frontend test`

## Files to Modify

- `apps/frontend/src/components/SearchBar.tsx` — remove `onSearch("")` from `handleClear` and update deps
