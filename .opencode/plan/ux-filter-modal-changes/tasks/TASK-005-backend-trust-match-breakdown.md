# TASK-005 — Backend Trust & Match Breakdown Data

**Layer:** Backend
**Depends on:** None
**Epic origin:** EPIC-04-interactive-trust-match-explanations.md (Item 5: Backend part)
**Agent:** Senior Backend

## Description

Add structured breakdown data (`MatchBreakdown` and `TrustBreakdown`) to the backend search response. Update shared types, match scoring, trust engine, and aggregation service to produce and propagate these breakdown fields alongside the existing aggregate scores. The frontend will use this data to display interactive explanation modals (TASK-006).

## Files to Modify

### Shared Types (`packages/types/src/`)
- `packages/types/src/match.types.ts` — Add `MatchBreakdown` type
- `packages/types/src/trust.types.ts` — Add `TrustBreakdown` type
- `packages/types/src/normalized-job.ts` — Add optional `matchBreakdown` and `trustBreakdown` fields to `NormalizedJob`
- `packages/types/src/index.ts` — Export new types

### Backend
- `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts` — Return `MatchBreakdown` alongside `MatchScore`
- `apps/backend/src/modules/trust/services/trust-engine.ts` — Return `TrustBreakdown` alongside `TrustScore`
- `apps/backend/src/modules/search/services/aggregation-service.ts` — Propagate breakdown data through the pipeline and onto `NormalizedJob`

### Tests
- Update existing test files for `weighted-match-scoring`, `trust-engine`, `aggregation-service`

## Deliverables

### 1. Define `MatchBreakdown` type (in `packages/types/src/match.types.ts`)

```typescript
export interface MatchBreakdown {
  matchedSkills: string[];
  unmatchedSkills: string[];
  seniorityMatch: "exact" | "close" | "none";
  weightedScore: number;
  skillScoreContribution: number;
  seniorityScoreContribution: number;
}
```

Export from `packages/types/src/index.ts`.

### 2. Define `TrustBreakdown` type (in `packages/types/src/trust.types.ts`)

```typescript
export interface TrustBreakdown {
  providerScore: number;
  companyAdjustment: number;
  freshnessScore: number;
  signals: {
    providerReputation: string;
    companySizeBonus: number;
    isKnownEmployer: boolean;
    daysSincePosted: number;
  };
}
```

Export from `packages/types/src/index.ts`.

### 3. Update `NormalizedJob` (in `packages/types/src/normalized-job.ts`)

Add optional fields:
```typescript
matchBreakdown?: MatchBreakdown;
trustBreakdown?: TrustBreakdown;
```

### 4. Update `weighted-match-scoring.ts`

Modify `calculateWeightedMatchScore` to return (or attach) a `MatchBreakdown` alongside the existing `MatchScore` return. The breakdown should derive from the existing similarity calculation:
- `matchedSkills` — from `similarity.matchedSkills`
- `unmatchedSkills` — from `similarity.missingSkills`
- `seniorityMatch` — derive from `calculateSeniorityScore`: "exact" for 1.0, "close" for >= 0.7, "none" otherwise
- `weightedScore` — the `overall` score
- `skillScoreContribution` — the `skillComponent` value
- `seniorityScoreContribution` — the `seniorityComponent` value

**Important**: Keep the existing `MatchScore` return type unchanged for backward compatibility. Either add a new export function or return an extended object.

### 5. Update `trust-engine.ts`

Modify `evaluateJobTrust` (or add a new function) to return a `TrustBreakdown` alongside the existing `TrustScore`:
- `providerScore` — from `providerRep` (the numeric score)
- `companyAdjustment` — difference between company reputation score and base score
- `freshnessScore` — derive based on job's `postedAt` date
- `signals` — from the available provider/company reputation data

**Important**: Keep the existing `TrustEvaluationResult` interface unchanged for backward compatibility.

### 6. Update `aggregation-service.ts`

After matchmaking (around line 203), attach `matchBreakdown` to the job:
```typescript
job.matchBreakdown = matchScore.breakdown; // or however the breakdown is returned
```

After trust evaluation (around line 214), attach `trustBreakdown` to the job:
```typescript
job.trustBreakdown = trustEvaluation.trustBreakdown; // or similar
```

### 7. Update tests

- Update `weighted-match-scoring.test.ts` — verify `MatchBreakdown` is correctly populated
- Update `trust-engine.test.ts` — verify `TrustBreakdown` is correctly populated  
- Update `aggregation-service.test.ts` — verify breakdown fields appear in search response
- All existing tests must still pass

## Implementation Notes

- The `NormalizedJob` is serialized directly to the API response (see `search-controller.ts` line 26-33). Adding optional fields automatically includes them in the JSON response.
- Frontend will receive these fields as part of the job objects. Old API responses (without these fields) must still work.
- Build the shared types package first: `pnpm --filter @jobfindr/types build`

## Acceptance Criteria

- [ ] `MatchBreakdown` and `TrustBreakdown` types exist in shared types package
- [ ] `NormalizedJob` has optional `matchBreakdown` and `trustBreakdown` fields
- [ ] Backend search response includes `matchBreakdown` and `trustBreakdown` fields for each job
- [ ] Breakdown data correctly reflects the matchmaking calculation
- [ ] Breakdown data correctly reflects the trust evaluation
- [ ] Old API responses without breakdown data remain valid (optional fields)
- [ ] All existing backend tests pass (no regressions)
