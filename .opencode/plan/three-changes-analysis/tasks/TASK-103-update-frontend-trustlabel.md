# TASK-103 — Update Frontend trustLabel() to 6-Level Classification

**Layer:** frontend
**Depends on:** TASK-101 (for understanding the new classification scheme)
**Epic origin:** EPIC-01-trust-model-rework (`.opencode/plan/three-changes-analysis/epics/EPIC-01-trust-model-rework.md`)

## Description

Replace the current 3-level `trustLabel()` function in `apps/frontend/src/utils/index.ts` with a 6-level version that uses the correct 0-10 scale instead of the buggy 0-100 scale.

### Current (Buggy) Implementation

```typescript
export function trustLabel(score: number): string {
  if (score >= 80) return "High Trust";
  if (score >= 50) return "Medium Trust";
  return "Low Trust";
}
```

The current code treats backend scores (0-10 scale) as 0-100, causing scores like 7.8 to display as "Low Trust" instead of the correct label.

### New Implementation

```typescript
export function trustLabel(score: number): string {
  if (score >= 9) return "High Trust";
  if (score >= 8) return "Good Trust";
  if (score >= 7) return "Trust";
  if (score >= 6) return "Medium Trust";
  if (score >= 5) return "Low Trust";
  return "Extreme Low Trust";
}
```

### Key Differences

| Aspect | Old (Buggy) | New (Fixed) |
|--------|-------------|-------------|
| Scale | 0-100 (wrong) | 0-10 (correct) |
| Levels | 3 | 6 |
| Labels | High/Medium/Low | Extreme Low/Low/Medium/Trust/Good/High |
| Score 7.8 | "Low Trust" | "Trust" |
| Score 8.4 | "Low Trust" | "Good Trust" |

## Files to Modify

| File | Action |
|------|--------|
| `apps/frontend/src/utils/index.ts` | Modify (replace `trustLabel()` implementation) |
| `apps/frontend/src/utils/index.test.ts` | Modify (update tests for new classification) |

## Deliverables

- [ ] Replace `trustLabel()` body with 6-level classification using 0-10 thresholds
- [ ] Remove the incorrect comment "Transform a trust score (0–100)..." — replace with correct 0-10 doc
- [ ] Update existing `trustLabel` tests to expect new values
- [ ] Add tests covering all 6 levels and boundary values

## Complexity

**Small** (~10 lines of implementation + test updates)

## Agent Allocation

**Frontend only**

## Test Requirements

- Test `>=9` returns `"High Trust"` (e.g., 9.5)
- Test `>=8` returns `"Good Trust"` (e.g., 8.4)
- Test `>=7` returns `"Trust"` (e.g., 7.8)
- Test `>=6` returns `"Medium Trust"` (e.g., 6.5)
- Test `>=5` returns `"Low Trust"` (e.g., 5.5)
- Test `<5` returns `"Extreme Low Trust"` (e.g., 4.9)
- Test boundary values: 5.0, 6.0, 7.0, 8.0, 9.0
- Test negative/zero edge case: 0 → "Extreme Low Trust"
