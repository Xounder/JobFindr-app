# EPIC-02: Job Card Skill Highlighting

**Change:** #3 — Highlight skills in job cards that match the user's skills
**Priority:** 🟠 High (high visibility improvement)
**Effort:** Small (~30 min)
**Dependencies:** None

---

## Objective

Highlight skills displayed in `JobCard` that match the user's saved skills (from `useSearchStore.state.userSkills`). Matching skills should use the indigo badge style (matching `UserSkillsModal`), while non-matching skills remain in the default gray style.

## Current State

- User skills stored in `useSearchStore.state.userSkills` (persisted in localStorage via Zustand `persist` middleware)
- Job skills come from `job.skills[]` in the API response
- All skills render as identical gray badges (`bg-gray-100 text-gray-700`)

## Desired Behavior

- Skills that match a user skill (case-insensitive) render with indigo styling: `bg-indigo-100 text-indigo-800`
- Skills that do NOT match render with default gray styling: `bg-gray-100 text-gray-700`
- Empty `userSkills` → all skills show as default gray (no visual change)

## Deliverables

- [ ] `JobCard.tsx` — import `useSearchStore`, add conditional styling on skill badges
- [ ] `JobCard.test.tsx` — add tests for skill highlighting behavior

## Tasks

- [ ] **Task 2.1:** Import `useSearchStore` in `JobCard.tsx` and read `userSkills` via selector
- [ ] **Task 2.2:** Update the skills mapping loop to compare each skill against `userSkills` (case-insensitive)
- [ ] **Task 2.3:** Apply conditional className: indigo style for matched, gray for unmatched
- [ ] **Task 2.4:** Add tests in `JobCard.test.tsx` for:
  - Skills that match user skills render with indigo style
  - Skills that do not match render with gray style
  - Empty `userSkills` — all skills render gray
  - Case-insensitive matching works (e.g., "typescript" matches "TypeScript")

## Acceptance Criteria

- [ ] Skills matching user skills display with indigo badge style (`bg-indigo-100 text-indigo-800`)
- [ ] Non-matching skills display with default gray badge style (`bg-gray-100 text-gray-700`)
- [ ] Comparison is case-insensitive (e.g., "react" matches "React", "REACT", etc.)
- [ ] No skills highlighted when `userSkills` is empty
- [ ] No unnecessary re-renders — selector only triggers on `userSkills` changes
- [ ] All tests pass
