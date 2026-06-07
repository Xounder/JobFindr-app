# Task: Refactor Match Score to Be Job-Centric (Change 1)

## Description
Refactor the matchmaking scoring engine to compute match percentage from the job's perspective: "X of Y job skills matched" instead of "X of Y user skills match". This changes the semantics of `matchedSkills` and `unmatchedSkills` in the API response from user-centric to job-centric.

## Technical Details
- **Files to modify:**
  - `apps/backend/src/modules/matchmaking/services/similarity-engine.ts` — Refactor `calculateSimilarity()` to base matched/missing on job skills
  - `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts` — Update `matchedSkillsDisplay` fallback and `buildSummary()` 
  - `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.test.ts` — Update all assertions for new semantics
  - `apps/backend/src/modules/matchmaking/services/similarity-engine.test.ts` — Update tests if exists
  - `apps/frontend/src/utils/explain.ts` — Verify `buildMatchExplanation()` works with new semantics
  - `apps/frontend/src/components/MatchExplanationModal.tsx` — Verify display works with job skills (no code change needed, content changes automatically)
- **Dependencies:** 
  - Must be done AFTER TASK-03 (filter seniority change) to avoid merge conflicts in `aggregation-service.ts` region
  - Should coordinate with TASK-04 (seniority tooltip) since both affect `MatchBreakdown` and `MatchExplanationModal`
- **Acceptance criteria:**
  1. `matchedSkills` in API response contains job skills the user possesses (not user skills that matched)
  2. `unmatchedSkills` contains job skills the user doesn't have
  3. Summary text reads "X of Y job skills matched" (not "X/Y skills match")
  4. Jaccard similarity score remains symmetric (unchanged)
  5. All backend tests pass with updated assertions
  6. Frontend `MatchExplanationModal` correctly displays job skills in matched/unmatched sections
  7. `explain.ts` `buildMatchExplanation()` shows correct counts

## Implementation Approach
1. **Backend — `similarity-engine.ts`:**
   - In `calculateSimilarity()`, change the matched/missing logic:
     - Iterate over `jobSet` (not `userSet`) to build `matchedSkills` and `missingSkills`
     - `matchedSkills` = job skills that exist in user skills
     - `missingSkills` = job skills that DON'T exist in user skills
   - Keep `jaccardSimilarity()` unchanged (intersection/union is symmetric)

2. **Backend — `weighted-match-scoring.ts`:**
   - Line 79-80: Update `matchedSkillsDisplay` fallback from `userSkills.filter(...)` to `jobSkills.filter(...)`
   - Update `buildSummary()` to accept `jobSkills.length` as denominator
   - Change summary text format from `"${matchedCount}/${totalUserSkills} skills match"` to `"${matchedCount} of ${totalJobSkills} job skills matched"`

3. **Backend Tests:**
   - Update all assertions on summary text format
   - Verify `matchedSkills` contains job skills, not user skills
   - Verify scores remain consistent (Jaccard is symmetric)

4. **Frontend — `explain.ts`:**
   - Verify `buildMatchExplanation()` uses `matchedSkills.length + unmatchedSkills.length` as total
   - This will now correctly be the job skills count

5. **Frontend — `MatchExplanationModal.tsx`:**
   - No code changes needed — the component renders `matchedSkills` and `unmatchedSkills` arrays as badges
   - Content will automatically show job skills instead of user skills

6. Build and test all packages

## Testing
- Run backend tests: `pnpm --filter backend test` (focus on matchmaking tests)
- Run frontend tests: `pnpm --filter frontend test`
- Manual integration test:
  - Set 30 user skills
  - Search for job with 3 required skills where only 1 matches
  - Open match explanation modal
  - Verify: "1 of 3 job skills matched" in summary
  - Verify: "Matched Skills" section shows 1 badge (the job skill user has)
  - Verify: "Unmatched Skills" section shows 2 badges (job skills user lacks)
- Verify no regression in seniority tooltip (TASK-04)

## Epic Origin
Epic 2: Match Score & Seniority Fixes (Change 1)