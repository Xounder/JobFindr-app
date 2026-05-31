# Change 3: Trust Score Level Redefinition + Separation from Ranking Score

## Summary

Redefine trust classifications from the current 4-level system to a new 6-level system, change the minimum visibility threshold from 6.5 to 6.0, add ranking boosts at 8.0+ and 9.0+, and clarify the separation between Trust Score and Ranking Score.

---

## Current State

### Current Trust Classification (in `packages/types/src/trust.types.ts`)

```typescript
export const TRUST_THRESHOLDS = {
  BLOCKED: 4,
  HIDDEN: 6.5,
  VISIBLE: 6.5,
  HIGHLIGHTED: 8,
} as const

export type TrustVisibility = 'blocked' | 'hidden' | 'visible' | 'highlighted'

export function getTrustVisibility(score: number): TrustVisibility {
  if (score < TRUST_THRESHOLDS.BLOCKED) return 'blocked'
  if (score < TRUST_THRESHOLDS.VISIBLE) return 'hidden'
  if (score >= TRUST_THRESHOLDS.HIGHLIGHTED) return 'highlighted'
  return 'visible'
}
```

### Current Ranking Integration (in `ranking-engine.ts` + `trust-score-weight.ts`)

Trust contributes to ranking via `computeTrustScoreWeight`:
```typescript
const trustScore = job.trustScore ?? 5
return (trustScore / 10) * weights.trustScore * 100
```
Where `weights.trustScore = 0.25` (25% of ranking weight).

There is **no boost logic** based on trust thresholds in the current ranking. Trust is linearly interpolated.

---

## Proposed New Classification

| Score Range | Classification | Visibility | Ranking Effect |
|-------------|---------------|------------|----------------|
| 0.0 – 4.9 | Extreme Low Trust | Blocked (hidden, no `includeHidden`) | N/A |
| 5.0 – 5.9 | Low Trust | Hidden (requires `includeHidden=true`) | N/A |
| 6.0 – 6.9 | Medium Trust | Visible (default) | Normal weighting |
| 7.0 – 7.9 | Trust | Visible | Normal weighting |
| 8.0 – 8.9 | Good Trust | Visible | **Ranking boost** |
| 9.0 – 10.0 | High Trust | Visible | **Strong ranking boost** |

### Key Changes:
- **Minimum threshold**: 6.5 → **6.0** (lowered by 0.5)
- **Blocked threshold**: 4 → **5** (strictly less than 5.0)
- **New classifications**: "Extreme Low Trust" (0-4.9), "Low Trust" (5-5.9), "Medium Trust" (6-6.9), "Trust" (7-7.9), "Good Trust" (8-8.9), "High Trust" (9-10)
- **Ranking boosts**: New concept — trusts >= 8.0 get rating multiplier, >= 9.0 get stronger multiplier

---

## Architecture Impact

### Package: `packages/types/src/trust.types.ts`

**Changes needed:**

1. Update `TRUST_THRESHOLDS`:
```typescript
export const TRUST_THRESHOLDS = {
  BLOCKED: 4,      // < 5.0: Extreme Low Trust → blocked
  HIDDEN: 5,       // 5.0-5.9: Low Trust → hidden
  VISIBLE: 6,      // >= 6.0: Visible
  HIGHLIGHTED: 8,  // >= 8.0: Good/High Trust → highlighted (bonus)
} as const
```

Wait, the proposed thresholds don't exactly map to the same visibility model. Let me reconsider.

The new model has:
- `< 5.0`: "Extreme Low Trust" — should be blocked (invisible even with `includeHidden`)
- `5.0 – 5.9`: "Low Trust" — hidden (requires `includeHidden=true`)
- `>= 6.0`: Eligible for results

So:
```typescript
TRUST_THRESHOLDS.BLOCKED = 5    // < 5.0 → blocked
TRUST_THRESHOLDS.HIDDEN = 6     // >= 5.0 but < 6.0 → hidden  
TRUST_THRESHOLDS.VISIBLE = 6    // >= 6.0 → visible
TRUST_THRESHOLDS.HIGHLIGHTED = 8 // >= 8.0 → highlighted (ranking boost)
```

Actually, looking at the visibility function, I need to restructure it:

```typescript
export function getTrustVisibility(score: number): TrustVisibility {
  if (score < 5) return 'blocked'       // 0-4.9: Extreme Low Trust
  if (score < 6) return 'hidden'         // 5.0-5.9: Low Trust
  if (score >= 8) return 'highlighted'   // 8.0+: Good/High Trust
  return 'visible'                        // 6.0-7.9: Medium Trust or Trust
}
```

2. Update `TrustVisibility` type to include new labels (or keep old visibility types and just change thresholds)

Actually, looking at the user's request, they want specific human-readable **classification labels** ("Extreme Low Trust", "Low Trust", "Medium Trust", "Trust", "Good Trust", "High Trust"). These are labels, not visibility states. The visibility states (`blocked`, `hidden`, `visible`, `highlighted`) are separate concepts that map to the score ranges.

So we need:
- A new function/type for the **human-readable classification**
- Keep visibility model but adjust thresholds
- The labels are a display concern (frontend `trustLabel()`)

3. New exports needed:
```typescript
export type TrustClassification =
  | 'extreme-low'
  | 'low'
  | 'medium'
  | 'trust'
  | 'good'
  | 'high'

export function getTrustClassification(score: number): TrustClassification {
  if (score < 5) return 'extreme-low'
  if (score < 6) return 'low'
  if (score < 7) return 'medium'
  if (score < 8) return 'trust'
  if (score < 9) return 'good'
  return 'high'
}
```

### Backend: `trust-engine.ts`

The `filterByTrust` function already uses `getTrustVisibility()` which will be updated. No logic changes needed if the threshould update is done correctly.

### Backend: `ranking-engine.ts` + `trust-score-weight.ts` — **Ranking Boost Logic**

**Current** — linear trust weight:
```typescript
return (trustScore / 10) * weights.trustScore * 100
```

**Proposed** — add boost multipliers:
```typescript
export function computeTrustScoreWeight(job, weights): number {
  const trustScore = job.trustScore ?? 5
  let boostMultiplier = 1.0
  if (trustScore >= 9.0) boostMultiplier = 1.5  // Strong boost
  else if (trustScore >= 8.0) boostMultiplier = 1.25  // Moderate boost
  
  const baseContribution = (trustScore / 10) * weights.trustScore * 100
  return Math.min(100, baseContribution * boostMultiplier)
}
```

### Backend: `aggregation-service.ts`

No changes needed — it already calls `evaluateJobsTrust()` then `filterByTrust()` then `rankJobs()`. The pipeline stays the same; only the internals change.

### Frontend: `utils/index.ts` — `trustLabel()`

Replace current 3-level function with a 6-level classification:
```typescript
export function trustLabel(score: number): string {
  if (score >= 9) return "High Trust"
  if (score >= 8) return "Good Trust"
  if (score >= 7) return "Trust"
  if (score >= 6) return "Medium Trust"
  if (score >= 5) return "Low Trust"
  return "Extreme Low Trust"
}
```

### Frontend: `JobCard.tsx` — Color Logic

Update the color thresholds to match the new classification:
```tsx
{job.trustScore !== null && (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
    job.trustScore >= 9 ? "bg-green-100 text-green-800"      // High Trust
    : job.trustScore >= 8 ? "bg-emerald-100 text-emerald-800" // Good Trust
    : job.trustScore >= 7 ? "bg-blue-100 text-blue-800"       // Trust
    : job.trustScore >= 6 ? "bg-yellow-100 text-yellow-800"   // Medium Trust
    : job.trustScore >= 5 ? "bg-orange-100 text-orange-800"   // Low Trust
    : "bg-red-100 text-red-800"                                // Extreme Low Trust
  }`}>
    {trustLabel(job.trustScore)}
  </span>
)}
```

### Frontend: `TrustFilters.tsx`

The minimum trust slider's min/max range (0-10) and step (0.5) are already correct. But the label display ("Minimum Trust Score: {value}") and the default value might need updating. Currently the slider goes from 0 to 10 in 0.5 increments, which works with the new classification.

However, the **default minimum threshold** changes from 6.5 to 6.0. This could affect:
- The `trustMin` default in `searchStore.ts` (currently 0 — user must manually set)
- The backend default in `search-validation.ts` (currently 0)
- The `filterByTrust()` default (currently 0)

**Recommendation**: Keep the default at 0 (no filtering) for backward compatibility, but change the UI to suggest 6.0 as the recommended minimum. The backend already handles filtering properly.

### Separation of Trust Score from Ranking Score

The user wants a clear separation:
```
Trust Score (0-10) → Eligibility Filter → Ranking Engine → Final Ranking Score
```

This is **already how it works** in the current architecture! Let me verify:

1. `aggregation-service.ts` lines 206-213:
   - `evaluateJobsTrust()` → assigns trustScore to jobs (0-10)
   - `filterByTrust()` → filters out jobs below threshold
   
2. Lines 215-218:
   - `rankJobs()` → uses trustScore as one input among many
   - Outputs `rankingScore` (0-100)

**Current pipeline:**
```
Trust Score (0-10) → filterByTrust → Ranking Engine (includes trustScoreWeight) → rankingScore (0-100)
```

This is already separated. The `trustScore` influences eligibility (via filterByTrust) AND ranking (via computeTrustScoreWeight). The user may want to clarify that these are different concerns.

**What could be improved:**
- The `rankJobs()` output should NOT overwrite `job.trustScore` — currently it doesn't, it sets `job.rankingScore`
- Add clearer comments/documentation about the separation
- Possibly add a dedicated `trustLevel` or `trustClassification` field to the `NormalizedJob` type so the frontend can display classification without recalculating

---

## Files That Change

| Layer | File | Change | Effort |
|-------|------|--------|--------|
| Types | `packages/types/src/trust.types.ts` | Update `TRUST_THRESHOLDS`, `getTrustVisibility`, add `TrustClassification` and `getTrustClassification` | ~30 lines |
| Types | `packages/types/src/index.ts` | Export new types/functions | ~5 lines |
| Backend | `apps/backend/src/modules/ranking/services/trust-score-weight.ts` | Add ranking boost multipliers for 8+ and 9+ | ~10 lines |
| Frontend | `apps/frontend/src/utils/index.ts` | Replace `trustLabel()` with 6-level classification | ~8 lines |
| Frontend | `apps/frontend/src/components/JobCard.tsx` | Update color thresholds | ~15 lines |
| Frontend | `apps/frontend/src/components/TrustFilters.tsx` | Update label/display to show new trust levels | ~5 lines |
| Frontend | `apps/frontend/src/types/index.ts` | No changes needed (trustScore is already `number`) | 0 |
| Docs | `.opencode/architecture/12-trust-engine.md` | Update thresholds documentation | ~10 lines |

### Estimated: 8 files modified, ~83 lines total

---

## Effort Estimate

- **Total: Medium** (~80-100 lines across 8 files)
- Types package: ~35 lines (new classification type, threshold updates)
- Backend ranking: ~10 lines (boost multipliers)
- Frontend display: ~30 lines (label + colors)
- Docs: ~10 lines

---

## Breaking Changes

| Breaking Change | Severity | Mitigation |
|-----------------|----------|------------|
| Old `TRUST_THRESHOLDS` values change | Low | Only used internally; no external API contract |
| `getTrustVisibility()` behavior changes for scores 5.0-6.4 | Medium | Previously `hidden` (5-6.4), now `visible` for 6.0-6.4 and `hidden` for 5.0-5.9 |
| `trustLabel()` semantics completely change | Low | Pure display function; no downstream consumers |
| `computeTrustScoreWeight()` output changes | Medium | Ranking scores will increase for jobs with 8+ trust; tests may need updating |

### Migration:
- No data migration needed (scores are computed in-memory)
- Existing cached trust scores in `TrustCacheLayer` will become slightly stale but self-heal
- Cached aggregated results in `aggregatedCache` will use old scores until cache expires
