# EPIC 19 — Performance & UX — User Stories

## Epic overview
[EPIC-19-performance-ux.md](./epics/EPIC-19-performance-ux.md)

---

## US-19.1: Implement aggregated result cache for pagination

| Field | Value |
|-------|-------|
| **Priority** | P1 — High |
| **Layer** | Backend |
| **Estimate** | Large (new cache module + integration) |
| **Depends on** | US-18.1 (cache stores post-filtering results) |

### Description
As a user browsing through job listings, I want changing pages to be fast, so that I can navigate results without waiting for all providers to be re-fetched and all results to be re-processed. Currently, each page change triggers a full pipeline execution (fetch all providers → matchmaking → trust → ranking → paginate). This is inefficient and slow.

### Acceptance Criteria
1. **Cache key**: Includes all search parameters EXCEPT `page` and `pageSize` (e.g., `q`, `skills`, `seniority`, `remoteMode`, `companies`, `excludedCompanies`, `sources`, `minTrustScore`, `includeHidden`, `sort`, `postedAfter`, `countries`)
2. **Cache hit on page change**: Changing page serves results from cache without re-fetching any provider
3. **Cache miss on filter change**: Changing any search parameter invalidates the cache and triggers a full re-fetch
4. **TTL**: Aggregated cache expires after 2 minutes
5. **Provider cache preserved**: Existing `ProviderCacheLayer` (5min TTL) remains as first-level cache — when aggregated cache expires but provider cache is still valid, providers are not re-fetched
6. **Max entries**: Cache is limited to 50 entries to prevent memory pressure
7. **Stateless**: Cache is in-memory only (no database, consistent with project architecture)

### Technical Notes
- New file: `apps/backend/src/cache/aggregated-cache.ts`
- Modify: `apps/backend/src/modules/search/services/aggregation-service.ts`
- Reuse existing `InMemoryCache` infrastructure
- Cache key = deterministic JSON serialization of search input (excluding page/pageSize)

### Testing
- Test that page changes return cached results (mock provider calls to verify they are not called)
- Test that filter changes invalidate cache and trigger re-fetch
- Test TTL expiry
- Test concurrent page requests

---

## US-19.2: Persist search filters across sessions via localStorage

| Field | Value |
|-------|-------|
| **Priority** | P2 — Medium |
| **Layer** | Frontend |
| **Estimate** | Small (Zustand persist config) |
| **Depends on** | None |

### Description
As a user, I want my selected filters to persist when I refresh the page or return later, so that I don't have to re-configure my search preferences every time. Currently, all filter state is lost on page refresh.

### Acceptance Criteria
1. **Persistence**: All filter values survive page refresh (trust score, remote mode, seniority, companies, query text, etc.)
2. **Zustand persist middleware**: Uses Zustand's built-in `persist` middleware with `localStorage` storage
3. **No data leaks**: Only filter state is persisted — no personal data, no search history (consistent with stateless architecture)
4. **Clear/reset works**: A "clear filters" or "reset" action clears both the UI state AND the persisted state in localStorage
5. **Graceful degradation**: If localStorage is unavailable (private browsing, storage quota), the app continues without persistence
6. **Migration support**: Persisted state schema is versioned to handle future changes

### Technical Notes
- Modify the Zustand store configuration to wrap with `persist` middleware
- Storage key: `jobfindr-filters` or similar
- Consider which fields to persist — all search params should be persisted
- The `partialize` option can be used to exclude non-filter state (e.g., loading flags)

### Testing
- Manual: Set filters, refresh page, verify filters are restored
- Manual: Clear filters, refresh, verify default state
- Edge case: localStorage disabled → no crash
- Edge case: Corrupted localStorage data → graceful fallback to defaults

---

## US-19.3: Limit company suggestions to companies with real provider data

| Field | Value |
|-------|-------|
| **Priority** | P2 — Medium |
| **Layer** | Backend |
| **Estimate** | Small (filter logic) |
| **Depends on** | None |

### Description
As a user typing in the company autocomplete field, I want to only see suggestions for companies that actually have jobs in the current result set, so that I don't waste time selecting companies that yield no results.

### Acceptance Criteria
1. **Real data only**: Company suggestions are filtered to include only companies that appear in at least one job result from the current search
2. **Empty state**: If no companies match, the suggestions dropdown shows an appropriate empty state (e.g., "No companies found")
3. **Performance**: The filtering does not significantly degrade suggestion response time
4. **Debounce compatible**: Works correctly with existing debounce on the company input field
5. **No breaking changes**: Existing company filter functionality continues to work

### Technical Notes
- The list of available companies can be derived from the aggregated job results
- Suggestion endpoint or client-side filtering can be used — evaluate which is more performant
- Consider caching the company list to avoid repeated computation

### Testing
- Test that a company with no results does not appear in suggestions
- Test that a company with results does appear
- Test the empty state

---

## US-19.4: Add debounce to all filter changes

| Field | Value |
|-------|-------|
| **Priority** | P3 — Low |
| **Layer** | Frontend |
| **Estimate** | Small (debounce configuration) |
| **Depends on** | None |

### Description
As a user adjusting multiple filters at once, I want the search to update only after I finish making changes, so that the app doesn't fire excessive API calls for every individual click or keystroke. Currently only the query input is debounced — checkbox toggles, dropdown selections, and slider changes trigger immediate requests.

### Acceptance Criteria
1. **All filters debounced**: Changes to remote mode checkboxes, seniority selects, company selection, country selector, and trust score slider are all debounced
2. **Debounce duration**: A consistent debounce delay (300ms recommended) is applied to all filter controls
3. **Query debounce preserved**: The existing query input debounce continues to work (no regression)
4. **Single request**: Rapidly changing multiple filters produces only one API call after the debounce period
5. **No visual lag**: UI remains responsive during debounce — selected values show immediately, only the API call is delayed
6. **Accessible**: Debounce does not disrupt screen reader announcements or keyboard navigation

### Technical Notes
- Use a shared debounce utility from `@jobfindr/utils` or a custom hook
- Consider moving debounce logic to a central place (e.g., the custom hook or the Zustand store)
- Visual feedback: Optionally show a subtle "updating..." indicator while debounce is active

### Testing
- Manual: Toggle multiple filters rapidly and verify only one request fires after 300ms
- Manual: Verify no flashing or jank
- Verify that query debounce still works independently
- Verify that individual filter changes are reflected in the UI immediately (optimistic update)

---

