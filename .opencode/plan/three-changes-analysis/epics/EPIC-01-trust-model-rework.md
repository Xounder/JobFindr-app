# EPIC-01: Trust Model Rework

**Status:** Draft
**Priority:** High
**Effort:** Medium (~90-110 lines across 8 files)
**Changes Covered:** Change 2 (Trust Score Display Fix) + Change 3 (Trust Redefinition + Ranking Boosts)

---

## Description

Rework the trust score model across all layers of JobFindr. This epic combines two changes:

1. **Fix the trust score display bug** — the frontend currently interprets backend trust scores (0-10 scale) as 0-100, causing all scores below 80 to display as "Low Trust" with red background. A score of 7.8 shows "Low Trust" when it should show at least "Medium Trust".

2. **Redefine trust classification** — replace the current 4-level system (blocked/hidden/visible/highlighted) with a richer 6-level classification system (Extreme Low → Low → Medium → Trust → Good → High Trust), lower the minimum visibility threshold from 6.5 to 6.0, and add ranking boost multipliers for jobs scoring 8.0+ and 9.0+.

These two changes are combined into one epic because they share the same code paths (`trustLabel()`, `JobCard.tsx` color thresholds) — doing them together avoids merge conflicts and duplicate work.

---

## User Stories

### US-01.01: Correct Trust Score Display
**As a** job seeker  
**I want** trust scores and labels to accurately reflect the actual score  
**So that** I can make informed decisions and trust the product's signals

**Acceptance Criteria:**
- `trustLabel(7.8)` returns "Medium Trust" (not "Low Trust")
- `trustLabel(8.4)` returns "High Trust" (not "Low Trust")
- `trustLabel(5.5)` returns "Medium Trust" (not "Low Trust")
- `JobCard.tsx` background color matches the correct label (green/emerald/blue/yellow/orange/red)
- All thresholds use the 0-10 scale consistently

### US-01.02: Clear Trust Classification
**As a** job seeker  
**I want** to see a descriptive trust level for each job (not just "High/Medium/Low")  
**So that** I can quickly differentiate between job quality tiers at a glance

**Acceptance Criteria:**
- 6 trust labels displayed: "Extreme Low Trust", "Low Trust", "Medium Trust", "Trust", "Good Trust", "High Trust"
- Each label has a distinct background color
- Labels are human-readable and self-explanatory

### US-01.03: Ranking Boost for Trustworthy Jobs
**As a** job seeker  
**I want** jobs from trustworthy providers to appear higher in search results  
**So that** I see the most reliable opportunities first

**Acceptance Criteria:**
- Jobs with trust score >= 8.0 receive a 1.25x ranking boost
- Jobs with trust score >= 9.0 receive a 1.5x ranking boost
- Ranking boost does not affect `matchScore` display (only sort order)
- Boost is capped so `rankingScore` never exceeds 100

### US-01.04: Lowered Visibility Threshold
**As a** job seeker  
**I want** more jobs to be visible by default  
**So that** I don't miss opportunities from providers with slightly lower trust but good matches

**Acceptance Criteria:**
- Jobs with trust score >= 6.0 are visible by default (down from 6.5)
- Jobs with trust score 5.0-5.9 require `includeHidden=true` to appear
- Jobs with trust score < 5.0 are always blocked

---

## Deliverables

### Layer: Types (`packages/types/`)

| File | Change | Description |
|------|--------|-------------|
| `src/trust.types.ts` | Modify | Update `TRUST_THRESHOLDS` values; update `getTrustVisibility()` logic; add `TrustClassification` type and `getTrustClassification()` function |
| `src/index.ts` | Modify | Export new types/functions |

### Layer: Backend (`apps/backend/`)

| File | Change | Description |
|------|--------|-------------|
| `modules/ranking/services/trust-score-weight.ts` | Modify | Add ranking boost multipliers for 8.0+ (1.25x) and 9.0+ (1.5x) |
| Existing trust engine tests | Modify | Update expectations for new thresholds |

### Layer: Frontend (`apps/frontend/`)

| File | Change | Description |
|------|--------|-------------|
| `src/utils/index.ts` | Modify | Replace `trustLabel()` with 6-level classification using 0-10 thresholds |
| `src/components/JobCard.tsx` | Modify | Update color thresholds to match 6-level classification |
| `src/components/TrustFilters.tsx` | Modify | Update labels to reflect new trust levels (optional) |

### Layer: Documentation

| File | Change | Description |
|------|--------|-------------|
| `.opencode/architecture/12-trust-engine.md` | Modify | Update thresholds documentation |

---

## Tasks

- [ ] **T-01.01**: Update `TRUST_THRESHOLDS` and `getTrustVisibility()` in `trust.types.ts`
  - Change blocked threshold from 4 to 5 (< 5.0 = Extreme Low Trust, blocked)
  - Change hidden threshold from 6.5 to 6 (5.0-5.9 = Low Trust, hidden)
  - Change visible threshold from 6.5 to 6 (>= 6.0 = Visible)
  - Keep highlighted threshold at 8 (>= 8.0 = Good/High Trust, highlighted)

- [ ] **T-01.02**: Add `TrustClassification` type and `getTrustClassification()` function
  - New type with 6 variants: `'extreme-low' | 'low' | 'medium' | 'trust' | 'good' | 'high'`
  - Mapping: <5 → extreme-low, 5-5.9 → low, 6-6.9 → medium, 7-7.9 → trust, 8-8.9 → good, 9-10 → high

- [ ] **T-01.03**: Export new types from `packages/types/src/index.ts`

- [ ] **T-01.04**: Add ranking boost logic in `trust-score-weight.ts`
  - Base: `(trustScore / 10) * weights.trustScore * 100`
  - Boost: 1.25x if >= 8.0, 1.5x if >= 9.0
  - Cap result at 100

- [ ] **T-01.05**: Update `trustLabel()` in frontend `utils/index.ts`
  - Replace 3-level function with 6-level: `>=9` High, `>=8` Good, `>=7` Trust, `>=6` Medium, `>=5` Low, else Extreme Low
  - Use 0-10 scale thresholds

- [ ] **T-01.06**: Update `JobCard.tsx` color thresholds
  - `>=9` → green, `>=8` → emerald, `>=7` → blue, `>=6` → yellow, `>=5` → orange, else red

- [ ] **T-01.07**: Update `TrustFilters.tsx` labels (optional — if labels reference old threshold names)

- [ ] **T-01.08**: Update architecture doc `12-trust-engine.md` with new thresholds

- [ ] **T-01.09**: Update existing tests
  - Update `trustLabel` tests in frontend
  - Update `getTrustVisibility` tests in types package
  - Update `computeTrustScoreWeight` tests in backend
  - Add tests for new `getTrustClassification` function

---

## Acceptance Criteria

- [ ] `trustLabel()` correctly maps backend 0-10 scores to 6-level classification
- [ ] `JobCard.tsx` displays correct color for each trust level
- [ ] Jobs with score 7.8 show "Medium Trust" or "Trust" (not "Low Trust")
- [ ] Jobs with score 8.4 show "Good Trust" or "High Trust" (not "Low Trust")
- [ ] New `TrustClassification` type and `getTrustClassification()` function exist and are exported
- [ ] Ranking boost of 1.25x applied at trust >= 8.0
- [ ] Ranking boost of 1.5x applied at trust >= 9.0
- [ ] Minimum visibility threshold changed from 6.5 to 6.0
- [ ] Blocked threshold changed from 4 to 5 (< 5.0 = blocked)
- [ ] All existing tests pass
- [ ] New tests cover `getTrustClassification()` and updated thresholds
- [ ] Architecture doc `12-trust-engine.md` updated with new thresholds
- [ ] `NormalizedJob.trustScore` has JSDoc clarifying 0-10 scale
- [ ] No breaking changes to external API contracts

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| None | — | Fully self-contained epic; no external dependencies |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Trust threshold change breaks visibility expectations for some users | Medium | Medium | Test with real data; document change |
| Cache serves stale entries after threshold change | Low | Low | Cache TTL handles eventual consistency |
| Ranking boost over-emphasizes trust at expense of match quality | Low | Medium | Boost capped at 1.5x; trust weight remains 25% of ranking |
| Merge conflict with EPIC-02 | None | — | EPIC-02 touches no trust-related files |
