# TASK-202 — Add sortBy Support to Backend Ranking

**Layer:** backend
**Depends on:** TASK-201
**Epic origin:** `epics/epic-2-sort-toggle.md`

## Description

Add `sortBy?: 'trust' | 'match'` support to the ranking engine and aggregation service. When `sortBy` is `'trust'`, the order is `trustScore desc → matchScore desc → compositeScore desc`. When `sortBy` is `'match'`, the order is `matchScore desc → trustScore desc → compositeScore desc`. When `sortBy` is not provided (or any other value), default to `'trust'` behavior for backward compatibility.

The `sort=relevance` option should continue to work as legacy (falls back to composite score ordering, but effectively becomes a trust-first default since TASK-101 changed the default).

## Technical Approach

### Files to modify

1. **`apps/backend/src/modules/ranking/services/ranking-engine.ts`**
   - Add `sortBy?: 'trust' | 'match'` to the `RankingOptions` type
   - Refactor the sort comparator into a factory function that accepts `sortBy` and returns the appropriate comparator
   - For `sortBy: 'trust'` (and default): `trustScore desc → matchScore desc → compositeScore desc`
   - For `sortBy: 'match'`: `matchScore desc → trustScore desc → compositeScore desc`
   - Keep the same `undefined` defaults: `trustScore` → 5, `matchScore` → 50
   - The existing `rankJobs` function signature changes to accept the optional `sortBy` via `RankingOptions`

2. **`apps/backend/src/modules/search/services/aggregation-service.ts`**
   - At line 217-219, pass the `sort` from `input.sort` to the `rankJobs` call:
     ```typescript
     const { jobs: rankedJobs } = rankJobs(allJobs, {
       userSkills: userSkills?.normalized,
       sortBy: input.sort === 'trust' || input.sort === 'match' ? input.sort : 'trust',
     })
     ```
   - Only `'trust'` and `'match'` are valid for the ranking engine — map any other value to default `'trust'`

3. **`apps/backend/src/modules/ranking/services/ranking-engine.test.ts`**
   - Add test: `sortBy: 'trust'` sorts by trust first, then match, then composite
   - Add test: `sortBy: 'match'` sorts by match first, then trust, then composite
   - Add test: default (no sortBy) behaves as trust-first (backward compatibility)
   - Add test: `sortBy: 'relevance'` (legacy) falls back to trust-first default
   - Update existing tests to pass explicitly or verify backward compatibility

### What NOT to change

- Do NOT modify `composite-score.ts` or any other ranking sub-module
- Do NOT modify the search controller or validation (they already handle the `sort` param)
- Do NOT modify any frontend files

## Deliverables

- [ ] `RankingOptions` in `ranking-engine.ts` has optional `sortBy?: 'trust' | 'match'`
- [ ] `sortBy: 'trust'` sorts by `trustScore desc → matchScore desc → compositeScore desc`
- [ ] `sortBy: 'match'` sorts by `matchScore desc → trustScore desc → compositeScore desc`
- [ ] Default (no sortBy) behaves as trust-first for backward compatibility
- [ ] `aggregation-service.ts` passes `input.sort` to `rankJobs` via `RankingOptions`
- [ ] `sort=relevance` still works (falls back to trust-first default)
- [ ] `ranking-engine.test.ts` covers both sort modes + backward compatibility
- [ ] All backend tests pass
