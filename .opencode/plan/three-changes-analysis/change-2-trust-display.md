# Change 2: Fix Trust Score Display Issue

## Summary

All companies are showing "Low Trust" in the frontend even when the backend assigns trust scores like 7.8 or 8.4. This is a **scale mismatch bug** between backend (0-10 scale) and frontend (expects 0-100 scale).

---

## Root Cause Analysis

### Confirmed: Scale Mismatch Bug

**Backend (0-10 scale):**

1. `trust-score-formula.ts` line 86:
   ```typescript
   overall: Math.max(0, Math.min(10, overall)),  // 0-10 scale
   ```

2. `trust-engine.ts` line 32/51:
   ```typescript
   job: { ...job, trustScore: cached.overall },   // stores 0-10 value
   ```

3. `aggregation-service.ts` — trust scores applied at lines 206-213 via `evaluateJobsTrust()` which stores 0-10 values.

**Frontend (expects 0-100 scale):**

1. `JobCard.tsx` lines 24-28:
   ```tsx
   job.trustScore >= 80    // expects 0-100 scale
   job.trustScore >= 50    // expects 0-100 scale
   ```

2. `utils/index.ts` lines 35-38 (`trustLabel`):
   ```typescript
   if (score >= 80) return "High Trust";     // 7.8 < 80 → "Low Trust"
   if (score >= 50) return "Medium Trust";    // 7.8 < 50 → fallthrough
   return "Low Trust";                         // ← 7.8 returns "Low Trust" — BUG!
   ```

**Impact:** A score of 7.8 (which should be "High Trust" on a 0-10 scale, or at minimum "Medium Trust") displays as "Low Trust" and gets a red background.

### Also Checked: Backend NormalizedJob type

`packages/types/src/normalized-job.ts` line 35:
```typescript
trustScore?: number   // no scale documented, just "number"
```

No scale is enforced in the type — it's ambiguous. Both sides are technically using `number` but with different expected ranges.

### Also Checked: matchScore vs rankingScore

The user asks if `rankingScore` should be `%match` in frontend. Let me check:

1. `ranking-engine.ts` lines 56-61:
   ```typescript
   job.rankingScore = rank.compositeScore   // 0-100 scale (composite of all factors)
   ```

2. `aggregation-service.ts` lines 200-203:
   ```typescript
   job.matchScore = matchScore.overall   // 0-100 scale (pure match %)
   ```

3. Frontend `JobCard.tsx` line 37:
   ```tsx
   {job.matchScore}% match   // correctly uses matchScore
   ```

4. Frontend `Job` type:
   ```typescript
   matchScore: number | null   // used
   rankingScore doesn't exist in frontend types!
   ```

**Conclusion on rankingScore:** 
- The frontend `Job` type (in `apps/frontend/src/types/index.ts`) does NOT have a `rankingScore` field
- The `JobCard` uses `matchScore` for the "% match" display, which is correct
- `rankingScore` is used internally by the backend for sort order only — it doesn't need to be sent to the frontend
- **No issue with rankingScore** — it's working as designed. The matchScore is the visible match % that the user sees.

---

## Fix Options

### Option A: Fix the frontend to interpret 0-10 scale (recommended)

Update `trustLabel()` and `JobCard.tsx` to use the 0-10 scale.

**Frontend changes:**
- `utils/index.ts` — `trustLabel()`: change thresholds to 0-10 scale
- `JobCard.tsx` — color logic: change thresholds to 0-10 scale

**New trustLabel:**
```typescript
export function trustLabel(score: number): string {
  if (score >= 8) return "High Trust";
  if (score >= 5) return "Medium Trust";
  return "Low Trust";
}
```

**New color logic:**
```typescript
job.trustScore >= 8  // High Trust → green
job.trustScore >= 5  // Medium Trust → yellow
else                 // Low Trust → red
```

**Root cause fixed:** The backend already produces 0-10 scores. The frontend was the only place with the wrong scale.

### Option B: Scale up on the backend

Multiply `trustScore` by 10 before sending to the frontend.

**Backend changes:**
- `trust-engine.ts` or `aggregation-service.ts`: `job.trustScore = trustScore.overall * 10`

**Pros:**
- Single change point
- No frontend changes

**Cons:**
- The `NormalizedJob` type has no documented scale — confusing
- All other consumers (caching, logging, future features) would need to handle scaled values
- Breaks existing trust logic in the ranking engine (which expects 0-10)

### Option C: Document scale in types and fix both places

- Add a clear JSDoc comment on `trustScore` in `normalized-job.ts` specifying 0-10 scale
- Fix frontend to match

This is Option A + documentation.

---

## Files Affected

### Option A (recommended) + documentation:

| File | Change | Effort |
|------|--------|--------|
| `apps/frontend/src/utils/index.ts` | Update `trustLabel()` thresholds to 0-10 | 3 lines |
| `apps/frontend/src/components/JobCard.tsx` | Update color thresholds to 0-10 | 3 lines |
| `packages/types/src/normalized-job.ts` | Add JSDoc clarifying 0-10 scale for `trustScore` | ~5 lines |

### Effort: **Small** — ~10 lines total, 3 files

No backend logic changes needed. No new tests needed (existing tests may already account for 0-10 scale).

---

## Impact

| Layer | Impact | Details |
|-------|--------|---------|
| Frontend | Low | 2 utility/component changes, no structural changes |
| Backend | None | Bug is frontend-only; backend works correctly |
| Types | None | Just documentation; no type changes |
| Ranking | None | Ranking already works with 0-10 trust scores |
| Matchmaking | None | Matchmaking doesn't use trustScore |
| Trust Engine | None | Already produces correct 0-10 scores |

---

## Verification

After fix, these values should display correctly:
| Backend Score | Expected Label | Current (buggy) Label |
|---------------|---------------|----------------------|
| 7.8 | "Medium Trust" (yellow) | "Low Trust" (red) |
| 8.4 | "High Trust" (green) | "Low Trust" (red) |
| 4.2 | "Low Trust" (red) | "Low Trust" (red) — correct by accident |
| 5.5 | "Medium Trust" (yellow) | "Low Trust" (red) |
| 9.1 | "High Trust" (green) | "Low Trust" (red) |

---

## Related to Change 3

If Change 3 (Trust Score Level Redefinition) is also implemented, the `trustLabel()` redefinition can be combined with this fix into a single pass. The thresholds in Option A (`>=8` / `>=5`) would need to be adjusted to the new 6-level scheme.
