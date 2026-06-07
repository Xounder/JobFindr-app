# TASK-01-backend: Match Score Calculation Refinement

## Depends on
None

## Description
Add a work type factor to the match scoring algorithm in the backend. This introduces a new weighted component (`workTypeWeight = 0.15`) redistributed from existing weights (skill 0.45, seniority 0.30, keyword 0.10), plus a 100% clamp when skills, seniority, and work type all score perfectly.

The backend call chain must pass `remoteMode` and `countries` from `ValidatedSearchInput` into the match scoring functions so `calculateWorkTypeScore()` can evaluate job remote mode and location against the user's active filters.

Additionally, update the shared types package to add `workTypeMatch` to `MatchBreakdown` for downstream display.

## Technical Details

### Files to modify
- `packages/types/src/match.types.ts` — Add optional `workTypeMatch: 'exact' | 'partial' | 'none'` field to `MatchBreakdown`
- `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts` — Add `workTypeWeight`, `calculateWorkTypeScore()`, 100% clamp condition, redistribute weights
- `apps/backend/src/modules/search/services/aggregation-service.ts` — Pass `remoteMode` + `countries` from `ValidatedSearchInput` into `calculateWeightedMatchScoreWithBreakdown()` call

### Acceptance criteria
- `MatchWeights` updated to: `skillWeight: 0.45`, `seniorityWeight: 0.30`, `keywordWeight: 0.10`, `workTypeWeight: 0.15`
- `calculateWorkTypeScore()` implemented and returning correct scores:
  - `remote` filter active + job `remoteMode === 'remote'` → 1.0
  - `hybrid` or `on-site` filter active + country matches job location → 1.0
  - Multiple remote modes selected → checks against each
  - No relevant filters active → 0.5 (neutral)
- 100% clamp: when `skillScore >= 95` AND `seniorityScore === 1.0` AND `workTypeScore === 1.0` → overall = 100
- `MatchBreakdown` contains optional `workTypeMatch` field
- `aggregation-service.ts` passes `remoteMode`, `countries` from `input` to `calculateWeightedMatchScoreWithBreakdown()`
- All existing tests pass (`weighted-match-scoring.test.ts`, `similarity-engine.test.ts`, `ranking-engine.test.ts`, `composite-score.test.ts`, `match-explanation.test.ts`, `aggregation-service.test.ts`)
- New test cases cover work type scenarios (remote match, hybrid match, no filter, multiple modes, 100% clamp)

## Implementation Approach

1. **Update shared types** (`packages/types/src/match.types.ts`):
   - Add to `MatchBreakdown` interface: `workTypeMatch?: 'exact' | 'partial' | 'none'`
   - Rebuild shared package: `pnpm --filter @jobfindr/types build`

2. **Update match weights** in `weighted-match-scoring.ts`:
   - Change `skillWeight` from 0.50 to 0.45
   - Change `seniorityWeight` from 0.35 to 0.30
   - Change `keywordWeight` from 0.15 to 0.10
   - Add `workTypeWeight: 0.15`
   - Update `MatchWeights` type/interface accordingly

3. **Implement `calculateWorkTypeScore()`**:
   - Signature: `(remoteMode: string[], countries: string[], job: Job) => number`
   - Logic:
     ```
     if remoteMode includes 'remote' AND job.remoteMode === 'remote' → 1.0
     if remoteMode includes 'hybrid'/'on-site' AND job.country in countries → 1.0
     if no remoteMode selected AND (no countries OR no remoteMode filter) → 0.5
     otherwise → 0.0
     ```
   - Handle multi-mode: check each selected mode independently

4. **Add 100% clamp**:
   - In `computeMatchScoreWithBreakdown()`, after computing all components:
     ```
     if (skillScore >= 0.95 && seniorityScore === 1.0 && workTypeScore === 1.0) {
       overall = 100
     }
     ```
   - Build `workTypeMatch` into the `MatchBreakdown` object

5. **Update aggregation-service.ts**:
   - In the matchmaking loop (lines ~188-216), extract `remoteMode` and `countries` from `input`
   - Pass them as additional parameters to `calculateWeightedMatchScoreWithBreakdown()`
   - Update the function signature/call chain to accept the new params

6. **Update tests**:
   - Add test cases in `weighted-match-scoring.test.ts` for:
     - Remote mode exact match
     - Hybrid/on-site country match
     - No filter → neutral score
     - Multiple remote modes
     - 100% clamp condition (skills near-perfect + seniority exact + work type exact)
     - 100% clamp NOT triggered when one condition fails
   - Verify all existing tests still pass

## Testing

### Unit tests
- `weighted-match-scoring.test.ts`: New test cases for work type scoring and 100% clamp
- `similarity-engine.test.ts`: Ensure no regression (keyword weight change)
- `composite-score.test.ts`: Verify overall score composition with new weights
- `match-explanation.test.ts`: Ensure breakdown includes `workTypeMatch`

### Integration tests
- `aggregation-service.test.ts`: Verify matchmaking loop passes `remoteMode` and `countries`
- `ranking-engine.test.ts`: Verify ranking is not broken by score shifts

### Manual verification
- Run `pnpm --filter backend test` and confirm all tests pass
- Build shared types: `pnpm --filter @jobfindr/types build`

## References
- `.opencode/plan/match-filters-analysis/feasibility.md` — Change 1: Match Score Calculation Refinement
- `.opencode/plan/match-filters-analysis/impact-analysis.md` — Layer impact details
- `.opencode/plan/match-filters-analysis/risks.md` — Risk register for Change 1
- `packages/types/src/match.types.ts` — Current `MatchBreakdown` type definition
- `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts` — Current scoring implementation
- `apps/backend/src/modules/search/services/aggregation-service.ts` — Current aggregation pipeline
