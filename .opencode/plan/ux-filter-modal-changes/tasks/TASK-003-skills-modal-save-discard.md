# TASK-003 — Your Skills Modal Save/Discard Rework

**Layer:** Frontend
**Depends on:** TASK-001 (optional — if Clean button is desired for the modal's AutocompleteInput)
**Epic origin:** EPIC-02-your-skills-modal-rework.md (Item 3: Skills modal changes)
**Agent:** Senior Frontend

## Description

Rework the "Your Skills" modal (`UserSkillsModal`) to adopt a save-on-commit pattern: all changes (skills, seniority, checked skills) remain local until the user explicitly presses "Save". Closing via X, overlay click, or Escape discards all local changes without syncing to the store. Remove the "Move selected to required" button and the "Remove all skills" action. Fix the bug where moving skills to required incorrectly removes them from the "Add your skills" list.

## Files to Modify

- `apps/frontend/src/components/UserSkillsModal.tsx` — Major rework of state management and UI
- `apps/frontend/src/components/UserSkillsModal.test.tsx` — Update tests for new behavior

## Deliverables

1. **Save button** — Add a "Save" button at the bottom-right of the modal body that:
   - Syncs `localSkills` to the store via `onUserSkillsChange`
   - Syncs `localSeniority` to the store via `onUserSeniorityChange`
   - Persists `checkedSkills` to required skills via `onMoveToRequired`
   - Closes the modal after saving
2. **Close (X) discards** — Change `handleClose` (X button) to discard local changes and close only (no store sync)
3. **Overlay/Escape discards** — Ensure overlay click and Escape also discard without syncing
4. **Remove "Move selected to required" button** — Remove `handleMoveSelected` callback, its JSX button, and its "checkedSkills.size" counter display
5. **Remove "Remove all skills"** — Remove the "Remove all skills" label and its confirmation dialog (lines ~259-294 of current code)
6. **Bug fix: move-to-required doesn't remove from local** — Remove the line in `handleMoveSelected` (or equivalent logic) that filters checked skills out of `localSkills`. Skills that are moved to required should remain in the "Add your skills" list
7. **Deselect all** — Verify the existing "Deselect all" toggle works correctly (already partially implemented as `allChecked` toggle). Ensure "Deselect all" appears when not all items are checked
8. **Update tests:**
   - Remove tests related to Move button and Remove all
   - Add tests for Save button persisting changes
   - Add tests for Close (X) discarding changes
   - Add tests for overlay click discarding changes
   - Add tests for skills remaining in "Add your skills" after being moved to required
   - Add tests for Deselect all functionality

## Implementation Notes

Current state flow:
- `localSkills` — initialized from `userSkills` prop on open
- `localSeniority` — initialized from `userSeniority` prop on open
- `checkedSkills` — `Set<string>` for tracking which skills to move
- `handleClose` currently syncs to store before closing → **change to discard only**
- `handleMoveSelected` currently removes checked skills from `localSkills` → **fix: keep them**
- Remove the `showRemoveConfirm` state and `handleRemoveAll` — no longer needed

New sync flow:
1. User opens modal → local state initialized from store props
2. User edits skills, seniority, checks skills → all changes stay in local state
3. User clicks "Save" → local state synced to store, modal closes
4. User clicks X / overlay / Escape → local state discarded, modal closes (store unchanged)

## Acceptance Criteria

- [ ] Opening the modal shows current skills from the store as local state
- [ ] Modifying skills, seniority, or checked skills has no effect on the store until Save is clicked
- [ ] Clicking Save persists all changes (skills, seniority, move-to-required selections) and closes the modal
- [ ] Clicking X discards all local changes and closes the modal
- [ ] Clicking overlay or pressing Escape discards all changes and closes the modal
- [ ] The "Move selected to required" button is no longer visible
- [ ] The "Remove all skills" label and confirmation are no longer visible
- [ ] Checking skills in "Move skills to Required Skills" does NOT remove them from "Add your skills"
- [ ] A "Deselect all" option is available in the checkboxes section
- [ ] If TASK-001 was completed, the "Add your skills" AutocompleteInput shows "Clean" button
- [ ] All existing and new tests pass
