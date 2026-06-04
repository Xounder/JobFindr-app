# EPIC-04: Interactive Trust & Match Explanations

**Source Item:** Item 5 (Trust/Match badges → interactive buttons)
**Layer:** Backend + Frontend
**Effort:** Large
**Dependencies:** None (backend must be completed before frontend)
**Source Docs:** `item-5-trust-match-buttons.md`

## Objective

Convert the static trust and match badges in `JobCard` into interactive buttons that open explanation modals. Users can click a trust badge (e.g., "Good Trust") to see WHY a job is trustworthy, and click a match badge (e.g., "50% match") to see which skills matched, which didn't, and seniority alignment. This requires backend changes to embed structured breakdown data in the search response.

## Deliverables

### Backend

1. **Types** — Define `MatchBreakdown` and `TrustBreakdown` interfaces in shared types
2. **Weighted match scoring** — Return `matchBreakdown` object alongside the aggregate score
3. **Trust engine** — Return `trustBreakdown` object alongside the aggregate score
4. **Aggregation service** — Pass breakdown data through to the search response DTO
5. **DTO/response types** — Update job response type to include `matchBreakdown` and `trustBreakdown` fields

### Frontend

1. **Types** — Define `MatchBreakdown` and `TrustBreakdown` interfaces; update `Job` interface
2. **`TrustExplanationModal`** — New component showing trust score with breakdown details (provider score, company adjustment, freshness signals)
3. **`MatchExplanationModal`** — New component showing match percentage, matched/unmatched skills, seniority match indicator
4. **`JobCard` changes** — Convert trust/match badges from `<span>` to `<button>` elements with click handlers that open the explanation modals
5. **Tests** — New tests for both modal components; updated tests for `JobCard`

## Tasks

### Backend Tasks

- [ ] Define `MatchBreakdown` type in shared types (`packages/types/src/index.ts`):
  - `matchedSkills: string[]`
  - `unmatchedSkills: string[]`
  - `seniorityMatch: "exact" | "close" | "none"`
  - `weightedScore: number`
  - `skillScoreContribution: number`
  - `seniorityScoreContribution: number`
- [ ] Define `TrustBreakdown` type in shared types:
  - `providerScore: number`
  - `companyAdjustment: number`
  - `freshnessScore: number`
  - `signals: { providerReputation, companySizeBonus, isKnownEmployer, daysSincePosted }`
- [ ] Update `weighted-match-scoring.ts` to return `MatchBreakdown` alongside the score
- [ ] Update `trust-engine.ts` to return `TrustBreakdown` alongside the score
- [ ] Update `aggregation-service.ts` to propagate breakdown data through the search pipeline
- [ ] Update search response DTO to include `matchBreakdown` and `trustBreakdown` fields
- [ ] Run backend tests to confirm no regressions

### Frontend Tasks

- [ ] Add `MatchBreakdown` and `TrustBreakdown` interfaces to `apps/frontend/src/types/index.ts`
- [ ] Update `Job` interface to include optional `matchBreakdown` and `trustBreakdown` fields
- [ ] Create `TrustExplanationModal.tsx` component:
  - Props: `trustScore`, `trustLabel`, `trustBreakdown`, `isOpen`, `onClose`
  - Display overall score with color coding
  - Show breakdown: provider score, company adjustment, freshness score
  - Graceful fallback when `trustBreakdown` is null
- [ ] Create `MatchExplanationModal.tsx` component:
  - Props: `matchScore`, `matchSummary`, `matchBreakdown`, `isOpen`, `onClose`
  - Display match percentage prominently
  - Show matched skills (green) and unmatched skills (gray)
  - Show seniority match indicator
  - Fallback to `matchSummary` when breakdown is unavailable
- [ ] Update `JobCard.tsx`:
  - Convert trust badge `<span>` to `<button>` with `onClick`
  - Convert match badge `<span>` to `<button>` with `onClick`
  - Add local state `showTrustModal` and `showMatchModal`
  - Wire `TrustExplanationModal` and `MatchExplanationModal` components
  - Add hover effects (`hover:ring-2`, cursor pointer) to buttons
- [ ] Update `JobCard.test.tsx` — test buttons render and modals open/close
- [ ] Create `TrustExplanationModal.test.tsx` — test display with/without breakdown data
- [ ] Create `MatchExplanationModal.test.tsx` — test display with/without breakdown data

## Acceptance Criteria

- [ ] Backend search response includes `matchBreakdown` and `trustBreakdown` fields for each job
- [ ] When breakdown data is available, trust badge is a clickable button
- [ ] When breakdown data is available, match badge is a clickable button
- [ ] Clicking trust badge opens `TrustExplanationModal` with detailed breakdown
- [ ] Clicking match badge opens `MatchExplanationModal` with detailed breakdown
- [ ] `TrustExplanationModal` shows: overall trust score (color-coded), provider reputation, company adjustment, freshness signals
- [ ] `MatchExplanationModal` shows: match percentage, matched skills list, unmatched skills list, seniority match level
- [ ] When breakdown data is null (old API), modals show graceful fallback with score and summary text
- [ ] All modals can be closed via X button, overlay click, or Escape key
- [ ] All existing backend and frontend tests pass (no regressions)
- [ ] New components have dedicated test coverage
- [ ] Backward compatible: old API responses without breakdown data do not break the UI
