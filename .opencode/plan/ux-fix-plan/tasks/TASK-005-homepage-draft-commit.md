# TASK-005 — Implement Draft/Commit Pattern in HomePage

**Layer:** Frontend
**Depends on:** TASK-003 (isDirty store), TASK-004 (useJobSearch refactor)
**Epic origin:** EPIC-02-search-flow-rework (Phase 2 — Search Flow)

## Description

This is the core integration task for the search flow rework. Refactor `HomePage` to implement the draft/commit pattern: the store holds "draft" state (what the user sees in the UI), while a separate `committedParams` ref holds the last committed snapshot. The `useJobSearch` hook reads from committed params, not the store directly. This change also eliminates the debounced query sync and the sort toggle bug.

## Files to Modify

| File | Change |
|------|--------|
| `apps/frontend/src/pages/HomePage.tsx` | Major refactor: draft/commit pattern |
| `apps/frontend/src/pages/HomePage.test.tsx` | **Create new** test file |
| `apps/frontend/src/pages/__snapshots__/` | Possibly update snapshots |

## Current State

```tsx
// HomePage currently:
// 1. Reads ALL store values
// 2. Uses local debounced query sync (400ms) to store
// 3. Calls useJobSearch() with no args (reads store internally)
// 4. All filter changes auto-trigger API calls via debounced store
```

## Specification

### New Architecture

```
┌────────────────────────────────────────────────┐
│  Draft State (Zustand store — for UI only)     │
│  query, sort, skills, seniority, ...           │
│  User changes these freely → isDirty=true      │
│  Page changes → bypasses isDirty               │
└──────────────┬─────────────────────────────────┘
               │ On "Search" click
               ▼
┌────────────────────────────────────────────────┐
│  Committed Snapshot (useRef in HomePage)        │
│  Frozen copy of draft at time of Search click   │
│  Updated on: Search click, page load,           │
│  reset filters, pagination                      │
└──────────────┬─────────────────────────────────┘
               │ Feeds into
               ▼
┌────────────────────────────────────────────────┐
│  useJobSearch(committedParams)                  │
│  No debounce — fires immediately               │
└────────────────────────────────────────────────┘
```

### Detailed Changes

#### 1. Remove Debounced Query Sync

Remove the local query state (`localQuery`), `useDebounce(localQuery, 400)`, and the `useEffect` that syncs it to the store. The SearchBar's `onSearch` now directly commits.

#### 2. Add committedParams Ref

```typescript
const committedParams = useRef<SearchParams>(/* initialize from store */);
```

Initialize from the current store values on first render (for page-load auto-search).

#### 3. Add commitSearch Handler

```typescript
const handleCommitSearch = useCallback(() => {
  const state = useSearchStore.getState();
  committedParams.current = {
    q: state.query,
    skills: state.skills,
    // ... all search params from store
    page: state.page,
    pageSize: state.pageSize,
  };
  useSearchStore.getState().commitSearch();
}, []);
```

This snaps all store values into committedParams and resets the dirty flag.

#### 4. Wire SearchBar onSearch

When SearchBar calls `onSearch(query)`:
1. Set the store's query to this value (creates draft update, sets isDirty)
2. Call `handleCommitSearch()` to snapshot and trigger search

```typescript
const handleSearch = useCallback((query: string) => {
  useSearchStore.getState().setQuery(query);  // sets isDirty
  handleCommitSearch();                        // commits + resets dirty
}, [handleCommitSearch]);
```

#### 5. Handle Page Load Auto-Search

On initial mount, committed params should initialize from the persisted store and trigger an immediate search. This replicates the current behavior where page load triggers a search with persisted filters.

```typescript
const [initialized, setInitialized] = useState(false);

useEffect(() => {
  if (!initialized) {
    handleCommitSearch();
    setInitialized(true);
  }
}, [initialized, handleCommitSearch]);
```

Or simpler: just initialize `committedParams` with a ref that reads store values on first render, and `useJobSearch` will fire when the component mounts.

#### 6. Handle Pagination

Pagination must bypass the dirty flag. When `setPage` is called:
1. Update the store's page (draft state)
2. Update committedParams.page directly
3. DO NOT set isDirty
4. DO NOT call commitSearch (which would snapshot other params unnecessarily)

```typescript
const handlePageChange = useCallback((newPage: number) => {
  useSearchStore.getState().setPage(newPage);
  committedParams.current = {
    ...committedParams.current,
    page: newPage,
  };
}, []);
```

#### 7. Handle Reset Filters

"Reset all" should:
1. Call store's `resetFilters()` (which resets draft + sets isDirty=false)
2. Call `handleCommitSearch()` to refresh committed params
3. Trigger auto-search

```typescript
const handleResetFilters = useCallback(() => {
  useSearchStore.getState().resetFilters();
  handleCommitSearch();
}, [handleCommitSearch]);
```

#### 8. Pass isDirty to SearchBar

Read `isDirty` from the store and pass it to SearchBar:

```typescript
const isDirty = useSearchStore((s) => s.isDirty);

// In JSX:
<SearchBar
  initialQuery={query}
  onSearch={handleSearch}
  isDirty={isDirty}
/>
```

#### 9. Pass Committed Params to useJobSearch

```typescript
const { data, isLoading, isFetching, isError, error } = useJobSearch(committedParams.current);
```

Note: Since `committedParams` is a ref, changes to `committedParams.current` won't trigger re-renders. The hook needs the latest committed params. This can be handled by:
- Using `useState` for committed params (triggers re-render on commit)
- Or using a counter state that increments on commit, and `useJobSearch` reads the ref internally

**Recommendation:** Use a `useState` for committed params so that the component re-renders when committed params change, triggering `useJobSearch` with new values.

#### 10. Remove Old Query/Store Draft Binding

Remove the direct reading of all store values that were previously used for `FiltersPanel` props. Each filter component still gets its onChange from the store setter, but the data flow for results now goes through committed params.

Keep the store reads for `FiltersPanel` prop values (the panel shows current draft state).

### Key Behaviors to Preserve

1. **Page loads** with persisted filters trigger an immediate search
2. **Search button** commits all draft params and fetches
3. **Filter changes** update UI (draft) but don't fetch — button glows
4. **Sort toggle** changes only set isDirty — no direct API call (fixes the sort bug)
5. **Pagination** fetches immediately, does NOT set dirty flag
6. **Reset filters** resets everything and auto-searches

### Test File (`HomePage.test.tsx`)

Create tests covering:
- Page load triggers initial search with persisted params
- Filter change sets isDirty (does NOT trigger search)
- Search button click commits and triggers search
- Sort toggle changes set isDirty but do NOT trigger search
- Pagination triggers search WITHOUT setting isDirty
- Reset filters resets both draft and committed, triggers search
- Dirty state lifecycle: init(false) → change(true) → search(false) → change(true)
- SearchBar receives isDirty prop correctly

## Acceptance Criteria

- [ ] Search only fires on Search button click (or Enter key in SearchBar)
- [ ] Page load triggers auto-search with persisted filters
- [ ] Filter/sort changes set isDirty but do NOT trigger API calls
- [ ] Sort toggle works reliably (bug fixed — no race conditions)
- [ ] Pagination works immediately (no need to click Search)
- [ ] Pagination does NOT set the dirty flag
- [ ] Reset filters resets both draft and committed state, triggers search
- [ ] `isDirty` prop is correctly passed to SearchBar
- [ ] `useJobSearch` receives committed (not draft) params
- [ ] All existing tests for HomePage are updated/created
- [ ] The old `useJobSearch()` call with no args is completely replaced

## Related Tasks

- TASK-006 adds the SearchBar glow animation using the `isDirty` prop
- TASK-007 depends on this draft/commit pattern for UserSkillsModal
