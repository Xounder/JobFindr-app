# TASK-106 — Update Tests for Trust Model Rework

**Layer:** both (frontend + backend)
**Depends on:** TASK-101, TASK-102, TASK-103
**Epic origin:** EPIC-01-trust-model-rework (`.opencode/plan/three-changes-analysis/epics/EPIC-01-trust-model-rework.md`)

## Description

Update all existing tests that are affected by the trust model changes and add new tests for the new functionality. This task validates that the implementation tasks (TASK-101, TASK-102, TASK-103) are working correctly.

### Frontend Tests — `apps/frontend/src/utils/index.test.ts`

The existing `trustLabel` tests need to be updated from the 3-level (buggy) scheme to the new 6-level scheme:

#### Current Tests (to update)

```typescript
// OLD: expects "High Trust" for >= 80
it('returns "High Trust" for >= 80', () => {
  expect(trustLabel(85)).toBe('High Trust')
})

// OLD: expects "Medium Trust" for >= 50
it('returns "Medium Trust" for >= 50', () => {
  expect(trustLabel(65)).toBe('Medium Trust')
})

// OLD: expects "Low Trust" for < 50
it('returns "Low Trust" for < 50', () => {
  expect(trustLabel(30)).toBe('Low Trust')
})
```

#### New Tests

```typescript
it('returns "High Trust" for >= 9', () => {
  expect(trustLabel(9.5)).toBe('High Trust')
})
it('returns "Good Trust" for >= 8', () => {
  expect(trustLabel(8.4)).toBe('Good Trust')
})
it('returns "Trust" for >= 7', () => {
  expect(trustLabel(7.8)).toBe('Trust')
})
it('returns "Medium Trust" for >= 6', () => {
  expect(trustLabel(6.5)).toBe('Medium Trust')
})
it('returns "Low Trust" for >= 5', () => {
  expect(trustLabel(5.5)).toBe('Low Trust')
})
it('returns "Extreme Low Trust" for < 5', () => {
  expect(trustLabel(4.9)).toBe('Extreme Low Trust')
})
```

### Backend Tests — `apps/backend/src/modules/ranking/services/trust-score-weight.test.ts`

#### Existing test to update

```typescript
// Current: expects 20 for trustScore=8 with weight 0.25
// OLD: (8/10) * 0.25 * 100 = 20
// NEW: (8/10) * 0.25 * 100 * 1.25 = 25 (with 1.25x boost at >= 8)
it('returns weighted score based on trustScore', () => {
  const job = { id: '1', trustScore: 8 } as NormalizedJob
  expect(computeTrustScoreWeight(job, weights)).toBe(25) // was 20
})
```

#### New tests to add

- Test boost at 9.0 with 1.25x * 1.5x = 1.875x multiplier
- Test no boost at 7.9 (below 8.0 threshold)
- Test cap at 100
- Test zero trust score returns 0

### Types Tests (if any exist)

Check if there are existing tests for `trust.types.ts`. If not, create a new test file:

- Test `getTrustVisibility()` for all threshold boundaries
- Test `getTrustClassification()` for all 6 levels

## Files to Modify

| File | Action |
|------|--------|
| `apps/frontend/src/utils/index.test.ts` | Modify (update trustLabel tests) |
| `apps/backend/src/modules/ranking/services/trust-score-weight.test.ts` | Modify (update assertions, add boost tests) |
| `packages/types/src/trust.types.test.ts` | Create if not exists (test getTrustVisibility, getTrustClassification) |

## Complexity

**Small** (~40-60 lines of test code)

## Agent Allocation

**Both** — frontend test updates need Frontend agent; backend and types test updates need Backend agent.

## Deliverables

- [ ] Update `trustLabel` tests in frontend (6 new assertions replacing 3 old ones)
- [ ] Update `computeTrustScoreWeight` test for new boost values
- [ ] Add boost tests (8.0, 9.0, cap)
- [ ] Create/update `trust.types.ts` tests for `getTrustVisibility()` and `getTrustClassification()`
- [ ] Run `pnpm test` across all packages to verify no regressions
