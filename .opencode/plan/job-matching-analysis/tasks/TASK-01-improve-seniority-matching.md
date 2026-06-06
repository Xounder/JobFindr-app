# TASK-01 — Improve Seniority Matching Penalties

**Layer:** backend
**Depends on:** None
**Epic origin:** EPIC-01-improve-seniority-matching (source file)

## Description

Increase the penalty for seniority mismatches in the job match scoring algorithm by adjusting the weight constants in the weighted match scoring service. Seniority weight increases from 0.25 → 0.35, skill weight decreases from 0.6 → 0.5, keyword weight remains at 0.15.

## Technical Details

- **Files to modify:**
  - `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts` — Update `DEFAULT_WEIGHTS` constant
  - `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.test.ts` — Update unit tests for new scoring behavior

- **Dependencies:** None (independent task, can run in parallel with TASK-02)

- **Acceptance criteria:**
  - `seniorityWeight` = 0.35 in `DEFAULT_WEIGHTS`
  - `skillWeight` = 0.5 in `DEFAULT_WEIGHTS`
  - `keywordWeight` = 0.15 in `DEFAULT_WEIGHTS`
  - Weights sum to 1.0
  - All matchmaking unit tests pass
  - Seniority mismatch of 1 level reduces match score by ~10-15% more than before
  - Seniority mismatch of 2+ levels reduces match score by ~20-30% more than before
  - No breaking changes to API response format
  - No performance degradation

## Implementation Approach

1. Read current `DEFAULT_WEIGHTS` in `weighted-match-scoring.ts`
2. Update `seniorityWeight` from `0.25` → `0.35`
3. Update `skillWeight` from `0.6` → `0.5`
4. Verify `keywordWeight` remains at `0.15` (total = 1.0)
5. Run existing tests to identify failures
6. Update unit tests to reflect new expected scores
7. Add test cases for:
   - Exact seniority match (should score higher)
   - 1-level gap (e.g., Senior ↔ Mid) — moderate penalty
   - 2-level gap (e.g., Senior ↔ Junior) — significant penalty
   - 3+ level gap (e.g., Executive ↔ Junior) — severe penalty
   - User with no seniority specified (should not penalize)
8. Run full test suite: `pnpm --filter backend test`
9. Verify no regression in other match scoring components

## Testing

- Unit tests in `weighted-match-scoring.test.ts` updated for new weights
- Integration tests via `pnpm --filter backend test`
- Manual verification with sample job data covering seniority gaps
- Confirm match percentages change as expected

## Deliverables

- Modified `weighted-match-scoring.ts` with updated `DEFAULT_WEIGHTS`
- Updated unit tests reflecting new scoring behavior
- All backend tests passing