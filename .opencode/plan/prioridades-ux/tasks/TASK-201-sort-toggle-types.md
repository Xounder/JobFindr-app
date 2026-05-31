# TASK-201 — Add sortBy to Shared Types

**Layer:** shared (types package)
**Depends on:** TASK-101
**Epic origin:** `epics/epic-2-sort-toggle.md`

## Description

Add `'trust'` and `'match'` values to the `SearchSortOption` type in the shared `@jobfindr/types` package. This is the types-only foundation for the sort toggle feature — the backend will use this type to support conditional multi-key sorting, and the frontend will use it for the toggle UI.

Existing sort values (`'relevance'`, `'date'`, `'salary_high'`, `'salary_low'`) remain unchanged.

## Technical Approach

### Files to modify

1. **`packages/types/src/search-dto.ts`**
   - Add `'trust'` and `'match'` to the `SearchSortOption` union type:
     ```typescript
     export type SearchSortOption =
       | 'relevance'
       | 'date'
       | 'salary_high'
       | 'salary_low'
       | 'trust'
       | 'match'
     ```

2. **`apps/backend/src/modules/search/validation/search-validation.ts`**
   - Add `'trust'` and `'match'` to the `VALID_SORT_OPTIONS` array (line 19-21):
     ```typescript
     const VALID_SORT_OPTIONS: SearchSortOption[] = [
       'relevance', 'date', 'salary_high', 'salary_low', 'trust', 'match',
     ]
     ```
   - This ensures the backend validation accepts the new sort values.

### What NOT to change

- Do NOT modify the `RankingOptions` type yet (that's in TASK-202)
- Do NOT modify any frontend types (that's in TASK-203)
- Do NOT modify any ranking engine logic

## Deliverables

- [ ] `SearchSortOption` in `packages/types/src/search-dto.ts` includes `'trust'` and `'match'`
- [ ] `VALID_SORT_OPTIONS` in `search-validation.ts` includes `'trust'` and `'match'`
- [ ] Backend package builds successfully (`pnpm --filter @jobfindr/types build`)
- [ ] All existing tests pass
