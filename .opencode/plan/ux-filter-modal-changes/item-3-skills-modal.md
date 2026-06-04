# Item 3: Your Skills Modal Changes

## Current Implementation

`UserSkillsModal.tsx` was already refactored (TASK-007 from previous cycle) to use local state:

- **Local state:** `localSkills` (copy of `userSkills` prop), `localSeniority` (copy of `userSeniority` prop)
- **"Add your skills"** AutocompleteInput uses `localSkills` as `selectedItems`
- **"Move skills to Required Skills"** section shows the same `localSkills` with checkboxes (`checkedSkills` Set)
- **"Move Selected to Required"** button calls `onMoveToRequired(checkedSkills)` and **removes** them from `localSkills`
- **"Select all" / "Deselect all"** toggle for checkboxes
- **"Remove all skills"** with confirmation clears `localSkills`
- **Close button (X):** syncs to store — calls `onUserSkillsChange(localSkills)`, `onUserSeniorityChange(localSeniority)`, then `onClose()`
- **Overlay/Escape:** just calls `onClose()` — discards changes

**Current flow:**
```
Open → edit local state → Close/X → sync to store → close
                          Overlay/Escape → discard → close
```

## Request

1. **Remove** "Move selected to required" button
2. **Remove** "Remove all skills" label
3. **Add** a label/button to deselect all items in "Move skills to Required Skills"
4. **Bug fix:** "Move skills to Required Skills" should ALWAYS have the same values as "Add your skills" (moving should NOT remove from "Add your skills")
5. **Close button (X)** should discard all changes without saving
6. **Create a Save button** at the bottom-right to persist changes
7. **All items only update when Save is pressed** (including "Move skills to Required Skills")

## Feasibility: ✅ Feasible — Medium Effort

### Requested Flow

```
Open → edit local state → Save button → sync to store → close
                          Close/X → discard → close
                          Overlay/Escape → discard → close
```

### Detailed Changes

#### 1. Remove "Move selected to required" button

Delete the `handleMoveSelected` callback and its JSX button (lines 248-255 in current code). The section still shows checkboxes for selection, but there's no immediate "move" action — selection is only used on Save.

#### 2. Remove "Remove all skills" label

Delete the entire "Remove All" section (lines 259-294 in current code). This includes the confirmation dialog and the "Remove all skills" trigger link.

**Note:** If the user still needs to clear all skills from "Add your skills", this could be accomplished via the "Clean" button from Item 1 (if also applied to the modal's AutocompleteInput).

#### 3. Deselect all button

The current code already has a "Select all" / "Deselect all" toggle (`handleSelectAll`). If the request wants a separate permanent "Deselect all" button (not a toggle), add one:
```tsx
<button onClick={() => setCheckedSkills(new Set())}>Deselect all</button>
```

Otherwise, the existing toggle is sufficient.

#### 4. Bug fix: "Move skills" should not remove from "Add your skills"

**Current behavior:**
```tsx
const handleMoveSelected = useCallback(() => {
  const skillsToMove = Array.from(checkedSkills);
  if (skillsToMove.length === 0) return;
  onMoveToRequired(skillsToMove);                          // sync to store immediately
  setLocalSkills((prev) => prev.filter((s) => !checkedSkills.has(s))); // REMOVE from local
  setCheckedSkills(new Set());
}, [checkedSkills, onMoveToRequired]);
```

**Fix:** Remove the line that removes from `localSkills`. The section should be read-only for display — it shows which skills are in `localSkills` and allows checking which ones should also be required. Skills remain in "Add your skills" regardless of whether they're checked.

**New behavior:** `checkedSkills` is just a set of skills that will be passed to `onMoveToRequired` on Save. Skills are never removed from `localSkills`.

#### 5. Close button (X) discards changes

Change `handleClose` to NOT sync — just close:
```tsx
const handleCloseDiscard = useCallback(() => {
  onClose();  // discard local state, no sync
}, [onClose]);
```

#### 6. Save button at bottom-right

Add a "Save" button:
```tsx
<button
  type="button"
  onClick={handleSave}
  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
>
  Save
</button>
```

#### 7. Save handler — sync to store

```tsx
const handleSave = useCallback(() => {
  onUserSkillsChange(localSkills);
  onUserSeniorityChange(localSeniority);
  const skillsToMove = Array.from(checkedSkills);
  if (skillsToMove.length > 0) {
    onMoveToRequired(skillsToMove);
  }
  setCheckedSkills(new Set());
  onClose();
}, [localSkills, localSeniority, checkedSkills, onUserSkillsChange, onUserSeniorityChange, onMoveToRequired, onClose]);
```

### Visual Layout (Suggested)

```
┌─────────────────────────────────────┐
│  Your Skills                    [X] │  ← X now DISCARDS (no sync)
├─────────────────────────────────────┤
│                                     │
│  Add your skills  [___input___]     │
│  [skill1 ×] [skill2 ×]             │
│                                     │
│  Your Seniority: [select v]        │
│                                     │
│  Move skills to Required Skills     │
│  [Select all]                       │
│  ☑ skill1  ☐ skill2  ☑ skill3     │
│                                     │
│                             [Save]  │  ← NEW: persists all changes
└─────────────────────────────────────┘
```

## Files to Modify

| File | Change |
|------|--------|
| `apps/frontend/src/components/UserSkillsModal.tsx` | Major refactor: remove Move button, Remove all, change close to discard, add Save button, fix move-to-required behavior |
| `apps/frontend/src/components/UserSkillsModal.test.tsx` | Remove Move/Remove-all tests, add Save/Close-discard tests |

**Total: 2 files modified, 0 new files**

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| User closes modal and loses changes (close=discard) | High | Medium | Consider a confirmation dialog if `checkedSkills.size > 0` or local state differs from props |
| "Move skills to Required Skills" becomes non-functional until Save | Medium | Low | This is the intended behavior — selection is deferred |
| User can't clear all skills anymore (Remove all removed) | Medium | Low | Item 1's "Clean" button on the AutocompleteInput handles this within the section |
| Existing tests extensively cover Move/Remove-all | High | Low | Significant test refactor needed — remove old tests, add new ones |
