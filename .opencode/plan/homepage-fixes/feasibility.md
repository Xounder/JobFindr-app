# Feasibility — Homepage Fixes

## Issue 1: Skill Move Bug

**Approach A: Read fresh state via getState() (Recommended)**
- **Description:** In `Layout.tsx`, change `handleMoveToRequired` to read `userSkills` from `useSkillsStore.getState()` instead of the closure-captured value
- **Effort:** Small (~2 lines changed in 1 file)
- **Files touched:** `apps/frontend/src/components/layout/Layout.tsx`

**Approach B: Reorder calls in UserSkillsModal**
- **Description:** Move `onMoveToRequired(checkedSkills)` to before `onUserSkillsChange(localSkills)` in `handleSave()`
- **Effort:** Small (~1 line moved)
- **Files touched:** `apps/frontend/src/components/skills/UserSkillsModal.tsx`

**Recommendation:** Approach A is safer — it doesn't depend on call order in the parent component.

## Issue 2: Seniority Label

**Approach A: Add label in FiltersPanel (Recommended)**
- **Description:** Import `useSkillsStore` in `FiltersPanel.tsx`, add `<p>` below `SenioritySelector` showing `userSeniority`
- **Effort:** Small (~5 lines in 1 file)
- **Files touched:** `apps/frontend/src/components/filters/FiltersPanel.tsx`

**Recommendation:** Only one viable approach.

## Issue 3: Null Filter Values

**Approach A: Zustand persist migration + null coalescing (Recommended)**
- **Description:** Add version + `migrate` function in filter store persist config. Add `?? []` guard in `AutocompleteInput.tsx`
- **Effort:** Small (~10 lines across 2 files)
- **Files touched:** Filter Zustand store, `apps/frontend/src/components/filters/AutocompleteInput.tsx`

**Approach B: Initialize all arrays in store default**
- **Description:** Ensure store default state has `[]` instead of `undefined` for all array fields
- **Effort:** Small
- **Limitation:** Doesn't fix corrupted localStorage entries from previous sessions

**Recommendation:** Approach A — handles both fresh loads and corrupted localStorage.
