# TASK-401 — Move Your Skills to Header Modal

**Layer:** frontend
**Depends on:** None
**Epic origin:** `epics/epic-4-user-skills-header.md`

## Description

Move the "Your Skills" management from the sidebar `FiltersPanel` to a permanent button in the page header. Clicking the button opens a modal (`UserSkillsModal`) where users can view/edit their skills, selectively move individual skills to "Required Skills" (instead of the current "move all" behavior), and remove all skills with a confirmation dialog.

The sidebar `FiltersPanel` will show a simplified indicator (e.g., "X skills set") instead of the full `UserSkillsInput` component.

## Technical Approach

### Files to modify/create

1. **`apps/frontend/src/components/UserSkillsModal.tsx`** (CREATE)

   A centered modal with overlay that:
   - **Props:** `isOpen: boolean`, `onClose: () => void`, plus the same props as `UserSkillsInput`:
     - `userSkills: string[]`
     - `userSeniority: string`
     - `onUserSkillsChange: (skills: string[]) => void`
     - `onUserSeniorityChange: (seniority: string) => void`
     - `skills: string[]` (required skills for selective move comparison)
     - `onMoveToRequired: (skillsToMove: string[]) => void` — changed from "move all" to accept an array
   - **Overlay:** semi-transparent dark background, click to close
   - **Modal box:** centered, white background, rounded, shadow, max-width `max-w-lg`
   - **Close:** X button, Escape key, clicking outside
   - **Skills editing:** Reuses the same `AutocompleteInput` + tag pattern from `UserSkillsInput` to add/remove user skills
   - **Selective move:** Each skill tag has a checkbox. "Move Selected to Required" button moves only checked skills and clears them from user skills
   - **Remove All:** "Remove All" button shows a confirmation dialog (`window.confirm` or a simple inline confirm) before clearing all skills
   - **Seniority selector:** Preserved inside the modal, same as `UserSkillsInput`
   - **Suggestions:** Uses the same `useSuggestions` hook

2. **`apps/frontend/src/components/Layout.tsx`** (MODIFY)

   - Import `UserSkillsModal` and `useSearchStore`
   - Add local state: `const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false)`
   - Add a "Your Skills" button in the header (right side, after the logo and tagline):
     - Styled as a secondary button (outline or ghost style)
     - Displays a count badge of currently set user skills (e.g., "Your Skills (3)")
     - `onClick={() => setIsSkillsModalOpen(true)}`
   - Render `<UserSkillsModal>` with the store values and setter callbacks
   - Modal state (open/closed) managed locally via `useState`

3. **`apps/frontend/src/components/FiltersPanel.tsx`** (MODIFY)

   - Replace the `<UserSkillsInput>` component with a simplified indicator:
     ```tsx
     <div className="rounded-lg border border-gray-200 p-3">
       <div className="flex items-center justify-between">
         <h3 className="text-sm font-semibold text-gray-900">Your Skills</h3>
         <span className="text-xs text-gray-500">
           {filters.userSkills.length} skill{filters.userSkills.length !== 1 ? 's' : ''} set
         </span>
       </div>
       <p className="mt-1 text-xs text-gray-400">
         Manage your skills in the header
       </p>
     </div>
     ```
   - Remove the `onUserSkillsChange`, `onUserSeniorityChange`, and `onMoveToRequired` props from `FiltersPanelProps` (or keep them but no longer pass to the indicator)
   - Update the `FiltersPanel` callers to no longer pass these props (or pass optional)

4. **`apps/frontend/src/pages/HomePage.tsx`** (MODIFY)

   - Remove the import of `UserSkillsInput` if it was directly imported (it was used via `FiltersPanel`, so if `FiltersPanel` no longer needs the callbacks, update accordingly)
   - The `handleMoveToRequired` function (line 56-60) may need to be updated to support selective move — depending on how the modal calls back. If `onMoveToRequired` now accepts an array, update the handler:
     ```typescript
     const handleMoveToRequired = useCallback(
       (skillsToMove: string[]) => {
         const merged = [...new Set([...skills, ...skillsToMove])];
         setSkills(merged);
         setUserSkills(userSkills.filter(s => !skillsToMove.includes(s)));
       },
       [skills, userSkills, setSkills, setUserSkills],
     );
     ```
   - Remove `onUserSkillsChange`, `onUserSeniorityChange`, `onMoveToRequired` from the `FiltersPanel` props

5. **`apps/frontend/src/components/UserSkillsModal.test.tsx`** (CREATE)
   - Test modal opens and closes (overlay click, Escape, close button)
   - Test skills are displayed as tags
   - Test selective move: checking a skill and clicking "Move Selected to Required" moves only that skill
   - Test remove all with confirmation
   - Test seniority selector works in modal
   - Test suggestions are fetched and displayed

6. **`apps/frontend/src/components/UserSkillsInput.test.tsx`** (MODIFY if needed)
   - If the `UserSkillsInput` component was modified (e.g., `onMoveToRequired` signature changed), update the tests
   - If `UserSkillsInput` is unchanged, no modification needed

### What NOT to change

- Do NOT modify the `useSearchStore` — reuse `userSkills`, `userSeniority`, `setUserSkills`, `setUserSeniority`
- Do NOT modify any backend files
- Do NOT remove `UserSkillsInput.tsx` — it may still be used in the modal or kept for reference

## Deliverables

- [ ] "Your Skills" button rendered in the header with skill count badge
- [ ] `UserSkillsModal.tsx` renders as a centered modal with overlay
- [ ] Modal closes on clicking outside, pressing Escape, or clicking close button
- [ ] Modal displays current skills with autocomplete/tags
- [ ] Each skill has a checkbox for selective moving
- [ ] "Move Selected to Required" moves only checked skills and clears them from user skills
- [ ] "Remove All" shows a confirmation dialog before clearing
- [ ] Seniority selector preserved inside the modal
- [ ] `FiltersPanel.tsx` shows simplified indicator instead of full `UserSkillsInput`
- [ ] No regressions in skill filtering behavior
- [ ] `UserSkillsModal.test.tsx` covers open/close, selective move, remove all confirmation
- [ ] All frontend tests pass
