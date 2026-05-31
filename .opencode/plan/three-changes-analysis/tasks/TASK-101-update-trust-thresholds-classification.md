# TASK-101 — Update Trust Thresholds & Add 6-Level Classification

**Layer:** types (shared package)
**Depends on:** None
**Epic origin:** EPIC-01-trust-model-rework (`.opencode/plan/three-changes-analysis/epics/EPIC-01-trust-model-rework.md`)

## Description

Update the trust thresholds in `packages/types/src/trust.types.ts` to match the new 6-level classification system and add the new `TrustClassification` type and `getTrustClassification()` function. This task is the foundation for both the trust display fix (Change 2) and trust redefinition (Change 3).

### Changes to `TRUST_THRESHOLDS`

| Constant    | Old Value | New Value |
|-------------|-----------|-----------|
| `BLOCKED`   | 4         | 5         |
| `HIDDEN`    | 6.5       | 6         |
| `VISIBLE`   | 6.5       | 6         |
| `HIGHLIGHTED` | 8       | 8 (unchanged) |

### Changes to `getTrustVisibility()`

- `score < 5` → `'blocked'`
- `score >= 5 && score < 6` → `'hidden'`
- `score >= 6 && score < 8` → `'visible'`
- `score >= 8` → `'highlighted'`

### New Type: `TrustClassification`

```typescript
export type TrustClassification = 'extreme-low' | 'low' | 'medium' | 'trust' | 'good' | 'high'
```

### New Function: `getTrustClassification(score: number): TrustClassification`

| Score Range | Classification |
|-------------|---------------|
| < 5         | `'extreme-low'` |
| 5 - 5.9     | `'low'` |
| 6 - 6.9     | `'medium'` |
| 7 - 7.9     | `'trust'` |
| 8 - 8.9     | `'good'` |
| 9 - 10      | `'high'` |

### Export Changes

Add `TrustClassification` and `getTrustClassification` to `packages/types/src/index.ts` exports.

## Deliverables

- [ ] Update `TRUST_THRESHOLDS` values in `trust.types.ts`
- [ ] Update `getTrustVisibility()` logic for new thresholds
- [ ] Add `TrustClassification` union type (6 variants)
- [ ] Add `getTrustClassification()` function
- [ ] Export new types/functions from `packages/types/src/index.ts`
- [ ] Add JSDoc to `NormalizedJob.trustScore` clarifying 0-10 scale
- [ ] All existing `packages/types` tests pass
- [ ] Add unit tests for `getTrustClassification()` covering all 6 levels
- [ ] Update any existing tests that depend on old threshold values

## Files to Modify

| File | Action |
|------|--------|
| `packages/types/src/trust.types.ts` | Modify (thresholds, visibility, new type + function) |
| `packages/types/src/index.ts` | Modify (add exports) |

## Complexity

**Small** (~30-40 lines total changes)

## Agent Allocation

**Types (shared package)** — Senior Backend can handle this as it's type definitions.

## Test Requirements

- Unit test `getTrustClassification()` for each of the 6 levels
- Unit test `getTrustVisibility()` for boundary values: 4.9, 5.0, 5.9, 6.0, 7.9, 8.0, 8.9, 9.0, 10.0
- Unit test edge cases: negative scores, scores > 10
