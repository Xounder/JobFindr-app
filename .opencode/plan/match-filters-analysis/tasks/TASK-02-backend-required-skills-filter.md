# TASK-02-backend: Required Skills Filter Exclusivity

## Depends on
None

## Description
Add a filter step in `aggregation-service.ts` that makes the Required Skills filter exclusive: when skills are selected in the Required Skills filter, **only jobs containing ALL of those skills** should be returned. Currently, the `input.skills` parameter is only used as a fallback for matchmaking when `userSkills` is empty — it does not filter jobs at all.

This change adds a filter step after existing filters (company, remoteMode, seniority, country) that strips jobs missing any of the required skills.

## Technical Details

### Files to modify
- `apps/backend/src/modules/search/services/aggregation-service.ts` — Add ~10 lines for the exclusive skills filter

### Acceptance criteria
- When `input.skills.length > 0`, only jobs where ALL required skills exist in the job's skill list (case-insensitive) are retained
- Jobs missing even one required skill are excluded from results
- When `input.skills` is empty, no filtering occurs (behavior unchanged)
- The `skills` parameter continues to serve as fallback for matchmaking (unchanged behavior)
- Filter is placed AFTER company, remoteMode, seniority, country filters but BEFORE matchmaking/ranking
- Existing tests pass (`aggregation-service.test.ts`, `FiltersPanel.test.tsx`)
- New test cases verify exclusive filtering with various skill combinations

## Implementation Approach

1. **Add filter step in aggregation-service.ts** (after line ~186, the country filter block):
   ```typescript
   // Required Skills exclusive filter
   if (input.skills.length > 0) {
     const normalizedRequiredSkills = input.skills.map((s) => s.toLowerCase());
     allJobs = allJobs.filter((job) =>
       normalizedRequiredSkills.every((requiredSkill) =>
         (job.skills ?? []).some(
           (jobSkill: string) => jobSkill.toLowerCase() === requiredSkill
         )
       )
     );
   }
   ```

2. **Place the filter correctly**:
   - Must go AFTER company/remoteMode/seniority/country filters (lines ~160-186)
   - Must go BEFORE matchmaking/ranking (lines ~188+)
   - This ensures filtering happens before the more expensive scoring operations

3. **Consider the dual use of `input.skills`**:
   - Line 189: `const skillsForMatchmaking = input.userSkills.length > 0 ? input.userSkills : input.skills`
   - This fallback behavior is preserved — `input.skills` is still used as matchmaking fallback when `userSkills` is empty
   - The new filter step runs before this matchmaking fallback is evaluated

4. **Update tests**:
   - Add test cases in `aggregation-service.test.ts`:
     - Required skills filter with all skills present → job included
     - Required skills filter with one missing skill → job excluded
     - Required skills filter with case-insensitive matching
     - Empty `input.skills` → no filtering
     - Combined with other filters (company, remoteMode)

## Testing

### Unit tests
- `aggregation-service.test.ts`: New test cases for required skills exclusive filtering

### Manual verification
- Run `pnpm --filter backend test` and confirm all tests pass
- Verify that setting Required Skills on the frontend results in only matching jobs
- Verify that jobs missing required skills are excluded even if they match on other criteria

## References
- `.opencode/plan/match-filters-analysis/feasibility.md` — Change 4: Required Skills Filter Exclusivity
- `.opencode/plan/match-filters-analysis/impact-analysis.md` — Breaking change details
- `.opencode/plan/match-filters-analysis/risks.md` — Risk register for Change 4
- `apps/backend/src/modules/search/services/aggregation-service.ts` — Current aggregation pipeline with existing filter pattern
