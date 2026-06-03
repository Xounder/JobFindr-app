# EPIC-02: Search Flow Rework — Draft/Commit Pattern

**Phase:** 2 — Search Flow
**Changes:** Change 4 (Search on button click only), Change 1 (Sort toggle bug — naturally fixed)
**Effort:** Large
**Dependencies:** None (self-contained, but largest test impact)

---

## Objective

Fundamentally shift the search flow from reactive (auto-search on every filter/sort change) to manual (search only on button click). This is the most impactful UX change in the cycle — it eliminates the sort toggle bug (Change 1), gives users control over when searches happen, and reduces unnecessary API calls.

---

## Deliverables

### 1. Draft/Commit Pattern in Search Store

**File:** `apps/frontend/src/store/searchStore.ts`

- Add `isDirty: boolean` to store state
- `isDirty` becomes `true` whenever query, sort, skills, seniority, or any filter changes
- `isDirty` becomes `false` when Search is clicked
- `isDirty` **must NOT be persisted** — exclude from Zustand `partialize`
- `isDirty` should NOT change on page number changes

### 2. Committed Search Params in HomePage

**File:** `apps/frontend/src/pages/HomePage.tsx`

- Add `committedParams` state or ref (snapshot of store values at time of Search click)
- Wire the Search button handler to snapshot current store values into committed params
- On page load: initialize committed params from persisted store values (auto-search)
- On "Reset filters": reset both draft AND committed params, trigger auto-search
- On pagination: use committed params + new page number (bypasses dirty check)

### 3. Modified useJobSearch Hook

**File:** `apps/frontend/src/hooks/useJobSearch.ts`

- Accept committed params as an argument instead of reading from the store
- Remove the 300ms debounce — fire the API call immediately
- Remove `placeholderData: (prev) => prev` to avoid showing stale results during fresh searches

### 4. Search Button Glow

**File:** `apps/frontend/src/components/SearchBar.tsx`

- Add `isDirty` prop to SearchBar
- When `isDirty === true`, the submit/search button shows a glow/pulse animation
- Use Tailwind classes: `animate-pulse` + accent color (e.g., amber/indigo glow)
- Glow disappears when Search is clicked (isDirty resets to false)

### 5. Dirty Flag Propagation

**Files:**
- `apps/frontend/src/components/SortToggle.tsx` — set `isDirty` on sort change
- `apps/frontend/src/components/FiltersPanel.tsx` — set `isDirty` on any filter change
- All filter components that modify the store must trigger the dirty flag

### 6. Sort Toggle Bug — Naturally Fixed

**Change 1** is automatically resolved by the new architecture:
- Sort changes only update the draft (local UI), not the API
- Only the Search button triggers API calls
- No debounce race conditions, no placeholderData confusion
- No separate effort needed

---

## Tasks

- [ ] Add `isDirty` state to `searchStore.ts` with setter
- [ ] Configure Zustand `partialize` to exclude `isDirty` from persistence
- [ ] Modify all store setters (setQuery, setSort, setSkills, setSeniority, etc.) to set `isDirty = true`
- [ ] Add `commitSearch()` action to store that snapshots current values and resets `isDirty`
- [ ] Add `committedParams` state/ref in `HomePage.tsx`
- [ ] Wire SearchBar `onSearch` to commit params and trigger search
- [ ] Handle page load: auto-search with persisted params (isDirty = false)
- [ ] Handle "Reset filters": reset committed params + auto-search
- [ ] Handle pagination: bypass dirty check, fetch with committed params + new page
- [ ] Refactor `useJobSearch` to accept committed params as argument, remove debounce, remove placeholderData
- [ ] Add `isDirty` prop to SearchBar component
- [ ] Implement glow/pulse animation on Search button when isDirty is true
- [ ] Add dirty flag propagation to SortToggle
- [ ] Add dirty flag propagation to FiltersPanel and all filter sub-components
- [ ] Write tests for dirty state lifecycle: init(false) → change(true) → search(false) → change(true)
- [ ] Update `useJobSearch.test.ts` — remove debounce tests, add committed params tests
- [ ] Update `HomePage.test.ts` — new search flow, dirty state, committed params
- [ ] Update `SearchBar.test.ts` — glow behavior, dirty prop
- [ ] Update `SortToggle.test.ts` — dirty flag callback
- [ ] Verify Zustand persisted state does NOT contain `isDirty`

---

## Acceptance Criteria

- [ ] **Search only fires on button click** — filter/sort changes do NOT trigger API calls
- [ ] **Page auto-search on load** — persisted filters trigger an immediate search on page load
- [ ] **Search button glows** with pulse animation when any filter/sort is dirty
- [ ] **Glow disappears** after Search is clicked
- [ ] **Sort toggle** works reliably — no more click-and-wait-for-nothing behavior
- [ ] **Sort toggle** sets dirty flag, does NOT trigger direct API call
- [ ] **Pagination** works immediately — clicking page numbers fetches without needing Search click
- [ ] **Pagination** does NOT set the dirty flag
- [ ] **Reset filters** resets draft AND committed state, triggers auto-search
- [ ] **isDirty is NOT persisted** — reloading the page shows isDirty=false
- [ ] **useJobSearch** has no debounce and no placeholderData
- [ ] All existing backend tests pass (no backend changes in this epic)
