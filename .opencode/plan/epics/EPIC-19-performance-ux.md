# EPIC 19 — Performance & UX

## Objective
Improve application performance and user experience through caching, filter persistence, smarter suggestions, and debounced controls.

## Motivation
Page changes re-fetch all providers (slow), filter state is lost on refresh, company suggestions are misleading, and rapid filter changes trigger excessive API calls. This epic addresses all four pain points to make the app feel faster and more polished.

## Deliverables
- Aggregated result cache for efficient pagination
- localStorage persistence for search filters
- Curated company suggestions
- Debounced filter controls

## Related Improvements
- 05-paginacao-cache (High)
- 06-localStorage-persist (Medium)
- 07-company-suggestions (Medium)
- 08-debounce-filtros (Low)

## Priority
High (05) / Medium (06, 07) / Low (08)

## Dependencies
- US-19.1 depends on server-side filters (US-18.1) — cache stores post-filtering results
- US-19.2, US-19.3, US-19.4 have no dependencies

## Tasks
- US-19.1: Implement aggregated result cache for pagination
- US-19.2: Persist search filters across sessions via localStorage
- US-19.3: Limit company suggestions to companies with real provider data
- US-19.4: Add debounce to all filter changes

## Acceptance Criteria
- Pagination is fast (no provider re-fetch on page change)
- Filters persist across page refreshes
- Company suggestions only include companies with actual job results
- All filter controls are debounced to avoid excessive API calls

---

