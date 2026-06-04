# Recommendations — Four UI Fixes

---

## For Product Manager

### Overview

All 4 changes are **frontend-only**, **low-risk**, and **independently implementable**. They can be done in any order, but the suggested order below minimizes merge conflicts and maximizes visible value.

### What to Build (Scope per Change)

| # | Change | Effort | Priority | Value |
|---|--------|--------|----------|-------|
| 4 | Search bar "x" button fix | < 5 min | 🔴 Highest | Fixes a clear bug; improves UX immediately |
| 3 | Skill highlighting in job cards | ~30 min | 🟠 High | High visibility improvement; users see their skills highlighted |
| 1 | "Show More" modal size | ~30 min | 🟡 Medium | Better readability of long job descriptions |
| 2 | Trust & Match explanation text | ~1 hr | 🟢 Lower | Nice-to-have readability improvement on existing modals |

### What NOT to Build (Out of Scope for MVP)

- **Backend APIs** for explanation text — all data already available in frontend
- **New modals** — reuse existing `TrustExplanationModal` and `MatchExplanationModal`
- **Generative AI** explanations — explicitly excluded by requirements
- **Epics/tasks folder creation** — the Planning Analyst produces plans only; PM should create epics based on these docs

### Dependencies

- **None between the 4 changes** — they are fully independent
- Each change can be implemented, tested, and deployed individually
- If done in parallel by different developers, only `Modal.tsx` (Change 1) and the explanation modals (Change 2) both modify `TrustExplanationModal.tsx` and `MatchExplanationModal.tsx` — coordinate to avoid merge conflicts

### Technical Constraints

1. **Tailwind CSS v4** — ensure any new arbitrary value syntax is compatible
2. **Zustand store** — `userSkills` is already persisted in localStorage; no additional persistence needed for Change 3
3. **Tests must be updated** for Change 4 (existing test validates the buggy behavior)
4. **No external APIs** — all changes use existing data

---

## Suggested Implementation Order

### Phase 1: Bug Fix (5 min)
**Change 4** — Search bar "x" button
- Remove `onSearch("")` from `handleClear()` in `SearchBar.tsx`
- Update the test to match new behavior
- **Validation:** Click clear button, verify no network request fires

### Phase 2: Quick Wins (1.5 hr)
**Change 3** — Skill highlighting
- Import `useSearchStore` in `JobCard.tsx`
- Add conditional className based on `userSkills` match
- Use case-insensitive comparison
- Add test for skill highlighting behavior
- **Validation:** Set user skills, search, verify matched skills highlighted

**Change 1** — Modal size
- Refactor `Modal.tsx` to use `dialogClassName` default parameter
- Update `ExpandableDescription.tsx` `MODAL_DIALOG_CLASS` if needed
- **Validation:** Open "Show More" modal, verify it fills ~70% of viewport

### Phase 3: Polish (1 hr)
**Change 2** — Trust & Match explanation text
- Add utility function(s) for explanation generation
- Add explanation paragraph to both modals
- **Validation:** Open both modals, verify readable explanation appears above/with data

---

## Suggested Epic Breakdown

### Epic 1: Search Bar Bug Fix
- **Task 1.1:** Remove `onSearch("")` from `handleClear` in `SearchBar.tsx`
- **Task 1.2:** Update `SearchBar.test.tsx` — clear button should NOT call onSearch
- **Files:** `SearchBar.tsx`, `SearchBar.test.tsx`

### Epic 2: Job Card Skill Highlighting
- **Task 2.1:** Add `userSkills` comparison logic and conditional styling in `JobCard.tsx`
- **Task 2.2:** Add tests for skill highlighting (indigo badge for matched, gray for unmatched)
- **Files:** `JobCard.tsx`, `JobCard.test.tsx`

### Epic 3: Modal Sizing Fix
- **Task 3.1:** Refactor `Modal.tsx` — use `dialogClassName` default parameter for sizing
- **Task 3.2:** Verify usage in `TrustExplanationModal.tsx` and `MatchExplanationModal.tsx`
- **Files:** `Modal.tsx`, `ExpandableDescription.tsx`

### Epic 4: Trust & Match Explanation Text
- **Task 4.1:** Add explanation builder utilities (optional)
- **Task 4.2:** Add explanation paragraph to `TrustExplanationModal.tsx`
- **Task 4.3:** Add explanation paragraph to `MatchExplanationModal.tsx`
- **Task 4.4:** Add tests for new explanation text rendering
- **Files:** `TrustExplanationModal.tsx`, `MatchExplanationModal.tsx`, `TrustExplanationModal.test.tsx`, `MatchExplanationModal.test.tsx`
