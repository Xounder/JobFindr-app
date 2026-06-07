# TASK-05-frontend: Companies Filters Reflecting Actual Results

## Depends on
None

## Description
Make the Company Filters (Include/Exclude Companies) show actual companies from the current search results instead of the global cached suggestions. Currently, `CompanyFilters` uses `useSuggestions()` which returns ALL cached companies from all past searches plus hardcoded fallbacks — unrelated to the current search.

In this change, the `HomePage` component computes unique company names from `data?.jobs` (the search results) and passes them through `FiltersPanel` to `CompanyFilters` as a `resultSuggestions` prop. The `CompanyFilters` component uses these suggestions when available, falling back to `useSuggestions()` when no results exist yet (initial page load).

## Technical Details

### Files to modify
- `apps/frontend/src/pages/HomePage.tsx` — Compute `resultCompanies` from `data?.jobs` using `useMemo`, pass to `FiltersPanel`
- `apps/frontend/src/components/FiltersPanel.tsx` — Accept `resultCompanies` prop, forward to `CompanyFilters`
- `apps/frontend/src/components/CompanyFilters.tsx` — Accept optional `resultSuggestions` prop; use as override when provided

### Acceptance criteria
- Company suggestions in Include/Exclude inputs show companies from current search results
- On initial page load (no search yet), falls back to global `useSuggestions()` companies
- Company list updates reactively when new search results arrive
- `useMemo` dependency ensures re-computation only when `data` reference changes
- Companies are deduplicated (unique values only)
- Empty state handled gracefully when no results or all jobs lack company info
- All existing tests pass (`HomePage.test.tsx`, `FiltersPanel.test.tsx`, `CompanyFilters.test.tsx`)

## Implementation Approach

1. **Update `HomePage.tsx`** — compute result companies:
   ```typescript
   // Before the return statement, after data is available
   const resultCompanies = useMemo(
     () => [...new Set((data?.jobs ?? []).map((j) => j.company).filter(Boolean))],
     [data]
   );
   ```
   - Pass `resultCompanies` to `<FiltersPanel>`:
     ```tsx
     <FiltersPanel
       ...
       resultCompanies={resultCompanies}
     />
     ```

2. **Update `FiltersPanel.tsx`** — add prop and forward to `CompanyFilters`:
   - Add `resultCompanies?: string[]` to the component's props interface
   - Pass it to `<CompanyFilters>`:
     ```tsx
     <CompanyFilters
       includeItems={filters.companies}
       excludeItems={filters.excludeCompanies}
       onIncludeChange={onIncludeChange}
       onExcludeChange={onExcludeChange}
       resultSuggestions={resultCompanies}
     />
     ```

3. **Update `CompanyFilters.tsx`** — use `resultSuggestions`:
   - Add `resultSuggestions?: string[]` to props interface
   - Modify the suggestions source logic:
     ```typescript
     const { data: suggestions } = useSuggestions();
     
     const companySuggestions = useMemo(() => {
       // Use result-specific suggestions when available
       if (resultSuggestions && resultSuggestions.length > 0) {
         return resultSuggestions;
       }
       // Fall back to global suggestions
       return suggestions?.companies ?? [];
     }, [resultSuggestions, suggestions]);
     ```
   - Use `companySuggestions` in both `AutocompleteInput` components instead of `suggestions?.companies`

## Testing

### Unit tests
- `CompanyFilters.test.tsx`: Add test cases for:
  - `resultSuggestions` prop overrides default suggestions
  - Empty `resultSuggestions` falls back to `useSuggestions()`
  - Suggestions update when `resultSuggestions` changes
- `FiltersPanel.test.tsx`: Verify prop forwarding
- `HomePage.test.tsx`: Verify `resultCompanies` computed from mock data

### Manual verification
- Run `pnpm --filter frontend test` and confirm all tests pass
- Run app, perform a search, observe company suggestions show only companies from results
- On initial page load, observe global suggestions shown (not empty)

## References
- `.opencode/plan/match-filters-analysis/feasibility.md` — Change 5: Companies Filters Reflecting Actual Results
- `.opencode/plan/match-filters-analysis/impact-analysis.md` — Layer impact details
- `.opencode/plan/match-filters-analysis/risks.md` — Risk register for Change 5
- `apps/frontend/src/pages/HomePage.tsx` — Current data flow and FiltersPanel usage
- `apps/frontend/src/components/FiltersPanel.tsx` — Current props interface
- `apps/frontend/src/components/CompanyFilters.tsx` — Current suggestions logic with `useSuggestions()`
