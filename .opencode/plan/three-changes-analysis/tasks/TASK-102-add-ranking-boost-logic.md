# TASK-102 — Add Ranking Boost Multipliers

**Layer:** backend
**Depends on:** TASK-101 (for understanding new threshold ranges)
**Epic origin:** EPIC-01-trust-model-rework (`.opencode/plan/three-changes-analysis/epics/EPIC-01-trust-model-rework.md`)

## Description

Add ranking boost multipliers to the `computeTrustScoreWeight()` function in the backend. Jobs with higher trust scores should receive a ranking boost to appear earlier in search results.

### Current Logic

```typescript
return (trustScore / 10) * weights.trustScore * 100
```

### New Logic

1. **Base calculation**: `(trustScore / 10) * weights.trustScore * 100`
2. **Boost 1**: If `trustScore >= 8.0`, apply **1.25x multiplier**
3. **Boost 2**: If `trustScore >= 9.0`, apply **1.5x multiplier** (stacks with 1.25x)
4. **Cap**: Final result must never exceed **100**

The boost is applied to the **ranking score only** — it does not modify the `matchScore` display value or any user-visible trust labels. The boost is purely a sort-order multiplier.

### Constraints

- Boosts are multiplicative (not additive): base * 1.25 * 1.5 for scores >= 9.0
- Cap at 100 ensures `rankingScore` never exceeds the maximum
- The `computeTrustScoreWeight()` return type remains `number` (0-100)
- No changes to the function signature or the `RankingWeights` type

## Deliverables

- [ ] Modify `computeTrustScoreWeight()` to apply 1.25x boost for trustScore >= 8.0
- [ ] Modify `computeTrustScoreWeight()` to apply 1.5x boost for trustScore >= 9.0
- [ ] Ensure result is capped at 100 (using `Math.min(100, ...)`)
- [ ] Update existing tests that expect the old (pre-boost) values
- [ ] Add tests for boost scenarios: 8.0, 8.5, 9.0, 9.5
- [ ] Add test for cap at 100 (trustScore = 10 with boost)

## Files to Modify

| File | Action |
|------|--------|
| `apps/backend/src/modules/ranking/services/trust-score-weight.ts` | Modify (add boost logic + cap) |
| `apps/backend/src/modules/ranking/services/trust-score-weight.test.ts` | Modify (update assertions, add new tests) |

## Complexity

**Small** (~15-20 lines of logic + test updates)

## Agent Allocation

**Backend only**

## Test Requirements

- Existing test `returns weighted score based on trustScore` needs update (expects 20 for trustScore=8, will now be 25 due to 1.25x boost)
- Existing test `returns neutral default when no trustScore` — verify unchanged
- Existing test `handles zero trust score` — verify unchanged (0 * anything = 0)
- New test: trustScore=8.0 → base=20, boosted=25
- New test: trustScore=9.0 → base=22.5, boosted=33.75 (22.5 * 1.25 * 1.5)
- New test: trustScore=10 → base=25, boosted=46.875, capped at... wait, 25 * 1.25 * 1.5 = 46.875. That's < 100. Actually let me check: `(10/10) * 0.25 * 100 = 25`. 25 * 1.25 = 31.25. 31.25 * 1.5 = 46.875. Still < 100. Cap is needed for edge cases where weights are higher.
- New test: ensure cap works (e.g., very high trustScore edge case)
