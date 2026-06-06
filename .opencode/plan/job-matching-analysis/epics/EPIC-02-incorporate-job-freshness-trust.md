# EPIC-02: Incorporate Job Freshness into Trust Score

**Context:** `job-matching-analysis`  
**Epic ID:** `EPIC-02`  
**Priority:** High  
**Status:** Draft  
**Dependencies:** None  
**Estimated Effort:** Medium (2-3 days)

---

## Objective

Add job freshness (days since posted) as a weighted component in the trust score calculation so that older jobs receive appropriately lower trust scores. Currently, freshness is calculated in the trust breakdown but not factored into the final trust score.

---

## Background

**Analysis Source:** `feasibility.md` → Approach A (Incorporate Freshness Score into Trust Score Calculation)  
**Issue:** Days since posted not properly affecting trust score  
**Root Cause:** `calculateTrustScore` in `trust-score-formula.ts` only uses 3 components (provider, company, transparency); freshness score exists in breakdown but is unused in final score  
**Recommended Fix:** Add freshness as 4th component with 15% weight; adjust existing weights to: provider 25%, company 35%, transparency 25%, freshness 15%

---

## Deliverables

1. **Modified `trust-score-formula.ts`** — Updated `calculateTrustScore` with freshness component and new weights
2. **Modified `trust-engine.ts`** — Updated trust breakdown generation to reflect new formula
3. **Updated unit tests** — All trust service unit tests reflecting new scoring behavior
4. **Verification test cases** — Manual test scenarios covering various job ages

---

## Tasks

### Implementation
- [ ] Read current `calculateTrustScore` in `apps/backend/src/modules/trust/services/trust-score-formula.ts`
- [ ] Add `freshnessScore` parameter to `calculateTrustScore` function
- [ ] Define new weight constants:
  - [ ] `PROVIDER_WEIGHT = 0.25` (was ~0.33)
  - [ ] `COMPANY_WEIGHT = 0.35` (was ~0.33)
  - [ ] `TRANSPARENCY_WEIGHT = 0.25` (was ~0.33)
  - [ ] `FRESHNESS_WEIGHT = 0.15` (new)
- [ ] Update formula: `trustScore = provider * 0.25 + company * 0.35 + transparency * 0.25 + freshness * 0.15`
- [ ] Ensure freshness score is normalized (0-10 scale, where 10 = posted today, 0 = very old)
- [ ] Update `trust-engine.ts` to pass freshness score to formula
- [ ] Update trust breakdown generation to include freshness component in final score

### Testing
- [ ] Update unit tests in trust services (`trust-score-formula.test.ts`, `trust-engine.test.ts`)
- [ ] Add test cases for:
  - [ ] Job posted today (freshness ≈ 10) — trust score boost
  - [ ] Job posted 3 days ago (freshness ≈ 8) — slight boost
  - [ ] Job posted 7 days ago (freshness ≈ 6) — neutral
  - [ ] Job posted 14 days ago (freshness ≈ 4) — penalty
  - [ ] Job posted 30+ days ago (freshness ≈ 1-2) — significant penalty
  - [ ] Job with missing `postedAt` (freshness = 5/default) — neutral
- [ ] Run full test suite: `pnpm --filter backend test`
- [ ] Verify trust score range remains 0-10
- [ ] Verify breakdown consistency with final score

### Verification
- [ ] Manual verification with sample jobs of varying ages
- [ ] Confirm older jobs receive lower trust scores
- [ ] Verify trust score threshold filtering (default 6.5) behaves correctly
- [ ] Document any edge cases found

---

## Acceptance Criteria

- [ ] `calculateTrustScore` accepts `freshnessScore` parameter
- [ ] New weights: provider=0.25, company=0.35, transparency=0.25, freshness=0.15 (sum = 1.0)
- [ ] Freshness score normalized 0-10 (10 = freshest)
- [ ] All trust service unit tests pass
- [ ] Job posted today gets ~1.5 point trust boost vs. 14-day-old job
- [ ] Job posted 30+ days ago gets ~1.5-2 point trust penalty vs. 7-day-old job
- [ ] Trust score range preserved (0-10)
- [ ] Trust breakdown includes freshness component matching final score
- [ ] No breaking changes to API response format
- [ ] No performance degradation

---

## Risk Mitigation

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Trust score changes causing unexpected filtering | Low | Normalize freshness 0-10; weight at 15% keeps impact moderate |
| Inconsistency between trust score and breakdown | Low | Update breakdown generation in same PR |
| Missing `postedAt` handling | Low | Default to neutral freshness (5) for missing dates |
| Test failures due to score changes | Medium | Update tests as part of implementation |

---

## Out of Scope (Future Iterations)

- Alternative freshness implementations in trust engine (Approach B/C)
- Per-user freshness preference configuration
- Dynamic freshness weight based on job type
- Freshness-based job expiration/archiving

---

## Files Touched

- `apps/backend/src/modules/trust/services/trust-score-formula.ts`
- `apps/backend/src/modules/trust/services/trust-engine.ts`
- `apps/backend/src/modules/trust/services/trust-score-formula.test.ts`
- `apps/backend/src/modules/trust/services/trust-engine.test.ts`

---

## Notes

- This epic is **independent** of EPIC-01 and can be worked on in parallel
- Changes are additive — no API contract modifications
- Existing cached trust scores will be recalculated on next search (stateless architecture)
- The 15% freshness weight was chosen to be impactful but not dominant
- Consider adding configuration for weights in future if tuning is needed frequently