# EPIC-05: Match & Trust Explanation Modals

**Phase:** 5 — Follow-up Cycle
**Changes:** Change 5 (Match% explanation modal), Change 6 (Trust score explanation modal)
**Effort:** Medium
**Dependencies:** EPIC-01 (Reusable Modal component), EPIC-02 (for button wiring in JobCard)

> **Note:** This epic is scoped as a follow-up cycle. It is NOT part of the current MVP build.

---

## Objective

Add explanation modals for the match percentage and trust score badges on JobCard. Clicking an info icon next to each badge opens a modal showing a detailed breakdown. These features improve transparency and help users understand why a job was ranked the way it was.

---

## Deliverables

### 1. Backend — Embed Match Breakdown in Search Response

**Files:**
- `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts` (MODIFY)
- `apps/backend/src/modules/search/services/aggregation-service.ts` (MODIFY)

- Compute `matchBreakdown` during match scoring (the data is already computed internally)
- Embed `matchBreakdown` in the search response alongside each job
- `matchBreakdown` includes: `matchedSkills`, `unmatchedSkills`, `seniorityMatch`, `weightBreakdown`

### 2. Backend — Embed Trust Breakdown in Search Response

**Files:**
- `apps/backend/src/modules/trust/services/trust-engine.ts` (MODIFY)
- `apps/backend/src/modules/search/services/aggregation-service.ts` (MODIFY)

- Compute `trustBreakdown` during trust evaluation
- Embed `trustBreakdown` in the search response
- `trustBreakdown` includes: `providerScore`, `companyAdjustment`, `freshnessSignals`

### 3. Frontend — MatchExplanation Component

**File:** `apps/frontend/src/components/MatchExplanation.tsx` (NEW)

- Displays overall match score prominently
- Shows matched skills (green) and unmatched skills (gray)
- Shows seniority match indicator
- Optional: weight breakdown visualization

### 4. Frontend — TrustExplanation Component

**File:** `apps/frontend/src/components/TrustExplanation.tsx` (NEW)

- Displays trust score and label
- Shows provider reputation breakdown
- Shows company adjustment details
- Shows freshness/frequency signals

### 5. Frontend — Info Buttons on JobCard

**File:** `apps/frontend/src/components/JobCard.tsx` (MODIFY)

- Add info icon (ℹ️) next to match% badge
- Add info icon (ℹ️) next to trust score badge
- Clicking each icon opens the respective modal
- Modals use the reusable Modal component from EPIC-01

### 6. Frontend Types

**File:** `apps/frontend/src/types/index.ts` (MODIFY)

- Add `MatchBreakdown` interface
- Add `TrustBreakdown` interface

---

## Tasks

### Backend
- [ ] Modify `weighted-match-scoring.ts` to return `matchBreakdown` data
- [ ] Modify `trust-engine.ts` to return `trustBreakdown` data
- [ ] Modify `aggregation-service.ts` to pass breakdown data through to response
- [ ] Add types/interfaces for breakdown data in backend

### Frontend
- [ ] Add `MatchBreakdown` and `TrustBreakdown` types to frontend types
- [ ] Create `MatchExplanation.tsx` component for match% breakdown display
- [ ] Create `TrustExplanation.tsx` component for trust score breakdown display
- [ ] Add info icon next to match% badge in `JobCard.tsx`
- [ ] Add info icon next to trust badge in `JobCard.tsx`
- [ ] Wire modal open/close for match explanation
- [ ] Wire modal open/close for trust explanation
- [ ] Handle graceful fallback: show existing data (matchSummary text, trustScore number) if backend breakdown is not yet available
- [ ] Update `JobCard.test.tsx`
- [ ] Add tests for `MatchExplanation.tsx`
- [ ] Add tests for `TrustExplanation.tsx`

---

## Acceptance Criteria

- [ ] **Match% badge** has an interactive info icon
- [ ] **Clicking match% icon** opens a modal showing: overall score, matched skills, unmatched skills, seniority match
- [ ] **Trust badge** has an interactive info icon
- [ ] **Clicking trust icon** opens a modal showing: score, label, provider reputation, adjustments, signals
- [ ] **Modals are accessible** — same ARIA standards as the reusable Modal component
- [ ] **Graceful degradation** — if backend breakdown is not yet available, the modals show existing data only (matchSummary text + trustScore number)
- [ ] **Backend response** includes `matchBreakdown` and `trustBreakdown` fields
- [ ] All existing tests pass after changes
- [ ] No additional API calls are made — all data is embedded in the existing search response
