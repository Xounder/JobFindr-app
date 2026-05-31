# Epic 4: Your Skills in Header

**Priority:** 4 (UX)
**Effort:** Medium
**Layer:** Frontend only
**Dependencies:** None (but benefits from stable foundation)

## Description

Move the "Your Skills" management from the sidebar `FiltersPanel` to a permanent button in the page header. Clicking the button opens a modal (`UserSkillsModal`) where users can:

- View and edit their skills and seniority level
- Selectively move individual skills to "Required Skills" (instead of the current "move all" behavior)
- Remove all skills with a confirmation dialog

The sidebar `FiltersPanel` will show a simplified indicator instead of the full `UserSkillsInput` component.

## Acceptance Criteria

### Header Button
- [ ] "Your Skills" button is rendered in the global `Layout.tsx` header
- [ ] Button displays a count of currently set user skills
- [ ] Clicking the button opens the `UserSkillsModal`

### Modal
- [ ] `UserSkillsModal.tsx` component renders as a centered modal with overlay
- [ ] Modal closes on clicking outside, pressing Escape, or clicking a close button
- [ ] Modal displays current skills with autocomplete/tags (reuses existing input logic)
- [ ] Each skill has a checkbox for selective moving
- [ ] "Move Selected to Required" button moves only checked skills and clears them from user skills
- [ ] "Remove All" button shows a confirmation dialog before clearing all skills
- [ ] Seniority level selector is preserved inside the modal

### Sidebar
- [ ] `FiltersPanel.tsx` shows a simplified indicator (e.g., "X skills set") instead of the full `UserSkillsInput`
- [ ] Clicking the indicator can also open the modal (optional, nice-to-have)

### General
- [ ] Modal state (open/closed) is managed locally in `Layout.tsx` via `useState`
- [ ] All existing store state (`userSkills`, `userSeniority`, `setSkills`) is reused — no new store fields
- [ ] `UserSkillsModal.test.tsx` covers open/close, selective move, remove all confirmation
- [ ] Existing `UserSkillsInput.test.tsx` is updated if the component was modified
- [ ] No regressions in skill filtering behavior

## Affected Files

| Action | File |
|--------|------|
| CREATE | `apps/frontend/src/components/UserSkillsModal.tsx` |
| MODIFY | `apps/frontend/src/components/Layout.tsx` |
| MODIFY | `apps/frontend/src/components/FiltersPanel.tsx` |
| MODIFY | `apps/frontend/src/pages/HomePage.tsx` |
| MODIFY | `apps/frontend/src/components/UserSkillsInput.test.tsx` |
| CREATE | `apps/frontend/src/components/UserSkillsModal.test.tsx` |
