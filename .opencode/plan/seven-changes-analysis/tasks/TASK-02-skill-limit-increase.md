# Task: Increase Skill Limit from 30 to 100 (Change 5)

## Description
Update backend validation and anti-spam middleware to allow up to 100 skills (both required skills and user skills) instead of the current limit of 30.

## Technical Details
- **Files to modify:**
  - `apps/backend/src/modules/search/validation/search-validation.ts` (lines 35, 110)
  - `apps/backend/src/modules/search/validation/search-validation.test.ts` (lines 34-36)
  - `apps/backend/src/shared/middleware/anti-spam.ts` (line 34)
- **Dependencies:** None (independent backend task)
- **Acceptance criteria:**
  1. `skills` query param accepts up to 100 items (was 30)
  2. `userSkills` query param accepts up to 100 items (was 30)
  3. Anti-spam middleware `maxSkillsCount` updated to 100
  4. Tests updated to expect 101 items to trigger validation error
  5. All existing tests pass

## Implementation Approach
1. Open `apps/backend/src/modules/search/validation/search-validation.ts`
   - Line 35: Change `if (skills.length > 30)` to `if (skills.length > 100)`
   - Line 110: Change `if (userSkills.length > 30)` to `if (userSkills.length > 100)`
2. Open `apps/backend/src/modules/search/validation/search-validation.test.ts`
   - Line 34-36: Update test that creates 31 skills to create 101 skills
   - Update error message assertion to reflect new limit
3. Open `apps/backend/src/shared/middleware/anti-spam.ts`
   - Line 34: Change `maxSkillsCount: 30` to `maxSkillsCount: 100`
4. Build backend to verify TypeScript compiles
5. Run backend tests: `pnpm --filter backend test`

## Testing
- Run backend unit tests: `pnpm --filter backend test`
- Manual test: Send search request with 50 skills — should succeed
- Manual test: Send search request with 101 skills — should return 400 validation error
- Verify anti-spam middleware doesn't block legitimate requests with >30 skills

## Epic Origin
Epic 3: Skill Limit Increase (Change 5)