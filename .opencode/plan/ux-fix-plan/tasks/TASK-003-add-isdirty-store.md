# TASK-003 — Add isDirty State and commitSearch Action to Search Store

**Layer:** Frontend
**Depends on:** None
**Epic origin:** EPIC-02-search-flow-rework (Phase 2 — Search Flow)

## Description

Add an `isDirty` flag to the Zustand search store that tracks whether any search parameter has been modified since the last committed search. Also add a `commitSearch()` action that resets the dirty flag. This is the foundation of the draft/commit pattern.

## File to Modify

| File | Change |
|------|--------|
| `apps/frontend/src/store/searchStore.ts` | Add isDirty, commitSearch, modify all setters |

## Current State

```typescript
interface SearchStore extends FiltersState {
  page: number;
  pageSize: number;
  setQuery: (query: string) => void;
  setSkills: (skills: string[]) => void;
  setSeniority: (seniority: string) => void;
  // ... more setters
  setSort: (sort: "trust" | "match") => void;
  setUserSkills: (skills: string[]) => void;
  setUserSeniority: (seniority: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
}
```

All setters currently set `{ [field]: value, page: 1 }` — they reset the page to 1 on any filter change.

## Specification

### 1. Add isDirty to Store Interface

```typescript
interface SearchStore extends FiltersState {
  // ... existing properties
  isDirty: boolean;
  // ... existing setters
  commitSearch: () => void;  // NEW
}
```

### 2. Add isDirty to Initial State

```typescript
const initialState: FiltersState & { isDirty: boolean } = {
  // ... existing
  isDirty: false,
};
```

### 3. Modify All Setters (EXCEPT setPage and setPageSize)

Every setter that modifies a search parameter must also set `isDirty: true`:

| Setter | Sets isDirty? | Notes |
|--------|---------------|-------|
| `setQuery` | ✅ Yes | |
| `setSkills` | ✅ Yes | |
| `setSeniority` | ✅ Yes | |
| `setRemoteMode` | ✅ Yes | |
| `setCountries` | ✅ Yes | |
| `setCompanies` | ✅ Yes | |
| `setExcludeCompanies` | ✅ Yes | |
| `setTrustMin` | ✅ Yes | |
| `setSort` | ✅ Yes | |
| `setUserSkills` | ✅ Yes | |
| `setUserSeniority` | ✅ Yes | |
| `setPage` | ❌ No | Pagination bypasses dirty check |
| `setPageSize` | ❌ No | Page size change does not set dirty |

Each setter format:
```typescript
setQuery: (query) => set({ query, page: 1, isDirty: true }),
```

### 4. Add commitSearch Action

```typescript
commitSearch: () => set({ isDirty: false }),
```

Note: Only resets the dirty flag. The actual committed params snapshot is managed by HomePage (TASK-005).

### 5. Modify resetFilters

`resetFilters` should reset all filter state PLUS set `isDirty: false`:

```typescript
resetFilters: () => set({ ...initialState, page: 1, isDirty: false }),
```

### 6. Exclude isDirty from Persistence

The `partialize` function in the Zustand `persist` middleware must exclude `isDirty`:

```typescript
partialize: (state) => ({
  query: state.query,
  skills: state.skills,
  // ... all persisted fields
  // DO NOT include isDirty
}),
```

This ensures `isDirty` is always `false` on page load, regardless of what was stored.

## Acceptance Criteria

- [ ] `isDirty` state exists in the store, initialized to `false`
- [ ] Every search-parameter setter sets `isDirty: true` (except `setPage`, `setPageSize`)
- [ ] `commitSearch()` sets `isDirty: false`
- [ ] `resetFilters()` resets all filters to initial AND sets `isDirty: false`
- [ ] `isDirty` is NOT included in persisted state (check via `partialize`)
- [ ] `setPage()` does NOT modify `isDirty`
- [ ] All existing store tests pass (or are updated if they test behavior that changed)
- [ ] Existing store API for all other features remains backward-compatible

## Files NOT Modified

No files outside `searchStore.ts` are changed in this task.
