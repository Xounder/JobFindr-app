# Technical Tasks — Tech Lead Breakdown

> **Source epics:** [EPIC-17-bug-fixes.md](./epics/EPIC-17-bug-fixes.md), [EPIC-18-advanced-filters.md](./epics/EPIC-18-advanced-filters.md), [EPIC-19-performance-ux.md](./epics/EPIC-19-performance-ux.md)
>
> **User stories:** [EPIC-17-tasks.md](./EPIC-17-tasks.md), [EPIC-18-tasks.md](./EPIC-18-tasks.md), [EPIC-19-tasks.md](./EPIC-19-tasks.md)

---

## Parallelization Strategy

```
                         ┌──────────────────────────────────────┐
                         │         SENIOR FRONTEND              │
                         │  T-17.1-01 → T-17.1-02               │
                         │  T-18.2-01 → T-18.2-02 → T-18.2-03   │
                         │  T-18.3-03 → T-18.3-04 → T-18.3-05   │
                         │  T-19.2-01                            │
                         │  T-19.4-01                            │
                         └──────────────────────────────────────┘
                                        ║
  ┌─────────────────────────────────────║──────────────────────────┐
  │                                     ║                          │
  │  ┌──────────────────────────────────║──────────────────────┐   │
  │  │         SENIOR BACKEND           ║                      │   │
  │  │  T-18.1-(01-04)    ──────────────╫──► T-18.2 (no dep)  │   │
  │  │  T-18.3-01 → T-18.3-02 → T-18.3-║─► T-18.3 (frontend) │   │
  │  │  T-19.1-(01-03)   ──────────────║──► T-19.1 (dep 18.1)│   │
  │  │  T-19.3-(01-02)                 ║                      │   │
  │  └──────────────────────────────────║──────────────────────┘   │
  │                                     ║                          │
  │  Both agents run in parallel.       ║                          │
  │  Cross-agent deps are informational ║ (not blocking, as each   │
  │  agent builds separately).          ║                          │
  └─────────────────────────────────────║──────────────────────────┘
```

**Key dependencies:**
- `T-18.2.*` depends on backend supporting `remoteMode` filter → wait for `T-18.1-03` (backend)
- `T-18.3-*` (frontend) depends on `T-18.3-02` (backend country filter)
- `T-19.1-*` depends on `T-18.1-*` (cache stores post-filtering results)
- All other frontend tasks have no cross-agent deps and can be built independently

---

## EPIC 17 — Bug Fixes (P0-Critical)

### US-17.1: Fix minTrustScore slider range mismatch

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-17.1-01 | Update TrustFilters slider range, step, labels | Frontend | `apps/frontend/src/components/TrustFilters.tsx` | Trivial | None |

**Description:**
Change the slider `max` from `100` to `10` and `step` from `5` to `0.5`. Update the maximum label text from `"100 (Highest)"` to `"10 (Highest)"`. The `min` remains `0` and the minimum label remains `"0 (Any)"`. No changes needed on the backend — validation already accepts 0-10.

**Tests required:**
- Manual: slide to various positions, verify no API 400 error
- Verify value `6.5` (default trust threshold) can be set
- Verify value `0` works (no minimum)

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-17.1-02 | Add/update TrustFilters slider tests | Frontend | `apps/frontend/src/components/TrustFilters.test.tsx` (new) | Small | T-17.1-01 |

**Description:**
Add vitest tests for TrustFilters:
- Renders with correct min/max/step attributes
- Calls onChange with parsed number on slider change
- Displays correct label text for min and max
- Displays current value in the label

**Tests required:**
- Component renders with expected props
- Slider interaction fires onChange with correct numeric value
- Labels match 0-10 range

---

## EPIC 18 — Advanced Filters (P1-High)

### US-18.1: Apply remoteMode, seniority, postedAfter server-side

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-18.1-01 | Add remoteMode filter in aggregation-service | Backend | `apps/backend/src/modules/search/services/aggregation-service.ts` | Small | None |

**Description:**
In `aggregateSearch()`, after the company/excludedCompanies filters (after line 144) and before matchmaking (before line 147), add an in-memory filter block for `remoteMode`:

```ts
// Filter by remote mode (after company filters, before matchmaking)
if (input.remoteMode.length > 0) {
  allJobs = allJobs.filter((j) =>
    j.remoteMode !== undefined && input.remoteMode.includes(j.remoteMode)
  )
}
```

When `remoteMode` is non-empty, only keep jobs whose `j.remoteMode` is one of the selected values. Jobs without `remoteMode` (undefined) are excluded when the filter is active. Empty array = no-op.

**Tests required:** See T-18.1-04.

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-18.1-02 | Add seniority filter in aggregation-service | Backend | `apps/backend/src/modules/search/services/aggregation-service.ts` | Small | None |

**Description:**
In the same filter block as T-18.1-01, add:

```ts
// Filter by seniority level
if (input.seniority.length > 0) {
  allJobs = allJobs.filter((j) =>
    j.seniority !== undefined && input.seniority.includes(j.seniority)
  )
}
```

Jobs without `seniority` (undefined) are excluded when filter is active. Empty array = no-op.

**Tests required:** See T-18.1-04.

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-18.1-03 | Add postedAfter date filter in aggregation-service | Backend | `apps/backend/src/modules/search/services/aggregation-service.ts` | Small | None |

**Description:**
In the same filter block, add:

```ts
// Filter by postedAfter date
if (input.postedAfter !== undefined) {
  const cutoff = new Date(input.postedAfter).getTime()
  allJobs = allJobs.filter((j) => {
    if (!j.postedAt) return false
    return new Date(j.postedAt).getTime() >= cutoff
  })
}
```

Jobs without `postedAt` are excluded when filter is active. `undefined` postedAfter = no-op.

**Tests required:** See T-18.1-04.

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-18.1-04 | Write unit tests for server-side filters | Backend | `apps/backend/src/modules/search/services/aggregation-service.test.ts` (new) | Small | T-18.1-01, T-18.1-02, T-18.1-03 |

**Description:**
Create vitest tests for the new filter functions. Follow the existing test pattern from `pagination.test.ts`:
- Use `makeJob()` helper with specified `remoteMode`, `seniority`, `postedAt`
- Test each filter independently
- Test empty arrays → no filtering
- Test missing job fields → excluded when filter active
- Test date boundary conditions
- Test composition of all three filters together

**Tests required:**
- `remoteMode` filter: single value, multi-value, empty, undefined job field
- `seniority` filter: single value, multi-value, empty, undefined job field
- `postedAfter` filter: valid date, ISO date, undefined, missing job field
- Combined: all three filters active simultaneously

---

### US-18.2: RemoteMode filter UI on frontend

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-18.2-01 | Create RemoteModeFilter checkbox component | Frontend | `apps/frontend/src/components/RemoteModeFilter.tsx` (new) | Small | T-18.1-03 (backend filter exists) |

**Description:**
Create a new checkbox group component following the pattern from `SenioritySelector.tsx`:

```tsx
// apps/frontend/src/components/RemoteModeFilter.tsx
interface RemoteModeFilterProps {
  value: string[] // selected remote modes
  onChange: (value: string[]) => void
}
```

Render a fieldset with checkboxes for each option:
- `remote` — "Remote"
- `hybrid` — "Hybrid"
- `on-site` — "On-site"

Use the same Tailwind styling pattern as existing filters (`text-sm font-medium text-gray-700` for label, `accent-indigo-600` for checkbox accent). Support multi-selection (any combination). When nothing selected, send empty array (no filter).

**Tests required:** (to be written by QA)
- Component renders all 3 checkboxes
- Clicking checkbox adds/removes from value array
- Empty array shows no checkboxes checked

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-18.2-02 | Add remoteMode to store, types, API mapping | Frontend | `apps/frontend/src/types/index.ts`, `apps/frontend/src/store/searchStore.ts`, `apps/frontend/src/services/api.ts` | Small | T-18.2-01 |

**Description:**
1. **`apps/frontend/src/types/index.ts`**: Add `remoteMode: string[]` to `FiltersState` and `SearchParams` interfaces.
2. **`apps/frontend/src/store/searchStore.ts`**: Add `remoteMode: []` to `initialState`, add `setRemoteMode: (remoteMode: string[]) => void` to the store interface and implementation. `setRemoteMode` should also reset page to 1.
3. **`apps/frontend/src/services/api.ts`**: In `searchJobs()`, add mapping: if `params.remoteMode.length > 0`, add `queryParams.remoteMode = params.remoteMode.join(",")`.

**Tests required:** (QA)
- Store correctly updates remoteMode and resets page
- API sends comma-separated remoteMode values

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-18.2-03 | Integrate RemoteModeFilter into FiltersPanel | Frontend | `apps/frontend/src/components/FiltersPanel.tsx` | Trivial | T-18.2-02 |

**Description:**
Import and render `RemoteModeFilter` in `FiltersPanel` between `SenioritySelector` and `SkillsTagsInput`. Add the prop `remoteMode` to `FiltersPanelProps` interface and wire up `onRemoteModeChange` callback. Update `hasActiveFilters` to include `filters.remoteMode.length > 0`. Update `HomePage.tsx` to pass `remoteMode` and `setRemoteMode` through.

**Tests required:** None specific (integration).

---

### US-18.3: Country filter (frontend + backend)

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-18.3-01 | Add countries param to search validation and types | Backend | `apps/backend/src/modules/search/validation/search-validation.ts`, `packages/types/src/search-dto.ts`, `apps/backend/src/modules/search/controllers/search-controller.ts` | Small | T-18.1-03 |

**Description:**
1. **`packages/types/src/search-dto.ts`**: Add `countries?: string[]` to `SearchJobsInput` and `countries: string[]` to `ValidatedSearchInput`.
2. **`apps/backend/src/modules/search/validation/search-validation.ts`**: Add `countries` parsing (comma-separated, max 50, case-insensitive, same pattern as `companies`). Add to returned `ValidatedSearchInput`.
3. **`apps/backend/src/modules/search/controllers/search-controller.ts`**: Add `countries: { type: 'string' }` to the route schema.

Note: `NormalizedJob` has `location` (free text, e.g. "São Paulo, Brazil"). For MVP filtering, a simple string match against the location field is sufficient (e.g., if user selects "Brazil", match jobs where `location.toLowerCase().includes("brazil")`). A more sophisticated country inference can be added later.

**Tests required:** See T-18.3-06.

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-18.3-02 | Add country filter in aggregation-service | Backend | `apps/backend/src/modules/search/services/aggregation-service.ts` | Small | T-18.3-01 |

**Description:**
In the same filter block as T-18.1-01/02/03 (after company filters, before matchmaking), add:

```ts
// Filter by country (simple location substring match)
if (input.countries.length > 0) {
  const countryLower = input.countries.map((c) => c.toLowerCase())
  allJobs = allJobs.filter((j) => {
    if (!j.location) return false
    const locLower = j.location.toLowerCase()
    return countryLower.some((country) => locLower.includes(country))
  })
}
```

For MVP, use case-insensitive substring matching against the `location` field. This handles cases like "Brazil" matching "São Paulo, Brazil" or "Remote - Brazil".

**Tests required:** See T-18.3-06.

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-18.3-03 | Create CountryFilter multi-select component | Frontend | `apps/frontend/src/components/CountryFilter.tsx` (new) | Medium | T-18.3-02 |

**Description:**
Create a multi-select country filter component:

```tsx
interface CountryFilterProps {
  selectedCountries: string[]
  availableCountries: string[]  // derived from search results or static list
  onChange: (countries: string[]) => void
}
```

Options:
- **Approach A (recommended for MVP)**: Static list of ~10-20 most common countries from job data (USA, Brazil, UK, Canada, Germany, France, Australia, India, Portugal, Spain, Mexico, Argentina, etc.) with a search/filter input.
- **Approach B**: Dynamic countries from the `/jobs/suggestions` endpoint (requires backend to collect unique countries).

For MVP, use Approach A with a static list and a searchable multi-select input. Pattern: checkboxes with "Select all / Clear" toggle, styled consistently with other filters. The selected countries are stored as `string[]` in state.

Also add `timezone inference` — display a timezone hint next to each country (e.g., "Brazil (BRT/BRST)") for user convenience.

**Tests required:** (QA)
- Component renders country list
- Selecting/deselecting updates value array
- Search/filter narrows displayed countries

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-18.3-04 | Add countries to store, types, API mapping | Frontend | `apps/frontend/src/types/index.ts`, `apps/frontend/src/store/searchStore.ts`, `apps/frontend/src/services/api.ts` | Small | T-18.3-03 |

**Description:**
1. **`apps/frontend/src/types/index.ts`**: Add `countries: string[]` to `FiltersState` and `SearchParams`.
2. **`apps/frontend/src/store/searchStore.ts`**: Add `countries: []` to `initialState`, add `setCountries: (countries: string[]) => void` that also resets page to 1.
3. **`apps/frontend/src/services/api.ts`**: In `searchJobs()`, add: `if (params.countries.length > 0) { queryParams.countries = params.countries.join(","); }`.

**Tests required:** (QA)
- Store correctly updates countries and resets page

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-18.3-05 | Integrate CountryFilter into FiltersPanel | Frontend | `apps/frontend/src/components/FiltersPanel.tsx`, `apps/frontend/src/pages/HomePage.tsx` | Trivial | T-18.3-04 |

**Description:**
Import and render `CountryFilter` in `FiltersPanel` after `RemoteModeFilter`. Add `countries` and `onCountriesChange` to `FiltersPanelProps`. Update `hasActiveFilters` to include `filters.countries.length > 0`. In `HomePage`, wire `countries`/`setCountries` through the store.

**Tests required:** None specific.

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-18.3-06 | Write tests for country filter (backend) | Backend | `apps/backend/src/modules/search/services/aggregation-service.test.ts` | Small | T-18.3-02 |

**Description:**
Add tests for the country filter to the same test file from T-18.1-04:
- Filter by single country
- Filter by multiple countries
- Empty countries array → no filtering
- Jobs without location → excluded when filter is active
- Case-insensitive matching

**Tests required:**
- Country filter unit tests

---

## EPIC 19 — Performance & UX (P1/P2/P3)

### US-19.1: Aggregated result cache for pagination

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-19.1-01 | Create AggregatedCache class | Backend | `apps/backend/src/cache/aggregated-cache.ts` (new) | Medium | T-18.1-03 (filters must exist before caching) |

**Description:**
Create a new cache class `AggregatedCache` that caches the full aggregated result (after filtering, matchmaking, trust, ranking) keyed by search parameters excluding `page` and `pageSize`.

Use the existing `InMemoryCache<NormalizedJob[]>` infrastructure:

```ts
export class AggregatedCache {
  private cache: InMemoryCache<NormalizedJob[]>
  private readonly maxEntries: number = 50

  constructor(ttlMs: number = 120_000) // 2 minute TTL
  buildKey(input: ValidatedSearchInput): string // JSON deterministic serialization excluding page/pageSize
  get(key: string): NormalizedJob[] | undefined
  set(key: string, jobs: NormalizedJob[]): void
  invalidate(): void
  clear(): void
}
```

The `buildKey` must exclude `page` and `pageSize` from the serialized object so pagination can be served from the same cache entry.

**Tests required:** See T-19.1-03.

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-19.1-02 | Integrate AggregatedCache into aggregation-service | Backend | `apps/backend/src/modules/search/services/aggregation-service.ts` | Medium | T-19.1-01 |

**Description:**
Modify `aggregateSearch()` to use `AggregatedCache`:

1. At the top of `aggregateSearch()`, build cache key (excluding page/pageSize) and check cache.
2. **Cache hit**: Get cached jobs, apply pagination directly, return. Skip all provider execution.
3. **Cache miss**: Execute full pipeline (providers → filtering → matchmaking → trust → ranking), store full (non-paginated) result in cache, then paginate and return.

The cache key must include `countries` (from US-18.3) once available, and must exclude `page`/`pageSize` so any page serves from the same cache entry.

Flow change:
```
aggregateSearch(input):
  cacheKey = buildCacheKey(input)  // excludes page/pageSize
  cached = aggregatedCache.get(cacheKey)
  if (cached):
    return paginateJobs(cached, input.page, input.pageSize)

  // ... full pipeline execution (existing code) ...
  aggregatedCache.set(cacheKey, rankedJobs)  // cache before pagination
  return paginateJobs(rankedJobs, input.page, input.pageSize)
```

Provider cache (5min TTL) remains as first-level cache — when aggregated cache expires but provider cache is still valid, providers are not re-fetched.

**Tests required:** See T-19.1-03.

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-19.1-03 | Write tests for AggregatedCache | Backend | `apps/backend/src/cache/aggregated-cache.test.ts` (new) | Medium | T-19.1-01, T-19.1-02 |

**Description:**
Write vitest tests for:
- Cache key excludes page/pageSize (same key for different pages)
- Cache key includes filter params (different filters = different keys)
- Cache hit returns correct jobs
- Cache miss triggers full pipeline
- TTL expiry (use `vi.advanceTimersByTime`)
- Max entries limit (50)
- Concurrent requests return same cached result

**Tests required:**
- Unit tests for AggregatedCache class
- Integration test with aggregation-service (mock providers)

---

### US-19.2: localStorage filter persistence

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-19.2-01 | Add Zustand persist middleware to searchStore | Frontend | `apps/frontend/src/store/searchStore.ts` | Small | None |

**Description:**
Wrap the existing Zustand store with the `persist` middleware from `zustand/middleware`:

```ts
import { persist } from "zustand/middleware"

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      // ... existing store implementation ...
    }),
    {
      name: "jobfindr-filters",
      // Only persist filter fields, exclude page/pageSize (derived)
      partialize: (state) => ({
        query: state.query,
        skills: state.skills,
        seniority: state.seniority,
        companies: state.companies,
        excludeCompanies: state.excludeCompanies,
        trustMin: state.trustMin,
        // remoteMode, countries added by US-18.2/18.3
      }),
      // Graceful fallback if localStorage unavailable
      skipHydration: false,
      version: 1,
    }
  )
)
```

The `partialize` function should only persist filter fields — exclude `page`, `pageSize`, and any future non-filter state. Add a `version` field for schema migration support.

**Tests required:** (QA)
- Manual: set filters, refresh page, verify filters restored
- Manual: clear filters, refresh, verify defaults
- Edge: localStorage unavailable → no crash

---

### US-19.3: Company suggestions from real provider data

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-19.3-01 | Replace hardcoded company suggestions with dynamic provider data | Backend | `apps/backend/src/modules/suggestions/suggestions-controller.ts`, `apps/backend/src/modules/providers/domain/provider-registry.ts` (or new provider-config) | Medium | None |

**Description:**
Replace the hardcoded `SUGGESTED_COMPANIES` array in `suggestions-controller.ts` with a dynamic source:

**Option A (recommended for MVP):** Collect unique company names from the provider cache. When the suggestions endpoint is called, scan `InMemoryCache` entries for unique company names from cached job results. If no cached data exists, fall back to a smaller static list.

**Option B:** Add a `getAllCompanies(): string[]` method to the provider registry that each provider can implement. For example, Workday/Gupy/Greenhouse providers could return companies they commonly fetch jobs from.

Implement Option A for simplicity:
1. Create a service function `getUniqueCompaniesFromCache(): string[]` that iterates provider cache entries and extracts unique company names.
2. In `suggestionsHandler`, merge dynamic companies with static skills list.
3. If cache is empty, return a small curated static list (~10 major companies) as fallback.

Keep the skills list static (it's fine for MVP — skills are more standardized).

**Tests required:** See T-19.3-02.

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-19.3-02 | Write tests for dynamic company suggestions | Backend | `apps/backend/src/modules/suggestions/suggestions-controller.test.ts` (new) | Small | T-19.3-01 |

**Description:**
Write vitest tests:
- Returns companies from cache when data exists
- Returns fallback static list when cache is empty
- No duplicate companies
- Companies are sorted alphabetically

**Tests required:**
- `getUniqueCompaniesFromCache()` unit test
- Suggestions handler test with mocked cache

---

### US-19.4: Debounce all filter changes

| Task ID | Title | Layer | Files | Complexity | Depends On |
|---------|-------|-------|-------|------------|------------|
| T-19.4-01 | Add debounce to all filter changes in HomePage | Frontend | `apps/frontend/src/pages/HomePage.tsx` | Small | None |

**Description:**
Currently only the query input is debounced (via `localQuery` → `useDebounce` → store sync). Other filter changes (seniority, companies, trust score, remoteMode, countries) update the store immediately, triggering instant API calls.

**Approach:** Introduce a single debounced "commit" pattern:

1. Add local filter state in `HomePage` for all filter values.
2. Sync them all to the store via a single debounced effect (300ms).
3. Only the `localQuery` → `debouncedQuery` pattern already exists — extend it to all filters.

Simpler alternative (recommended): Keep the store as the source of truth but debounce the TanStack Query trigger. Add a `debounceMs` config in `useJobSearch`:

```ts
// In useJobSearch.ts, debounce the query key change
const debouncedParams = useDebounce(searchParams, 300)
const result = useQuery<SearchResponse>({
  queryKey: ["jobs", "search", debouncedParams],
  queryFn: () => searchJobs(debouncedParams),
  staleTime: 30_000,
  placeholderData: (prev) => prev,
})
```

This debounces ALL filter changes with a single hook, including the query. The existing `localQuery` → `setQuery` pattern in `HomePage` can then be simplified. This avoids the complexity of managing local state for every filter.

**Important:** UI should remain responsive during debounce — selected values show immediately in the filter controls, only the API call is delayed. TanStack Query's `placeholderData: (prev) => prev` already handles showing previous results during loading.

**Tests required:** (QA)
- Rapid filter changes produce only one API call after 300ms
- Visual: no flickering or jank
- Existing query debounce continues to work

---

## Task Summary

| EPIC | US | Task | Layer | Complexity | Depends On |
|------|----|------|-------|------------|------------|
| 17 | 17.1 | T-17.1-01: Fix slider range/step/labels | Frontend | Trivial | None |
| 17 | 17.1 | T-17.1-02: Add slider tests | Frontend | Small | T-17.1-01 |
| 18 | 18.1 | T-18.1-01: remoteMode filter (backend) | Backend | Small | None |
| 18 | 18.1 | T-18.1-02: seniority filter (backend) | Backend | Small | None |
| 18 | 18.1 | T-18.1-03: postedAfter filter (backend) | Backend | Small | None |
| 18 | 18.1 | T-18.1-04: Server-side filter tests | Backend | Small | T-18.1-01, 02, 03 |
| 18 | 18.2 | T-18.2-01: RemoteModeFilter component | Frontend | Small | T-18.1-03 |
| 18 | 18.2 | T-18.2-02: remoteMode store/types/API | Frontend | Small | T-18.2-01 |
| 18 | 18.2 | T-18.2-03: Integrate into FiltersPanel | Frontend | Trivial | T-18.2-02 |
| 18 | 18.3 | T-18.3-01: countries param validation | Backend | Small | T-18.1-03 |
| 18 | 18.3 | T-18.3-02: country filter (backend) | Backend | Small | T-18.3-01 |
| 18 | 18.3 | T-18.3-03: CountryFilter component | Frontend | Medium | T-18.3-02 |
| 18 | 18.3 | T-18.3-04: countries store/types/API | Frontend | Small | T-18.3-03 |
| 18 | 18.3 | T-18.3-05: Integrate into FiltersPanel | Frontend | Trivial | T-18.3-04 |
| 18 | 18.3 | T-18.3-06: Country filter tests (backend) | Backend | Small | T-18.3-02 |
| 19 | 19.1 | T-19.1-01: AggregatedCache class | Backend | Medium | T-18.1-03 |
| 19 | 19.1 | T-19.1-02: Integrate cache into agg-service | Backend | Medium | T-19.1-01 |
| 19 | 19.1 | T-19.1-03: AggregatedCache tests | Backend | Medium | T-19.1-01, 02 |
| 19 | 19.2 | T-19.2-01: Zustand persist middleware | Frontend | Small | None |
| 19 | 19.3 | T-19.3-01: Dynamic company suggestions | Backend | Medium | None |
| 19 | 19.3 | T-19.3-02: Suggestions tests | Backend | Small | T-19.3-01 |
| 19 | 19.4 | T-19.4-01: Debounce all filter changes | Frontend | Small | None |

**Total: 22 tasks** (Frontend: 10, Backend: 12)

### Execution Order

**Senior Frontend (sequential, 10 tasks):**
1. T-17.1-01 — Fix slider (P0 critical)
2. T-17.1-02 — Slider tests
3. T-18.2-01 — RemoteModeFilter component
4. T-18.2-02 — Store/types/API for remoteMode
5. T-18.2-03 — Integrate RemoteModeFilter
6. T-18.3-03 — CountryFilter component
7. T-18.3-04 — Store/types/API for countries
8. T-18.3-05 — Integrate CountryFilter
9. T-19.2-01 — localStorage persistence
10. T-19.4-01 — Debounce all filters

**Senior Backend (sequential, 12 tasks):**
1. T-18.1-01 — remoteMode filter
2. T-18.1-02 — seniority filter
3. T-18.1-03 — postedAfter filter
4. T-18.1-04 — Filter tests
5. T-18.3-01 — countries param validation
6. T-18.3-02 — country filter
7. T-18.3-06 — Country filter tests
8. T-19.1-01 — AggregatedCache class
9. T-19.1-02 — Cache integration
10. T-19.1-03 — Cache tests
11. T-19.3-01 — Dynamic suggestions
12. T-19.3-02 — Suggestions tests
