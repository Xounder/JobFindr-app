# Epic 1: Trust-First Default Ordering

**Priority:** 1 (Foundation)
**Effort:** Small
**Layer:** Backend only
**Dependencies:** None

## Description

Change the default job sorting in the ranking engine to prioritize **trust score** first, then **matching %**, then **composite score** as a tiebreaker.

Currently, jobs are ordered by a single composite score that blends all factors (match, trust, company size, salary, recency). This makes it possible for a low-trust job with a high salary to appear above a high-trust job with a good match. The new multi-key sort guarantees that trustworthy providers always appear first.

## Acceptance Criteria

- [ ] `ranking-engine.ts` sort comparator is changed to multi-key: `trustScore desc → matchScore desc → compositeScore desc`
- [ ] Jobs with `trustScore === undefined` default to `5`
- [ ] Jobs with `matchScore === undefined` default to `50`
- [ ] All existing tests pass with updated sort assertions
- [ ] A job with `trustScore=9, matchScore=30` ranks above a job with `trustScore=7, matchScore=85`
- [ ] A job with `trustScore=9, matchScore=85` ranks above a job with `trustScore=9, matchScore=30`
- [ ] No frontend changes required — API response schema is unchanged
- [ ] Cache regenerates automatically after deployment

## Affected Files

| Action | File |
|--------|------|
| MODIFY | `apps/backend/src/modules/ranking/services/ranking-engine.ts` |
| MODIFY | `apps/backend/src/modules/ranking/services/ranking-engine.test.ts` |
