# TASK-203 — Update Aggregation Service for User Skills

**Layer:** backend
**Depends on:** TASK-202 (validation must provide parsed userSkills/userSeniority)
**Epic origin:** EPIC-02-user-skills-matchmaking (`.opencode/plan/three-changes-analysis/epics/EPIC-02-user-skills-matchmaking.md`)

## Description

Update `aggregation-service.ts` to use `input.userSkills` for matchmaking when present, falling back to `input.skills` for backward compatibility. Also pass `input.userSeniority` instead of `undefined` to `calculateWeightedMatchScore()`.

### Current Code (to modify)

```typescript
// Line 189-191: Parse user skills for matchmaking
const userSkills = input.skills.length > 0
  ? parseUserSkills(input.skills)
  : null

// Line 196-203: Apply matchmaking
if (userSkills && userSkills.normalized.length > 0) {
  for (const job of allJobs) {
    const matchScore = calculateWeightedMatchScore(
      userSkills.normalized,
      undefined, // User seniority not collected for MVP     <-- CHANGE
      job.skills,
      job.seniority,
    )
    job.matchScore = matchScore.overall
  }
}
```

### New Code

```typescript
// Use userSkills if provided, fall back to skills
const skillsForMatchmaking = input.userSkills ?? input.skills

const userSkills = skillsForMatchmaking.length > 0
  ? parseUserSkills(skillsForMatchmaking)
  : null

if (userSkills && userSkills.normalized.length > 0) {
  for (const job of allJobs) {
    const matchScore = calculateWeightedMatchScore(
      userSkills.normalized,
      input.userSeniority,  // Now passes userSeniority instead of undefined
      job.skills,
      job.seniority,
    )
    job.matchScore = matchScore.overall
  }
}
```

### Key Logic

- `input.userSkills ?? input.skills` — uses userSkills when present, otherwise falls back to skills
- `input.userSeniority` passed directly (could be `undefined`, which is handled by `calculateSeniorityScore()`)
- No other changes to the aggregation pipeline

## Files to Modify

| File | Action |
|------|--------|
| `apps/backend/src/modules/search/services/aggregation-service.ts` | Modify (userSkills fallback, pass userSeniority) |

## Complexity

**Small** (~5-10 lines changed)

## Agent Allocation

**Backend only**

## Test Requirements

- Unit test: `userSkills` present → it's used (not `skills`)
- Unit test: `userSkills` absent → `skills` is used as fallback
- Unit test: `userSeniority` passed to `calculateWeightedMatchScore()` instead of `undefined`
