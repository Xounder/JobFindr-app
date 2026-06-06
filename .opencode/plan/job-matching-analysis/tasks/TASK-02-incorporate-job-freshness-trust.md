# TASK-02 — Incorporate Job Freshness into Trust Score

**Layer:** backend
**Depends on:** None
**Epic origin:** EPIC-02-incorporate-job-freshness-trust (source file)

## Description

Add job freshness (days since posted) as a weighted component in the trust score calculation. Freshness becomes the 4th component with 15% weight; existing weights adjusted to: provider 25%, company 35%, transparency 25%, freshness 15%. Update both the trust score formula and the trust engine to pass and include freshness in the breakdown.

## Technical Details

- **Files to modify:**
  - `apps/backend/src/modules/trust/services/trust-score-formula.ts` — Update `calculateTrustScore` with freshness component and new weights
  - `apps/backend/src/modules/trust/services/trust-engine.ts` — Update to pass freshness score to formula and update breakdown generation
  - `apps/backend/src/modules/trust/services/trust-score-formula.test.ts` — Update unit tests
  - `apps/backend/src/modules/trust/services/trust-engine.test.ts` — Update unit tests

- **Dependencies:** None (independent task, can run in parallel with TASK-01)

- **Acceptance criteria:**
  - `calculateTrustScore` accepts `freshnessScore` parameter
  - New weights: provider=0.25, company=0.35, transparency=0.25, freshness=0.15 (sum = 1.0)
  - Freshness score normalized 0-10 (10 = freshest)
  - All trust service unit tests pass
  - Job posted today gets ~1.5 point trust boost vs. 14-day-old job
  - Job posted 30+ days ago gets ~1.5-2 point trust penalty vs. 7-day-old job
  - Trust score range preserved (0-10)
  - Trust breakdown includes freshness component matching final score
  - No breaking changes to API response format
  - No performance degradation

## Implementation Approach

1. Read current `calculateTrustScore` in `trust-score-formula.ts`
2. Add `freshnessScore` parameter to `calculateTrustScore` function
3. Define new weight constants:
   - `PROVIDER_WEIGHT = 0.25` (was ~0.33)
   - `COMPANY_WEIGHT = 0.35` (was ~0.33)
   - `TRANSPARENCY_WEIGHT = 0.25` (was ~0.33)
   - `FRESHNESS_WEIGHT = 0.15` (new)
4. Update formula: `trustScore = provider * 0.25 + company * 0.35 + transparency * 0.25 + freshness * 0.15`
5. Ensure freshness score is normalized (0-10 scale, where 10 = posted today, 0 = very old)
6. Update `trust-engine.ts` to pass freshness score to formula
7. Update trust breakdown generation to include freshness component in final score
8. Update unit tests in trust services
9. Add test cases for:
   - Job posted today (freshness ≈ 10) — trust score boost
   - Job posted 3 days ago (freshness ≈ 8) — slight boost
   - Job posted 7 days ago (freshness ≈ 6) — neutral
   - Job posted 14 days ago (freshness ≈ 4) — penalty
   - Job posted 30+ days ago (freshness ≈ 1-2) — significant penalty
   - Job with missing `postedAt` (freshness = 5/default) — neutral
10. Run full test suite: `pnpm --filter backend test`
11. Verify trust score range remains 0-10
12. Verify breakdown consistency with final score

## Testing

- Unit tests in `trust-score-formula.test.ts` and `trust-engine.test.ts` updated
- Integration tests via `pnpm --filter backend test`
- Manual verification with sample jobs of varying ages
- Confirm older jobs receive lower trust scores
- Verify trust score threshold filtering (default 6.5) behaves correctly

## Deliverables

- Modified `trust-score-formula.ts` with freshness component and new weights
- Modified `trust-engine.ts` passing freshness and updated breakdown
- Updated unit tests reflecting new scoring behavior
- All backend tests passing