# TASK-HF-01 — Fix Skill Move Stale Closure Bug

**Layer:** frontend
**Depends on:** None
**Epic origin:** [EPIC-01-fix-skill-move-bug.md](../epics/EPIC-01-fix-skill-move-bug.md)

## Description

Fix the stale closure bug in `Layout.tsx` where moving skills from "Add your skills" to "Your skills" leaves items in both lists (duplicate state).

### Root Cause

The `handleMoveToRequired` handler in `Layout.tsx` captures `userSkills` from the component closure at render time. When `UserSkillsModal.handleSave` calls `onUserSkillsChange(localSkills)` (which updates the store) and then calls `onMoveToRequired(checkedSkills)`, the `handleMoveToRequired` callback still references the **old** closure-captured `userSkills` array instead of the freshly updated store state. This causes `setUserSkills(userSkills.filter(...))` to use stale data, effectively re-adding the moved skills back to the source list.

**Call flow:**
```
UserSkillsModal.handleSave()
  → onUserSkillsChange(localSkills)       // updates store.userSkills
  → onMoveToRequired(checkedSkills)        // calls Layout.handleMoveToRequired
    → setUserSkills(userSkills.filter(...)) // userSkills is STALE closure value
```

## Deliverables

1. **Fix stale closure** — In `Layout.tsx`, change `handleMoveToRequired` to read `userSkills` via `useSearchStore.getState().userSkills` instead of the closure-captured variable
2. **Audit** — Check if any other handlers in `Layout.tsx` or `UserSkillsModal.tsx` have similar stale closure patterns (capturing state that gets mutated before the callback fires)
3. **Test** — Verify the full flow: select skills → save → confirm moved skill is removed from source list and appears only in "Your skills"

## Acceptance Criteria

- [ ] Moving a skill from "Add your skills" to "Your skills" removes it from the source list
- [ ] The moved skill appears only in "Your skills" (required skills) list
- [ ] The state is consistent across page re-renders
- [ ] No regressions in the skill selection modal flow

## Files Changed

- `apps/frontend/src/components/Layout.tsx` — ~2 lines changed

## Technical Notes

- Use `useSearchStore.getState().userSkills` (Zustand's external store accessor) rather than reordering calls in `UserSkillsModal` — more robust and doesn't depend on call order
- The `useCallback` dependencies list should be updated to remove `userSkills` since the handler no longer reads from closure
- `useSearchStore` is already imported in `Layout.tsx` (line 3)
