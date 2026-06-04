# EPIC-04: Trust & Match Explanation Text

**Change:** #2 — Add human-readable explanation text to Trust and Match explanation modals
**Priority:** 🟢 Lower (nice-to-have readability improvement)
**Effort:** Small (~1 hr)
**Dependencies:** None (but shares `TrustExplanationModal.tsx` and `MatchExplanationModal.tsx` with Epic 3 — coordinate if parallel)

---

## Objective

Add clear, human-readable explanation text to both the Trust and Match explanation modals. Currently, these modals display only numerical scores and breakdown data. The new explanation text will summarize what the scores mean in plain English, using data that already exists in the frontend.

## Current State

- **TrustExplanationModal:** Displays breakdown values (providerScore, companyAdjustment, freshnessScore, etc.) as raw numbers
- **MatchExplanationModal:** Displays breakdown values (matchedSkills, unmatchedSkills, seniorityMatch, weightedScore, etc.) as raw numbers
- All data needed for explanations already exists in the frontend store/breakdown objects
- No human-readable summary text is generated

## Desired Behavior

**Trust explanation example:**
> *"Score 8.2/10 — Good Trust. Posted 3 days ago (freshness: 9.0/10). Provider reputation: 7.5/10. Company size bonus adds +2.0. Acme Corp is a known employer."*

**Match explanation example:**
> *"85% match — Excellent match! 3 of your 5 skills matched (TypeScript, React, Node.js). Seniority level is an exact match."*

## Deliverables

- [ ] (Optional) New utility file with `buildTrustExplanation()` and `buildMatchExplanation()` functions
- [ ] `TrustExplanationModal.tsx` — explanation paragraph rendered above or with the score display
- [ ] `MatchExplanationModal.tsx` — explanation paragraph rendered above or with the score display
- [ ] Test updates for both modals verifying explanation text renders correctly

## Tasks

- [ ] **Task 4.1 (Optional):** Create utility functions `buildTrustExplanation(breakdown)` and `buildMatchExplanation(breakdown)` in `apps/frontend/src/utils/` (or inline in components if simpler)
- [ ] **Task 4.2:** Add explanation paragraph to `TrustExplanationModal.tsx` — use `getTrustClassification()` for text labels, include provider reputation, freshness, company adjustment, and known employer status
- [ ] **Task 4.3:** Add explanation paragraph to `MatchExplanationModal.tsx` — use `getMatchThresholdLabel()` for text labels, include matched/unmatched skills and seniority match
- [ ] **Task 4.4:** Add tests in `TrustExplanationModal.test.tsx` and `MatchExplanationModal.test.tsx` for:
  - Explanation text renders with complete breakdown data
  - Graceful fallback when breakdown data is null/missing — shows nothing instead of crash or "undefined" text
  - Use `useMemo` to prevent unnecessary recomputation

## Acceptance Criteria

- [ ] Trust explanation modal displays a human-readable summary of the trust score
- [ ] Match explanation modal displays a human-readable summary of the match score
- [ ] Explanation text uses existing labels (`getTrustClassification()`, `getMatchThresholdLabel()`) for consistency
- [ ] Explanations are concise (2-3 sentences or bullet points)
- [ ] Null/missing breakdown data handled gracefully — no crashes or "undefined" text
- [ ] `useMemo` applied to explanation text computation to avoid unnecessary re-renders
- [ ] All tests pass
