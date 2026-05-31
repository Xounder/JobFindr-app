# TASK-204 — Update Seniority Default in Match Scoring

**Layer:** backend
**Depends on:** TASK-202 (conceptual dependency — seniority validation)
**Epic origin:** EPIC-02-user-skills-matchmaking (`.opencode/plan/three-changes-analysis/epics/EPIC-02-user-skills-matchmaking.md`)

## Description

Change the seniority default behavior in `weighted-match-scoring.ts` so that when `userSeniority` is **not provided** (undefined/null), the seniority score returns **0** (penalty) instead of the current **0.5** (neutral). This ensures that users who explicitly provide their seniority level get better match scores than those who don't.

### Current Code

```typescript
function calculateSeniorityScore(
  userSeniority: string | undefined,
  jobSeniority: string | undefined
): number {
  if (!userSeniority || !jobSeniority) return 0.5 // Neutral if unknown
  // ... rest of logic
}
```

### New Code

```typescript
function calculateSeniorityScore(
  userSeniority: string | undefined,
  jobSeniority: string | undefined
): number {
  if (!userSeniority || !jobSeniority) return 0 // Penalty if unknown
  // ... rest of logic unchanged
}
```

### Rationale

- When a user doesn't specify their seniority, the match score shouldn't assume a neutral 0.5 for seniority alignment
- Returning 0 means the seniority component doesn't contribute positively, encouraging users to set their seniority
- This is part of the "personalized matchmaking" feature — the match becomes better when more profile data is provided
- The seniority weight (0.25 or 25%) ensures this doesn't completely kill the match score

### Impact Analysis

| Scenario | Old Seniority Score (0.5) | New Seniority Score (0) | Δ Overall Match |
|----------|--------------------------|------------------------|-----------------|
| Perfect skill match, no seniority | ~75% | ~60% | -15% |
| No skill match, no seniority | ~12% | ~0% | -12% |

The maximum possible impact on overall match is `0.25 * 0.5 * 100 = 12.5` points (since seniority weight is 25% and the change is 0.5 → 0).

## Files to Modify

| File | Action |
|------|--------|
| `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts` | Modify (change default return value) |
| `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.test.ts` | Modify (update test that expects neutral behavior) |

## Complexity

**Small** (~2 lines changed in implementation + test updates)

## Agent Allocation

**Backend only**

## Test Requirements

- Update existing test `handles missing seniority with neutral score` (currently expects `result.overall > 50`):
  - With seniority disabled (0), the overall score will be lower since only skillWeight (0.6) and keywordWeight (0.15) contribute
  - For `userSkills=['react']` and `jobSkills=['react']`, the old score was ~67.5% (0.6 * 100 + 0.25 * 0.5 * 100 + ...)
  - New score with seniority=0: ~60%
  - Update assertion to `result.overall >= 50` or calculate exact expected value
- Add new test: `returns lower score when seniority is undefined compared to when it's set`
- Add new test: `seniority score is 0 when userSeniority is undefined` (unit test the function directly)
