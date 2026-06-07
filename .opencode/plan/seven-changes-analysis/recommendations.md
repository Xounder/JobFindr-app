# Recommendations — Seven Changes

---

## For Product Manager

### Overview

These 7 changes span backend logic (scoring), frontend UX (labels, tooltips, suggestions), and API contracts (types). They range from tiny 2-line changes (Change 7) to medium-effort refactors (Change 1). The suggested order below minimizes merge conflicts and maximizes user value early.

### What to Build (Scope per Change)

| # | Change | Layer(s) | Effort | Priority | Value |
|---|--------|----------|--------|----------|-------|
| 7 | Capitalize seniority + prominence | Frontend | < 5 min | 🔴 Highest | Quick visual polish with immediate impact |
| 5 | Skill limit 30 → 100 | Backend | < 10 min | 🔴 Highest | Unblocks power users with many skills |
| 4 | Conditional seniority label | Frontend | < 15 min | 🟠 High | Clarifies confusing dual-seniority UX |
| 2 | Seniority match tooltip | Frontend + types | ~30 min | 🟠 High | Provides actionable insight on match results |
| 3 | Filter seniority for matchmaking | Backend | ~15 min | 🟡 Medium | Makes match scores reflect actual filter choice |
| 6 | Job title suggestions | Backend + frontend | ~1 hr | 🟡 Medium | Improves search bar UX significantly |
| 1 | Match score job-centric | Backend + frontend | ~2 hr | 🟢 Lower | Correctness fix; affects scoring semantics |

### What NOT to Build (Out of Scope)

- **Remove `userSeniority` from API entirely** — keep for backward compatibility (Change 3 stops using it but doesn't remove it)
- **AI-powered title suggestions** — use hardcoded list; dynamic extraction from job cache can be a future enhancement
- **User skill limit enforcement on frontend** — backend validation is sufficient; frontend already prevents duplicates via AutocompleteInput
- **Full redesign of seniority UX** — changes 3+4+7 together provide sufficient clarity without a redesign

### Dependencies Between Changes

```
Change 5 (skill limit) ── independent
Change 6 (title suggestions) ── independent
Change 7 (capitalize) ── independent

Changes 4 + 7 ── BOTH touch FiltersPanel.tsx (adjacent lines)
  → Implement together to avoid conflicts

Changes 1 + 2 ── BOTH affect MatchBreakdown semantics and MatchExplanationModal
  → Implement Change 2 first (adds fields), then Change 1 (refactors semantics)
  → Or implement together in coordinated pass

Changes 1 + 3 ── BOTH touch aggregation-service.ts matchmaking block
  → Implement Change 3 first (simple param swap), then Change 1 (scoring refactor)
```

### Suggested Phasing

#### Phase 1: Quick Wins (30 min) — Changes 7 + 5 + 4

These are tiny, independent, no-risk changes that improve UX immediately.

| Step | Change | Files | Notes |
|------|--------|-------|-------|
| 1 | Change 7 — Capitalize seniority | `FiltersPanel.tsx` | 2-line change |
| 2 | Change 5 — Skill limit 100 | `search-validation.ts`, `anti-spam.ts`, test | 3 constants, 1 test |
| 3 | Change 4 — Conditional label | `FiltersPanel.tsx` | Conditional render change |

**Validation:** Open filters panel. Verify: seniority displays as "Junior" (not "junior"), bold indigo. Add 31+ skills — should be accepted. Verify label appears only when modal seniority differs from filter seniority.

#### Phase 2: Seniority & Matchmaking UX (45 min) — Changes 2 + 3

These changes both relate to seniority handling and should be implemented in sequence.

| Step | Change | Files | Notes |
|------|--------|-------|-------|
| 1 | Change 3 — Filter seniority for matchmaking | `aggregation-service.ts` | Simple param swap + array normalization |
| 2 | Change 2 — Seniority tooltip | `match.types.ts` (shared + frontend), `weighted-match-scoring.ts`, `MatchExplanationModal.tsx` | Type extension + tooltip |

**Validation:** Set different filter seniority (Senior) and modal seniority (Junior). Search. Open match modal. Verify badge tooltip shows "Junior / Senior". Verify match score changed vs. before the fix.

#### Phase 3: Correctness & Discovery (2 hr) — Changes 6 + 1

These are larger changes with more files touched.

| Step | Change | Files | Notes |
|------|--------|-------|-------|
| 1 | Change 6 — Job title suggestions | `suggestions-controller.ts`, `api.ts`, `SearchBar.tsx` | New suggestions category |
| 2 | Change 1 — Match score job-centric | `similarity-engine.ts`, `weighted-match-scoring.ts`, tests, `explain.ts`, `MatchExplanationModal.tsx` | Careful refactor with test updates |

**Validation (Change 6):** Open search bar, type "Senior" — should see "Senior Software Engineer", "Senior Developer" in suggestions with "Title" badge.

**Validation (Change 1):** Set 30 user skills, search for a job with 3 skills where only 1 matches. Verify: match explanation says "1 of 3 job skills matched". Verify matched skills section shows the 1 job skill (not user skills).

---

## Technical Constraints

1. **Change 1 (semantic shift):** The meaning of `matchedSkills`/`unmatchedSkills` in the API response changes. Ensure all frontend consumers (currently `MatchExplanationModal.tsx`, `explain.ts`) are updated. Any external API consumers would be affected.

2. **Change 3 (array handling):** `input.seniority` is `SeniorityLevel[]`. The matchmaking function expects `string | undefined`. Use `input.seniority[0]` when length is 1, `undefined` when empty, `input.seniority[0]` when multiple (call out this decision in code comments).

3. **Change 5 (anti-spam scope):** The anti-spam middleware's `maxSkillsCount` only checks the `skills` query param, not `userSkills`. After increasing to 100, the anti-spam check should ideally also cover `userSkills`. Consider adding `userSkills` to the anti-spam check as part of this change.

4. **Change 6 (MAX_SUGGESTIONS):** Currently 8 total suggestions. With 3 categories, consider implementing per-category limits (e.g., 4 skills, 2 companies, 2 titles) to ensure diverse suggestions.

---

## Suggested Epic Breakdown

### Epic 1: Seniority UX Polish (Changes 4 + 7)
- **Task 1.1:** Capitalize and style seniority display in FiltersPanel "Your Skills" section
- **Task 1.2:** Conditional label showing modal seniority only when different from filter seniority
- **Files:** `FiltersPanel.tsx`

### Epic 2: Match Score & Seniority Fixes (Changes 1 + 2 + 3)
- **Task 2.1:** Change aggregation-service to use filter panel seniority for matchmaking
- **Task 2.2:** Extend MatchBreakdown type with userSeniority/jobSeniority (shared + frontend)
- **Task 2.3:** Add seniority tooltip in MatchExplanationModal
- **Task 2.4:** Refactor match score to be job-centric in similarity-engine and weighted-match-scoring
- **Task 2.5:** Update frontend consumers (MatchExplanationModal, explain.ts) for new semantics
- **Task 2.6:** Update backend tests for new scoring semantics
- **Files:** `aggregation-service.ts`, `similarity-engine.ts`, `weighted-match-scoring.ts`, `match.types.ts` (packages), `types/index.ts` (frontend), `MatchExplanationModal.tsx`, `explain.ts`, test files

### Epic 3: Skill Limit Increase (Change 5)
- **Task 3.1:** Update validation limits from 30 to 100
- **Task 3.2:** Update anti-spam middleware maxSkillsCount
- **Task 3.3:** Update tests
- **Files:** `search-validation.ts`, `anti-spam.ts`, `search-validation.test.ts`

### Epic 4: Search Bar Title Suggestions (Change 6)
- **Task 4.1:** Add job titles to backend suggestions endpoint
- **Task 4.2:** Extend SuggestionsResponse type in frontend
- **Task 4.3:** Render title suggestions in SearchBar with icon and badge
- **Files:** `suggestions-controller.ts`, `api.ts`, `SearchBar.tsx`

---

## Suggested Implementation Order

```
Phase 1 (Quick Wins):
  Change 7 → Change 5 → Change 4

Phase 2 (Seniority UX):
  Change 3 → Change 2

Phase 3 (Larger Features):
  Change 6 → Change 1

Total estimated effort: ~4-5 hours
```
