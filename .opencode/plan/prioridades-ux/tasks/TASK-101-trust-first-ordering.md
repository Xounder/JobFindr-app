# TASK-101 — Trust-First Default Ordering

**Layer:** backend
**Depends on:** None
**Epic origin:** `epics/epic-1-trust-first-ordering.md`

## Description

Change the default job sorting in the ranking engine to prioritize **trust score** first, then **match %**, then **composite score** as a tiebreaker. Currently, jobs are ordered by a single composite score that blends all factors. The new multi-key sort guarantees that trustworthy providers always appear first.

No frontend changes required — the API response schema is unchanged.

## Technical Approach

### Files to modify

1. **`apps/backend/src/modules/ranking/services/ranking-engine.ts`**
   - Modify the `rankJobs` sort comparator (lines 49-54) from single-key `compositeScore` to multi-key:
     - Primary: `trustScore` descending (default `5` if `undefined`)
     - Secondary: `matchScore` descending (default `50` if `undefined`)
     - Tertiary: `compositeScore` descending (fallback tiebreaker)
   - The `RankingOptions` type stays unchanged — no new parameters needed
   - Keep the existing composite score calculation intact (it is still computed for the breakdown and `rankingScore` on the job)
   - Example comparator logic:
     ```
     trustA = jobA.trustScore ?? 5
     trustB = jobB.trustScore ?? 5
     if trustB !== trustA → return trustB - trustA
     
     matchA = jobA.matchScore ?? 50
     matchB = jobB.matchScore ?? 50
     if matchB !== matchA → return matchB - matchA
     
     return compositeB - compositeA
     ```

2. **`apps/backend/src/modules/ranking/services/ranking-engine.test.ts`**
   - Update existing test `'sorts jobs by composite score descending'` to assert the new multi-key sort behavior
   - Add test case: a job with `trustScore=9, matchScore=30` ranks above a job with `trustScore=7, matchScore=85`
   - Add test case: a job with `trustScore=9, matchScore=85` ranks above a job with `trustScore=9, matchScore=30`
   - Add test case: jobs with `trustScore === undefined` default to 5 for sorting
   - Add test case: jobs with `matchScore === undefined` default to 50 for sorting
   - Keep existing tests for empty list, ranking map, and `rankingScore` attachment

### What NOT to change

- Do NOT modify the composite score calculation logic (`composite-score.ts`)
- Do NOT modify the `RankingOptions` type
- Do NOT modify any frontend files
- Do NOT modify the API response schema

## Deliverables

- [ ] `ranking-engine.ts` — sort comparator changed to multi-key: `trustScore desc → matchScore desc → compositeScore desc`
- [ ] Jobs with `trustScore === undefined` default to `5` for sorting
- [ ] Jobs with `matchScore === undefined` default to `50` for sorting
- [ ] `ranking-engine.test.ts` — updated and extended with multi-key sort tests
- [ ] All existing tests pass
- [ ] A job with `trustScore=9, matchScore=30` ranks above a job with `trustScore=7, matchScore=85`
- [ ] A job with `trustScore=9, matchScore=85` ranks above a job with `trustScore=9, matchScore=30`
- [ ] Cache regenerates automatically after deployment (no manual action)
