# Task: Use Filter Panel Seniority for Matchmaking (Change 3)

## Description
Modify `aggregation-service.ts` to use the filter panel's seniority selection (`input.seniority`) instead of the User Skills modal's seniority (`input.userSeniority`) when computing match scores.

## Technical Details
- **Files to modify:**
  - `apps/backend/src/modules/search/services/aggregation-service.ts` (around line 199)
- **Dependencies:** None (independent backend task, but should be done before Change 1 to avoid merge conflicts in same code region)
- **Acceptance criteria:**
  1. Matchmaking uses `input.seniority` (filter panel) instead of `input.userSeniority` (modal)
  2. Array normalization: single value → use it; empty → undefined; multiple → use first value
  3. `userSeniority` remains in API payload for backward compatibility but is ignored for matchmaking
  4. All existing tests pass

## Implementation Approach
1. Open `apps/backend/src/modules/search/services/aggregation-service.ts`
2. Locate the matchmaking block (around lines 194-206)
3. Add normalization logic before the matchmaking call:
   ```typescript
   const matchmakingSeniority: string | undefined =
     input.seniority.length === 1
       ? input.seniority[0]
       : input.seniority.length > 1
         ? input.seniority[0]  // use first when multiple selected
         : undefined
   ```
4. Replace `input.userSeniority` with `matchmakingSeniority` in the `calculateWeightedMatchScoreWithBreakdown` call (line 199)
5. Add comment explaining the array handling strategy
6. Build backend to verify TypeScript compiles
7. Run backend tests: `pnpm --filter backend test`

## Testing
- Run backend unit tests: `pnpm --filter backend test`
- Integration test: Set different filter seniority (Senior) and modal seniority (Junior), search for jobs
- Verify match scores reflect filter panel seniority, not modal seniority
- Test edge cases: empty filter seniority array, multiple seniority values selected

## Epic Origin
Epic 2: Match Score & Seniority Fixes (Change 3)