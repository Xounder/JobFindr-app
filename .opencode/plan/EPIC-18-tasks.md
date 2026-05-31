# EPIC 18 — Advanced Filters — User Stories

## Epic overview
[EPIC-18-advanced-filters.md](./epics/EPIC-18-advanced-filters.md)

---

## US-18.1: Apply remoteMode, seniority and postedAfter filters server-side

| Field | Value |
|-------|-------|
| **Priority** | P1 — High |
| **Layer** | Backend |
| **Estimate** | Medium (1 file + tests) |
| **Depends on** | None (foundation for US-18.2, US-18.3) |

### Description
As a user, I want the remote mode, seniority level, and "posted after" date filters to actually narrow down my job results. Currently, the backend validates these parameters in `search-validation.ts` but never applies them as filters on the aggregated results. The `NormalizedJob` type already includes `remoteMode`, `seniority`, and `postedAt` fields — the filtering logic just needs to be implemented.

### Acceptance Criteria
1. **remoteMode filter**: When `input.remoteMode` is non-empty, jobs are filtered to only include those whose `j.remoteMode` matches one of the selected values. Jobs without a `remoteMode` value are excluded when the filter is active.
2. **seniority filter**: When `input.seniority` is non-empty, jobs are filtered to only include those whose `j.seniority` matches one of the selected values. Jobs without a `seniority` value are excluded when the filter is active.
3. **postedAfter filter**: When `input.postedAfter` is provided, jobs are filtered to only include those with `j.postedAt >= input.postedAfter`. Jobs without `postedAt` are excluded when the filter is active.
4. **Empty arrays are no-ops**: When `remoteMode` or `seniority` are empty arrays, no filtering occurs (all jobs pass through).
5. **Undefined postedAfter is no-op**: When `postedAfter` is not provided, no date filtering occurs.
6. **Filter order**: Filters are applied after company/excludedCompanies filters and before matchmaking in `aggregation-service.ts`.

### Technical Notes
- File to modify: `apps/backend/src/modules/search/services/aggregation-service.ts`
- Insert filter blocks after company filters (after ~line 144) and before matchmaking
- Each filter is a simple `Array.filter()` call
- Use existing `NormalizedJob` field types

### Testing
- Unit test each filter independently with mocked jobs
- Test empty arrays → no filtering
- Test missing job fields → excluded when filter active
- Test date boundary conditions
- Test composition of all three filters together

---

## US-18.2: Add remoteMode filter component to frontend

| Field | Value |
|-------|-------|
| **Priority** | P1 — High |
| **Layer** | Frontend |
| **Estimate** | Medium (1-2 components) |
| **Depends on** | US-18.1 |

### Description
As a user, I want to filter job results by remote mode (remote, hybrid, on-site) directly from the search interface, so that I can quickly find jobs matching my preferred work arrangement.

### Acceptance Criteria
1. **Filter control exists**: A visible UI control (e.g., checkboxes or multi-select) allows selecting remote mode options: Remote, Hybrid, On-site
2. **Multi-select supported**: User can select one, multiple, or all options
3. **URL/search params updated**: Selected values are reflected in the URL query parameters (`remoteMode`)
4. **Backend integration**: The selected values are sent as `remoteMode` parameter in the search API call
5. **Works with server-side filter**: The filter correctly narrows results when combined with US-18.1
6. **Empty state**: When nothing is selected, no remoteMode filter is sent (all modes shown)
7. **Accessible**: The control is keyboard-navigable and properly labeled for screen readers

### Technical Notes
- Create or extend a filter sidebar/panel component
- Integration point: `apps/frontend/src/components/` (check existing filter components for pattern)
- URL param name: `remoteMode` (matches backend expectation)

### Testing
- Manual: Select each mode and verify results narrow
- Verify URL updates correctly
- Verify filter resets work

---

## US-18.3: Add country filter to frontend and backend

| Field | Value |
|-------|-------|
| **Priority** | P2 — Medium |
| **Layer** | Frontend + Backend |
| **Estimate** | Medium (frontend component + backend filter) |
| **Depends on** | US-18.1 |

### Description
As a user, I want to filter job results by country, so that I can focus on opportunities in specific geographic locations. The country can be inferred from job location data or manually selected from available options.

### Acceptance Criteria
1. **Country selector**: Frontend has a country selector (dropdown or multi-select) showing available countries
2. **Backend filtering**: Backend filters aggregated results by `country` field on `NormalizedJob`
3. **Multi-select**: User can select one or more countries
4. **Missing data handling**: Jobs without country data are excluded when the filter is active
5. **Composition**: Works correctly alongside other filters (remoteMode, seniority, etc.)
6. **URL params**: Selected countries are reflected in URL query parameters (`countries`)
7. **Inference**: Countries are inferred from job location data where possible (e.g., from `location` field parsing or provider metadata)

### Technical Notes
- Frontend: New filter component, similar to remoteMode filter
- Backend: Add country filter block in `aggregation-service.ts` (after US-18.1 filter section)
- Country inference may require lightweight location parsing in the normalization pipeline
- Consider using a standard country list (ISO alpha-2 codes) for consistency

### Testing
- Test country filter with mocked jobs
- Test multi-country selection
- Test jobs without country data
- Frontend: verify selector renders and updates correctly

---

