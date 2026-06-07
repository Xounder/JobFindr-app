# Feasibility — 5 Match & Filters Changes

---

## Change 1: Match Score Calculation Refinement

### Current State

The match scoring in `weighted-match-scoring.ts` computes:
- `skillComponent` = `combinedScore * 0.5 * 100` (max 50)
- `seniorityComponent` = `seniorityScore * 0.35 * 100` (max 35)
- `keywordComponent` = `keywordScore * 0.15 * 100` (max 15)

No work type factor exists. The `keywordScore` from `similarity-engine.ts` is a redundant signal (partial word matching), and even with perfect skill + seniority matches, the score rarely reaches 100% because Jaccard similarity penalizes when the user has more skills than the job.

### Required Changes

1. Add a `workTypeWeight` to `MatchWeights` (redistribute: skill=0.45, seniority=0.30, keyword=0.10, workType=0.15)
2. Implement `calculateWorkTypeScore()` that evaluates:
   - If user selected `remote` filter → check `job.remoteMode === 'remote'` → score = 1.0
   - If user selected `hybrid` or `on-site` filter → check if any selected country matches `job.location` → score = 1.0
   - If no relevant filters active → score = 0.5 (neutral, doesn't penalize)
   - _Note: When user selects multiple remote modes, check against each_
3. Add 100% clamp: if `skills near-perfect` + `seniorityScore === 1.0` + `workTypeScore === 1.0` → overall = 100
4. Pass `remoteMode` and `countries` from `ValidatedSearchInput` into the match scoring call chain

### Approach A — Add workTypeWeight to scoring (Recommended)

**Description:** Add work type as a new weighted component in the match score formula, with a 100% override when all three conditions (skills, seniority, work type) are perfect.

**Pros:**
- Integrated into existing weighted scoring system
- Explainable — work type score appears in breakdown
- 100% clamp provides intuitive user experience

**Cons:**
- Requires rebalancing existing weights (reduces keyword weight)
- Call chain needs updating to pass filter context

**Effort:** Medium
**Files touched:**
- `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts` — Add workTypeWeight, calculateWorkTypeScore, 100% clamp
- `apps/backend/src/modules/matchmaking/domain/match-types.ts` — May need new type fields
- `apps/backend/src/modules/search/services/aggregation-service.ts` — Pass remoteMode/countries to scoring
- `apps/backend/src/modules/search/dto/search-dto.ts` — May add workTypeBreakdown to response
- `packages/types/src/match.types.ts` — Add `workTypeMatch` field to `MatchBreakdown`

### Approach B — Work type as bonus only (Alternative)

**Description:** Calculate work type as a separate bonus applied after the weighted score (not part of core weights).

**Pros:**
- Minimal changes to existing weights
- Simple to implement

**Cons:**
- Less integrated into the explainable score breakdown
- Less intuitive scoring model

### Approach C — Custom approach

User can define custom weight distribution or scoring logic.

---

## Change 2: "Your Skills" Filter Clickable

### Current State

- `Layout.tsx` manages `isSkillsModalOpen` state and renders `UserSkillsModal`
- `FiltersPanel.tsx` has a non-interactive "Your Skills" display showing user skills and seniority
- The modal is only accessible from the header button

### Approach A — React Context for modal state (Recommended)

**Description:** Create `SkillsModalContext` with `openSkillsModal()`/`closeSkillsModal()` methods. Wrap the app in the provider. `Layout` renders the modal based on context state. `FiltersPanel` calls `openSkillsModal()` on click.

**Pros:**
- Clean separation of concerns — UI state not mixed with filter state
- No prop drilling through Layout → children hierarchy
- Reusable — any component can open the modal
- Follows React best practices

**Cons:**
- Adds a new context file and provider wrapping
- Slightly more setup than store-based approach

**Effort:** Small
**Files touched:**
- `apps/frontend/src/contexts/SkillsModalContext.tsx` — New context file
- `apps/frontend/src/main.tsx` — Wrap App with SkillsModalProvider
- `apps/frontend/src/components/Layout.tsx` — Use context instead of local state
- `apps/frontend/src/components/FiltersPanel.tsx` — Call context method on click

### Approach B — Zustand store property (Alternative)

**Description:** Add `isSkillsModalOpen` and `setSkillsModalOpen` to the existing `searchStore`.

**Pros:**
- Simplest implementation
- No new files

**Cons:**
- Mixes UI state with domain filter state
- Zustand persist would need to exclude this field

---

## Change 3: Seniority Label with Sync

### Current State

`FiltersPanel.tsx` lines 100-104 already has:
```tsx
{userSeniority && userSeniority !== filters.seniority && (
  <p className="mt-1 text-xs text-gray-500">
    Your Skill Seniority: {SENIORITY_DISPLAY[userSeniority] ?? userSeniority}
  </p>
)}
```

### Approach (Single — Recommended)

**Description:** Change the `<p>` to a `<button>` or styled clickable element. On click, call `onSeniorityChange(userSeniority)`. Update label text to `"Use your Seniority: <value>"`.

**Pros:**
- Trivial change, single file
- No new dependencies
- Clear UX: one-click sync

**Cons:**
- None

**Effort:** Trivial
**Files touched:**
- `apps/frontend/src/components/FiltersPanel.tsx` — Modify ~5 lines

---

## Change 4: Required Skills Filter Exclusivity

### Current State

`input.skills` (from the Required Skills filter) is ONLY used as a fallback for user skills in matchmaking (line 189 of `aggregation-service.ts`). There is NO filtering by required skills — jobs with zero matching skills still appear in results.

### Approach A — Add filter in aggregation-service (Recommended)

**Description:** After existing filters (company, remoteMode, seniority, country), add a new filter step:
```typescript
if (input.skills.length > 0) {
  allJobs = allJobs.filter((job) =>
    input.skills.every((skill) =>
      job.skills.some((jobSkill) => jobSkill.toLowerCase() === skill.toLowerCase())
    )
  )
}
```

**Pros:**
- Single file change
- Follows existing filter pattern in aggregation-service
- Matchmaking remains unchanged (still uses skills as fallback for user skills)

**Cons:**
- The `skills` parameter is now used for two purposes (filter + matchmaking fallback). This could cause confusion if userSkills is also set
- Potential performance impact on large result sets (filtering before ranking)

**Effort:** Small
**Files touched:**
- `apps/backend/src/modules/search/services/aggregation-service.ts` — Add ~10 lines after line 186

### Approach B — Separate `requiredSkills` parameter (Alternative)

**Description:** Introduce a new query parameter `requiredSkills` distinct from `skills`. Frontend sends it separately. Backend treats it as an exclusive filter only.

**Pros:**
- Explicit separation of concerns
- No dual-purpose parameter

**Cons:**
- API surface change
- Frontend changes in api.ts and types
- Two skills parameters may confuse users

---

## Change 5: Companies Filters Reflecting Actual Results

### Current State

`CompanyFilters` uses `useSuggestions()` → `/jobs/suggestions` → `getUniqueCompaniesFromCache()`. The company list includes ALL cached companies from all past searches + hardcoded fallbacks (Google, Microsoft, etc.). This list has NO relation to current search results.

### Approach A — Frontend extracts from results (Recommended)

**Description:** In `HomePage`, compute unique companies from `data?.jobs`:
```typescript
const resultCompanies = useMemo(
  () => [...new Set((data?.jobs ?? []).map((j) => j.company).filter(Boolean))],
  [data]
)
```
Pass `resultCompanies` to `FiltersPanel` → `CompanyFilters` as `suggestions` prop. Fall back to `useSuggestions()` when no results yet.

**Pros:**
- No backend changes needed
- Reactively updates with each search
- Simple and low-risk

**Cons:**
- Suggestions list is empty on initial page load (no search yet)
- Companies list updates only after search completes
- Requires threading through FiltersPanel to CompanyFilters

**Effort:** Small
**Files touched:**
- `apps/frontend/src/pages/HomePage.tsx` — Compute resultCompanies, pass to FiltersPanel
- `apps/frontend/src/components/FiltersPanel.tsx` — Accept new prop, forward to CompanyFilters
- `apps/frontend/src/components/CompanyFilters.tsx` — Accept optional `resultSuggestions` prop (override default suggestions)

### Approach B — Backend includes in search response (Alternative)

**Description:** Add `availableCompanies: string[]` to `SearchResponse`. Backend extracts unique companies from the full (pre-paginated) result set in `aggregation-service.ts`.

**Pros:**
- Clean separation — backend owns the data
- Companies available immediately in the response

**Cons:**
- Response bloat (might include many companies)
- Backend types + frontend types + API contract changes
- More files touched

---

## Effort Summary

| Change | Effort | Files | Complexity |
|--------|--------|-------|------------|
| 1. Match score | Medium | 4-5 | Algorithm + weight rebalancing |
| 2. Skills clickable | Small | 3-4 | New context, wiring |
| 3. Seniority label | Trivial | 1 | Minor UI change |
| 4. Required skills | Small | 1 | Simple filter addition |
| 5. Companies | Small | 3 | Data propagation |
