# Task: Job Title Suggestions in Search Bar (Change 6)

## Description
Add job title suggestions to the search bar autocomplete. Backend returns a new `titles` array alongside existing `skills` and `companies`. Frontend renders title suggestions with a briefcase icon and "Title" badge.

## Technical Details
- **Files to modify:**
  - `apps/backend/src/modules/suggestions/suggestions-controller.ts` — Add `SUGGESTED_TITLES` array and include in response
  - `apps/frontend/src/services/api.ts` — Extend `SuggestionsResponse` interface with `titles: string[]`
  - `apps/frontend/src/components/SearchBar.tsx` — Add title filtering, rendering, icon, and badge
- **Dependencies:** Backend changes must be deployed before frontend can consume the new field (but frontend handles missing field gracefully)
- **Acceptance criteria:**
  1. Backend `/suggestions` endpoint returns `{ skills, companies, titles }`
  2. `SUGGESTED_TITLES` contains ~30 common job titles
  3. Frontend `SuggestionsResponse` type includes `titles: string[]`
  4. Search bar dropdown shows title suggestions filtered by query
  5. Title suggestions display with briefcase icon (or similar) and "Title" badge
  6. Per-category limits ensure diverse suggestions (e.g., 4 skills, 2 companies, 2 titles = 8 total)
  7. All tests pass

## Implementation Approach
1. **Backend — `suggestions-controller.ts`:**
   - Add `SUGGESTED_TITLES` constant with ~30 job titles (see feasibility.md for sample list)
   - Update response to include `titles: SUGGESTED_TITLES`
   - No filtering on backend — frontend handles query filtering

2. **Frontend Types — `api.ts`:**
   - Extend `SuggestionsResponse` interface:
     ```typescript
     export interface SuggestionsResponse {
       skills: string[];
       companies: string[];
       titles: string[];  // NEW
     }
     ```

3. **Frontend — `SearchBar.tsx`:**
   - Add title filtering alongside existing skills/companies filtering
   - Implement per-category limits (e.g., `TITLES_PER_CATEGORY = 2`)
   - Add title items to `allSuggestions` array with `type: "title"`
   - Add briefcase icon for title type (can use existing icon set or add new)
   - Update badge rendering to show "Title" for title type
   - Adjust `MAX_SUGGESTIONS` or use category-based limiting

4. **Icon for titles:**
   - Check existing icons in `apps/frontend/src/components/icons/` or use a suitable Lucide/heroicon
   - Briefcase or BriefcaseBusiness icon recommended

5. Build and test:
   - `pnpm --filter backend build`
   - `pnpm --filter frontend build`
   - Run tests

## Testing
- Run backend tests: `pnpm --filter backend test`
- Run frontend tests: `pnpm --filter frontend test`
- Manual test:
  - Start backend and frontend
  - Open search bar, type "Senior"
  - Verify suggestions include "Senior Software Engineer", "Senior Developer" with "Title" badge
  - Type "Engineer" — verify "Software Engineer", "DevOps Engineer", etc. appear
  - Verify skills and companies suggestions still work
  - Verify dropdown doesn't exceed reasonable length

## Epic Origin
Epic 4: Search Bar Title Suggestions (Change 6)