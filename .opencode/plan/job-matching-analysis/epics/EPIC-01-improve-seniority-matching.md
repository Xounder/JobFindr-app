# EPIC-01: Improve Seniority Matching Penalties

**Context:** `job-matching-analysis`  
**Epic ID:** `EPIC-01`  
**Priority:** High  
**Status:** Draft  
**Dependencies:** None  
**Estimated Effort:** Small (1-2 days)

---

## Objective

Increase the penalty for seniority mismatches in the job match scoring algorithm so that jobs with significant seniority gaps receive appropriately lower match percentages. Currently, seniority weight is too low (0.25) relative to skills (0.6), causing seniority mismatches to be under-penalized.

---

## Background

**Analysis Source:** `feasibility.md` → Approach A (Increase Seniority Weight)  
**Issue:** Seniority mismatch not sufficiently penalized in match percentage  
**Root Cause:** `seniorityWeight = 0.25` and `skillWeight = 0.6` in `DEFAULT_WEIGHTS` constant  
**Recommended Fix:** Increase `seniorityWeight` to 0.35, decrease `skillWeight` to 0.5

---

## Deliverables

1. **Modified `weighted-match-scoring.ts`** — Updated `DEFAULT_WEIGHTS` constant
2. **Updated unit tests** — All matchmaking unit tests reflecting new scoring behavior
3. **Verification test cases** — Manual test scenarios covering various seniority gaps

---

## Tasks

### Implementation
- [ ] Read current `DEFAULT_WEIGHTS` in `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts`
- [ ] Update `seniorityWeight` from `0.25` → `0.35`
- [ ] Update `skillWeight` from `0.6` → `0.5`
- [ ] Verify `keywordWeight` remains at `0.15` (total = 1.0)
- [ ] Run existing tests to identify failures

### Testing
- [ ] Update unit tests in matchmaking services to reflect new expected scores
- [ ] Add test cases for:
  - [ ] Exact seniority match (should score higher)
  - [ ] 1-level gap (e.g., Senior ↔ Mid) — moderate penalty
  - [ ] 2-level gap (e.g., Senior ↔ Junior) — significant penalty
  - [ ] 3+ level gap (e.g., Executive ↔ Junior) — severe penalty
  - [ ] User with no seniority specified (should not penalize)
- [ ] Run full test suite: `pnpm --filter backend test`
- [ ] Verify no regression in other match scoring components

### Verification
- [ ] Manual verification with sample job data covering seniority gaps
- [ ] Confirm match percentages change as expected
- [ ] Document any edge cases found

---

## Acceptance Criteria

- [ ] `seniorityWeight` = 0.35 in `DEFAULT_WEIGHTS`
- [ ] `skillWeight` = 0.5 in `DEFAULT_WEIGHTS`
- [ ] `keywordWeight` = 0.15 in `DEFAULT_WEIGHTS`
- [ ] Weights sum to 1.0
- [ ] All matchmaking unit tests pass
- [ ] Seniority mismatch of 1 level reduces match score by ~10-15% more than before
- [ ] Seniority mismatch of 2+ levels reduces match score by ~20-30% more than before
- [ ] No breaking changes to API response format
- [ ] No performance degradation

---

## Risk Mitigation

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Over-penalizing seniority mismatches | Medium | Start with 0.35 (not 0.4); monitor match rates; adjustable via config later |
| Under-penalizing if weight too small | Medium | Automated tests verify penalty behavior for known gaps |
| Test failures due to score changes | Medium | Update tests as part of implementation (not after) |

---

## Out of Scope (Future Iterations)

- Non-linear seniority penalty curves (exponential/stepped)
- Separate seniority mismatch threshold filters
- Per-user seniority preference configuration
- A/B testing framework for weight calibration

---

## Files Touched

- `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts`
- `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.test.ts` (or co-located test file)

---

## Notes

- This epic is **independent** of EPIC-02 and can be worked on in parallel
- Changes are additive — no API contract modifications
- Existing cached match scores will be recalculated on next search (stateless architecture)
- Consider adding configuration for weights in future if tuning is needed frequently