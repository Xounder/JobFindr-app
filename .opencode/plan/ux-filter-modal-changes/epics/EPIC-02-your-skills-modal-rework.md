# EPIC-02: Your Skills Modal Rework

**Source Item:** Item 3 (Skills modal changes)
**Layer:** Frontend-only
**Effort:** Medium
**Dependencies:** EPIC-01 (Clean button in modal's AutocompleteInput — optional, enhances this epic)
**Source Docs:** `item-3-skills-modal.md`

## Objective

Rework the "Your Skills" modal to adopt a save-on-commit pattern: all changes are local until the user explicitly presses "Save", and closing (X) or clicking outside discards changes. Remove the "Move selected to required" button and the "Remove all skills" action. Fix the bug where moving skills to required incorrectly removes them from the "Add your skills" list.

## Deliverables

1. **Save button** — New button at bottom-right that persists all local changes to the store and closes the modal
2. **Close (X) discards** — The X button and overlay click no longer sync to store; they discard local changes
3. **Remove "Move selected to required" button** — The dedicated move button is removed; selection is deferred to Save
4. **Remove "Remove all skills"** — The "Remove all skills" label and confirmation dialog are removed
5. **Bug fix: move-to-required doesn't remove from local** — Skills checked in "Move skills to Required Skills" remain in the "Add your skills" list
6. **Deselect all** — Ensure a "Deselect all" option exists for the checkboxes section (already partially implemented as toggle)

## Tasks

- [ ] Change `handleClose` to discard local state and close only (no sync to store)
- [ ] Create `handleSave` callback that syncs `localSkills`, `localSeniority`, and checked skills to store, then closes
- [ ] Add "Save" button at bottom-right of modal
- [ ] Remove "Move selected to required" button (remove `handleMoveSelected` callback and its JSX)
- [ ] Remove "Remove all skills" label and its confirmation dialog (remove lines ~259-294 from current code)
- [ ] Fix `handleMoveSelected` logic: remove the line that filters checked skills out of `localSkills`
- [ ] `checkedSkills` becomes a deferred set — saved only on `handleSave`
- [ ] Add/verify "Deselect all" button in the checkboxes section (separate from toggle)
- [ ] Ensure overlay/escape click also discards (no sync) — verify current behavior
- [ ] Update `UserSkillsModal.test.tsx`:
  - Remove tests related to Move button and Remove all
  - Add tests for Save button persisting changes
  - Add tests for Close (X) discarding changes
  - Add tests for overlay click discarding changes
  - Add tests for skills remaining in "Add your skills" after being moved to required

## Acceptance Criteria

- [ ] Opening the modal shows current skills from the store as local state
- [ ] Modifying skills, seniority, or checked skills has no effect on the store until Save is clicked
- [ ] Clicking Save persists all changes (skills, seniority, move-to-required selections) and closes the modal
- [ ] Clicking X discards all local changes and closes the modal
- [ ] Clicking the overlay or pressing Escape discards all changes and closes the modal
- [ ] The "Move selected to required" button is no longer visible
- [ ] The "Remove all skills" label and confirmation are no longer visible
- [ ] Checking skills in "Move skills to Required Skills" does NOT remove them from "Add your skills"
- [ ] A "Deselect all" option is available in the checkboxes section
- [ ] All existing and new tests pass
