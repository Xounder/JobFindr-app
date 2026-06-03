# Feasibility — UX Fix Plan

## Change 1 — Fix sort toggle (trust score / match %)

### Root cause analysis

The sort toggle calls `useSearchStore.setSort(value)`, which updates the Zustand store. The `useJobSearch` hook reads this value, recomputes `searchParams` via `useMemo`, passes it through `useDebounce(300ms)`, and feeds it to `useQuery` as part of the query key `["jobs", "search", debouncedParams]`.

The intermittent nature (both slow and fast clicks) suggests multiple contributing factors:

1. **Debounce window (300ms)**: If the user clicks Match, then clicks Trust again before the debounce resolves, the second click restarts the timer. The first click is effectively lost. The UI appears to do nothing for 300ms + API latency.

2. **`placeholderData: (prev) => prev`**: While a new sort query is loading, the UI shows the PREVIOUS page's results (sorted by the OLD sort). This makes it look like "nothing changed" for 300ms + fetch time.

3. **Aggregated cache on backend**: The cache key includes `sort`. If a previous identical request (same params + same sort) exists in cache, the cached results return without any visible loading indicator, making sort changes appear instant OR appear to not work if they overlap with another query.

4. **Store `setSort` also resets page to 1**: This triggers an additional state change (page: 1) which may cause extra re-renders and debounce resets.

### Approach: Fix within current architecture

**Description:** Increase debounce stability and add explicit sort-change tracking.
- Set `staleTime: 0` so every sort change triggers a fetch regardless of cache
- Remove `placeholderData` to avoid showing stale results
- Add a `sortChangeFlag` ref to detect and force re-fetch
- **Effort:** Small (2-3 files)
- **Cons:** Band-aid fix; the fundamental reactive-search architecture remains fragile

### Approach: Fix via manual search (Recommended)

**Description:** This bug is naturally eliminated by Change 4 (search button). When search is manual:
- Sort changes only update the UI (draft state), not the API
- Only the Search button click triggers API calls
- No debounce race conditions, no placeholderData confusion
- **Effort:** Merged with Change 4 (covered below)
- **Pros:** Permanent fix, eliminates entire class of reactive-search bugs

---

## Change 2 — Trust descriptions on slider

### Approach: Inline label + scale markers

**Description:** Modify `TrustFilters.tsx` to:
- Show the trust label (from `trustLabel()`) next to the current value
- Add labeled tick marks along the slider showing all 6 trust levels
- The label updates in real-time as the slider moves

**Effort:** Small — 1 file, ~15 lines changed
**Files touched:** `apps/frontend/src/components/TrustFilters.tsx`

---

## Change 3 — Your Skills: sync only on modal close

### Approach: Local state inside modal

**Description:** 
- `UserSkillsModal` receives `userSkills` and `userSeniority` as initial values (via props)
- Creates local copies (`localSkills`, `localSeniority`) via `useState`
- All add/remove/seniority changes operate on local state only
- On close (`onClose` callback), sync local state to store via the prop callbacks
- On cancel/Escape, discard local changes

**Edge cases:**
- If user adds skills AND moves them to Required within the modal — this needs to sync on close too. The `onMoveToRequired` currently updates the store immediately (required skills + remove from userSkills). With local state, moves should operate on local state and batch-sync on close.
- "Remove all skills" with confirmation should also be local

**Effort:** Small — 1 file, ~30 lines changed
**Files touched:** `apps/frontend/src/components/UserSkillsModal.tsx`

---

## Change 4 — Search on button click only

### Approach: Draft/committed split + isDirty flag

**Description:** This is the most impactful change. It fundamentally shifts from reactive search to manual search.

**Architecture:**
```
┌────────────────────────────────────────────────┐
│  Draft State (Zustand store — for UI only)     │
│  query, sort, skills, seniority, ...           │
│  User changes these freely → UI updates        │
└──────────────┬─────────────────────────────────┘
               │ On "Search" click
               ▼
┌────────────────────────────────────────────────┐
│  Committed Snapshot (ref or separate state)     │
│  Frozen copy of draft at time of Search click   │
└──────────────┬─────────────────────────────────┘
               │ Feeds into
               ▼
┌────────────────────────────────────────────────┐
│  useJobSearch (uses committed params only)      │
│  No debounce — fires immediately               │
└────────────────────────────────────────────────┘
```

**Key components:**

1. **`isDirty` flag**: A boolean that becomes `true` whenever any filter/sort/query changes (set in store setters). Becomes `false` when Search is clicked.

2. **Search button glow**: The SearchBar's submit button applies a CSS animation/pulse when `isDirty === true`. Tailwind classes like `animate-pulse` + a different color (e.g., amber/indigo glow).

3. **Committed search params**: Stored in a `useRef` inside `HomePage` or a separate store slice. Initially populated with current store values. Updated only on Search click.

4. **useJobSearch modification**: No longer reads directly from the store. Accepts the committed params as an argument.

**Files touched:**
- `apps/frontend/src/store/searchStore.ts` — add `isDirty` state
- `apps/frontend/src/hooks/useJobSearch.ts` — accept committed params, remove debounce
- `apps/frontend/src/pages/HomePage.tsx` — add committed params ref, wire Search handler, pass to useJobSearch
- `apps/frontend/src/components/SearchBar.tsx` — glow effect on button
- `apps/frontend/src/components/SortToggle.tsx` — set isDirty on change
- `apps/frontend/src/components/FiltersPanel.tsx` — set isDirty on all filter changes

**Effort:** Medium — 6 files

---

## Change 5 — Match% explanation modal

### Approach: Reusable Modal + existing data + backend endpoint

**Description:**
- Create a generic `Modal` component (shared with changes 6, 7)
- Add a clickable info icon (ℹ️ or ⓘ) next to the match% badge in `JobCard`
- Clicking opens a modal showing:
  - Overall match score (already in `job.matchScore`)
  - Match summary text (already in `job.matchSummary`)
  - Detailed breakdown from a new backend endpoint: `GET /jobs/:id/match-explanation`
  - Backend returns: matched skills, unmatched skills, seniority match, weight breakdown

**Backend endpoint:** `GET /jobs/search/match-explanation` or extend the search response to include match breakdown. The user prefers a separate endpoint for richer data. However, since jobs are stateless (no DB), the explanation must be computed on-the-fly or the raw data must be embedded in the response.

**Alternative:** Embed `matchBreakdown` (matchedSkills, unmatchedSkills, etc.) in the existing search response to avoid a second API call. This is simpler and has better UX (no loading state in modal).

**Recommended: Embed breakdown in SearchResponse**

**Files touched:**
- NEW: `apps/frontend/src/components/Modal.tsx`
- NEW: `apps/frontend/src/components/MatchExplanation.tsx`
- `apps/frontend/src/components/JobCard.tsx`
- `apps/frontend/src/types/index.ts` (add breakdown types)
- `apps/backend/src/modules/matchmaking/` (add breakdown to response)
- `apps/backend/src/modules/search/` (pass breakdown through)

**Effort:** Medium — 5-6 files (frontend + backend)

---

## Change 6 — Trust score explanation modal

### Approach: Same Modal + existing data + backend detail

**Description:** Same pattern as Change 5.
- Info icon next to trust badge in `JobCard`
- Modal shows:
  - Trust score (already in `job.trustScore`)
  - Trust label (from `trustLabel()`)
  - Provider reputation, company adjustments, freshness signals
  - Could embed `trustBreakdown` in SearchResponse or fetch from endpoint

**Recommended: Embed `trustBreakdown` in SearchResponse** for same reason — avoids extra API calls.

**Files touched:**
- `apps/frontend/src/components/Modal.tsx` (shared, from Change 5)
- NEW: `apps/frontend/src/components/TrustExplanation.tsx`
- `apps/frontend/src/components/JobCard.tsx`
- `apps/frontend/src/types/index.ts`
- `apps/backend/src/modules/trust/` (add breakdown)

**Effort:** Medium — 4-5 files

---

## Change 7 — "Show more" opens modal

### Approach: Replace inline toggle with modal

**Description:** 
- `ExpandableDescription` currently toggles full text inline
- Replace the inline expand/collapse with a "Show more" button that opens the reusable Modal
- Modal shows the full description text
- No "Show less" button needed (close modal instead)

**Files touched:**
- `apps/frontend/src/components/Modal.tsx` (shared, from Change 5)
- `apps/frontend/src/components/ExpandableDescription.tsx` — replace logic
- `apps/frontend/src/components/JobCard.tsx` — may need to pass modal open state

**Effort:** Small — 2-3 files

---

## Cross-cutting: Reusable Modal

### Approach

A single lightweight Modal component that all three features (Changes 5, 6, 7) share.

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}
```

- Renders a fixed overlay with centered dialog
- Closes on overlay click, Escape key, or X button
- Accessible: `role="dialog"`, `aria-modal="true"`, focus trap
- Follows the same pattern as `UserSkillsModal`

**Files touched:** 1 new file

---

## Summary

| Change | Effort | Files | Backend work? |
|--------|--------|-------|---------------|
| 1 — Sort bug fix | Small (or 0 if done with Change 4) | 2-3 | No |
| 2 — Trust labels | Small | 1 | No |
| 3 — Your Skills modal sync | Small | 1 | No |
| 4 — Search button | Medium | 6 | No |
| 5 — Match% modal | Medium | 5-6 | Yes (embed breakdown) |
| 6 — Trust modal | Medium | 4-5 | Yes (embed breakdown) |
| 7 — Show More modal | Small | 2-3 | No |
| Cross-cutting: Modal | Small | 1 | No |
| **Total** | **Medium-Large** | **~18-22 files** | **2 backend changes** |
