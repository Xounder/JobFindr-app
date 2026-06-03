# TASK-004 — Refactor useJobSearch to Accept Committed Params

**Layer:** Frontend
**Depends on:** TASK-003 (isDirty store)
**Epic origin:** EPIC-02-search-flow-rework (Phase 2 — Search Flow)

## Description

Refactor the `useJobSearch` hook to accept committed search parameters as an argument instead of reading from the store directly. Remove the 300ms debounce and the `placeholderData` option. The hook should fire API calls immediately when committed params change.

## Files to Modify

| File | Change |
|------|--------|
| `apps/frontend/src/hooks/useJobSearch.ts` | Refactor signature and internals |
| `apps/frontend/src/hooks/useJobSearch.test.ts` | **Create new** test file with updated tests |

## Current State

```typescript
export function useJobSearch() {
  const { query, skills, seniority, ... } = useSearchStore();

  const searchParams = useMemo(() => ({ ... }), [deps]);

  const debouncedParams = useDebounce(searchParams, 300);

  const result = useQuery<SearchResponse>({
    queryKey: ["jobs", "search", debouncedParams],
    queryFn: () => searchJobs(debouncedParams),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  return result;
}
```

## Specification

### New Hook Signature

```typescript
import type { SearchParams } from "@/types";

export function useJobSearch(params: SearchParams) {
  // No store access
  // No debounce
  // No placeholderData
  // Direct useQuery with params
}
```

### Detailed Changes

1. **Remove** store access (`useSearchStore()`)
2. **Remove** `useDebounce` import and usage
3. **Remove** `placeholderData: (prev) => prev`
4. **Accept** `params: SearchParams` as the single argument
5. **Keep** `staleTime: 30_000` — this is still useful to avoid refetching identical params
6. **Keep** the same return type — `useQuery<SearchResponse>` result
7. **Update** `queryKey` to use the passed `params` directly: `["jobs", "search", params]`
8. **Update** `queryFn` to call `searchJobs(params)` with the passed params

### Edge Cases

- If `params` reference changes but values are the same, TanStack Query's default comparison should handle it (no unnecessary refetch)
- No debounce delay — API calls fire immediately on param change
- No stale UI — every new query replaces results immediately

### Test File (`useJobSearch.test.ts`)

Create new tests covering:

- **Basic rendering:** hook calls `searchJobs` with the provided params
- **Query key:** changes when params change
- **No debounce:** searchJobs is called immediately on render
- **No placeholder data:** there is no `placeholderData` in the query config
- **staleTime:** preserved at 30_000
- **Params change:** changing params triggers a new query (different query key)
- **Same params, different reference:** should NOT trigger a new fetch (TanStack Query handles this)

## Acceptance Criteria

- [ ] `useJobSearch` accepts `params: SearchParams` as argument
- [ ] `useJobSearch` does NOT read from `useSearchStore`
- [ ] No debounce — API call fires immediately when hook renders
- [ ] No `placeholderData` — no stale results shown during loading
- [ ] `staleTime: 30_000` is preserved
- [ ] `queryKey` is `["jobs", "search", params]`
- [ ] `queryFn` calls `searchJobs(params)`
- [ ] All new tests pass (no existing tests for this hook since it didn't have a test file)
- [ ] SearchBar's `onClear` still works — clearing calls `onSearch("")` which triggers re-fetch

## Dependencies

- This hook will be used by HomePage (TASK-005) which passes committed params
- The old `useJobSearch()` callers (HomePage) must be updated in TASK-005
