# EPIC 01 — Fix Skill Move Stale Closure Bug

## Objective

Fix the skill move bug where skills remain listed in both "Add your skills" and "Your skills" sections after being moved, causing a confusing duplicate state for the user.

## Motivation

When a user moves skills from "Add your skills" to "Your skills" (required skills filter), the items visually remain in the source list. This makes it look like the move operation failed and creates an inconsistent UX where skills appear duplicated across both sections.

## Deliverables

- Fix stale closure in `Layout.tsx` so skill state is read fresh after the move operation

## Root Cause

The `handleMoveToRequired` handler in `Layout.tsx` captures `userSkills` from the component closure at render time. When the parent modal's save handler calls `onUserSkillsChange` (which updates the store) and then triggers `onMoveToRequired`, the handler still references the old closure-captured `userSkills` array instead of the freshly updated store state.

## Approach (Recommended)

Use `useSkillsStore.getState()` inside `handleMoveToRequired` to read the latest `userSkills` from the Zustand store, rather than relying on the closure-captured value.

## Affected File

- `apps/frontend/src/components/layout/Layout.tsx`

## Tasks

- [ ] Change `handleMoveToRequired` to read `userSkills` via `useSkillsStore.getState().userSkills` instead of the closure variable
- [ ] Verify no other handlers in the component have similar stale closure patterns
- [ ] Test the full flow: select skills → move → confirm both lists are correct

## Acceptance Criteria

- [ ] Moving a skill from "Add your skills" to "Your skills" removes it from the source list
- [ ] The moved skill appears only in "Your skills" (required skills) list
- [ ] The state is consistent across page re-renders
- [ ] No regressions in the skill selection modal flow

## Priority

High — visible bug that undermines user trust in the skill management UI.

## Effort

Small (~2 lines changed, 1 file).
