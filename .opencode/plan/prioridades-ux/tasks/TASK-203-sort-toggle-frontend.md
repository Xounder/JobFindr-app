# TASK-203 — Create Sort Toggle UI

**Layer:** frontend
**Depends on:** TASK-201
**Epic origin:** `epics/epic-2-sort-toggle.md`

## Description

Create a sort toggle component that lets users switch between "Trust Score" (default) and "Match %" sorting. This is a full-stack frontend change: types, store, API client, hook, and component.

The toggle should be placed near the search results area (above the job list, between the "Showing X of Y results" text and the job cards) with a clear label and tooltip explaining each option.

## Technical Approach

### Files to modify/create

1. **`apps/frontend/src/types/index.ts`**
   - Add `sort: 'trust' | 'match'` to:
     - `SearchParams` interface (between `pageSize` and `userSkills`)
     - `FiltersState` interface (between `trustMin` and `userSkills`)

2. **`apps/frontend/src/store/searchStore.ts`**
   - Add `sort: 'trust'` to `initialState` (default: `'trust'`)
   - Add `setSort: (sort: 'trust' | 'match') => void` to the `SearchStore` interface
   - Implement `setSort` setter that updates `sort` and resets `page` to 1
   - Add `sort` to the `partialize` persist configuration

3. **`apps/frontend/src/services/api.ts`**
   - In the `searchJobs` function, serialize the `sort` parameter:
     ```typescript
     if (params.sort) {
       queryParams.sort = params.sort;
     }
     ```

4. **`apps/frontend/src/hooks/useJobSearch.ts`**
   - Destructure `sort` from `useSearchStore()` (add to line 17)
   - Add `sort` to the `searchParams` useMemo dependency list (line 35)
   - Ensure `sort` is included in the debounced params object
   - No other changes needed — the existing `searchJobs` call forwards all params

5. **`apps/frontend/src/components/SortToggle.tsx`** (CREATE)
   - Segmented control or dropdown with two options: "Trust Score" and "Match %"
   - Props: `value: 'trust' | 'match'`, `onChange: (value: 'trust' | 'match') => void`
   - Tooltip on each option explaining the sort order:
     - "Trust Score": "Sorted by provider trust score first, then match percentage"
     - "Match %": "Sorted by match percentage first, then provider trust score"
   - Accessible: proper `role="radiogroup"`, `aria-label`, keyboard navigation
   - Visual design: segmented button style matching the existing design system

6. **`apps/frontend/src/components/SortToggle.test.tsx`** (CREATE)
   - Renders both options
   - Clicking an option calls onChange with the correct value
   - Active option has correct visual state (aria-pressed or selected class)
   - Keyboard navigation works (ArrowLeft/ArrowRight or Tab)

7. **`apps/frontend/src/pages/HomePage.tsx`**
   - Import `SortToggle`
   - Render `<SortToggle>` above the job results list (between the "Showing X of Y results" text and the LoadingSkeleton/JobCard list)
   - Read `sort` from store, use `setSort` to update

### What NOT to change

- Do NOT modify backend types or ranking engine (already covered by TASK-201 and TASK-202)
- Do NOT modify the search validation
- Do NOT add `'relevance'` as a sort option in the toggle — only `'trust'` and `'match'`

## Deliverables

- [ ] `SearchParams` and `FiltersState` include `sort: 'trust' | 'match'`
- [ ] Zustand `searchStore` has `sort` field (default `'trust'`) with `setSort` setter, persisted in localStorage
- [ ] API client serializes `sort` in query params
- [ ] `useJobSearch` hook passes `sort` from store to API params
- [ ] `SortToggle.tsx` renders as a segmented control with "Trust Score" / "Match %"
- [ ] Toggle has tooltips explaining each option
- [ ] Changing the toggle triggers a new search with the updated sort order
- [ ] `SortToggle.test.tsx` covers toggle interactions and store updates
- [ ] All frontend tests pass
