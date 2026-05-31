# Epic 2: Sort Toggle — Trust vs Match

**Priority:** 2 (Control)
**Effort:** Medium-High
**Layer:** Full-stack (Types, Backend, Frontend)
**Dependencies:** Epic 1 (Trust-First Default Ordering)

## Description

Give users the ability to choose between sorting by **Trust Score** (default) or **Match %**. This is a full-stack change spanning shared types, the backend ranking engine, and a new frontend toggle UI.

When `sort=trust`, the order is `trustScore desc → matchScore desc → composite desc`.  
When `sort=match`, the order is `matchScore desc → trustScore desc → composite desc`.

The toggle should be placed near the search results area or in the sidebar filter panel, with a clear label and tooltip explaining what each option means.

## Acceptance Criteria

### Backend & Types
- [ ] `SearchSortOption` in `@jobfindr/types` includes `'trust'` and `'match'` values
- [ ] `RankingOptions` accepts a `sortBy?: 'trust' | 'match'` parameter
- [ ] `ranking-engine.ts` supports conditional multi-key sort based on `sortBy`
- [ ] `aggregation-service.ts` passes `input.sort` (mapped to `'trust'` or `'match'`) to `rankJobs`
- [ ] `sort=relevance` still works for backward compatibility (composite score)
- [ ] Backend tests cover `sortBy: 'trust'` and `sortBy: 'match'` scenarios

### Frontend
- [ ] `SearchParams` / `FiltersState` types include `sort: 'trust' | 'match'`
- [ ] Zustand `searchStore` has a `sort` field (default `'trust'`) with a setter, persisted in localStorage
- [ ] API client serializes `sort` in query params
- [ ] `useJobSearch` hook passes `sort` from store to API params
- [ ] `SortToggle.tsx` component renders as a segmented control or dropdown with "Trust Score" / "Match %"
- [ ] Toggle has a tooltip explaining each option
- [ ] Changing the toggle triggers a new search with the updated sort order
- [ ] `SortToggle.test.tsx` covers toggle interactions and store updates

## Affected Files

| Action | File |
|--------|------|
| MODIFY | `packages/types/src/search-dto.ts` |
| MODIFY | `packages/types/src/ranking.ts` |
| MODIFY | `apps/backend/src/modules/ranking/services/ranking-engine.ts` |
| MODIFY | `apps/backend/src/modules/search/services/aggregation-service.ts` |
| MODIFY | `apps/frontend/src/types/index.ts` |
| MODIFY | `apps/frontend/src/store/searchStore.ts` |
| MODIFY | `apps/frontend/src/services/api.ts` |
| MODIFY | `apps/frontend/src/hooks/useJobSearch.ts` |
| CREATE | `apps/frontend/src/components/SortToggle.tsx` |
| CREATE | `apps/frontend/src/components/SortToggle.test.tsx` |
| MODIFY | `apps/backend/src/modules/ranking/services/ranking-engine.test.ts` |
