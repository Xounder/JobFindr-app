# TASK-007 — Refactor UserSkillsModal to Use Local State

**Layer:** Frontend
**Depends on:** TASK-005 (HomePage draft/commit — dirty flag integration)
**Epic origin:** EPIC-03-skills-modal-sync (Phase 3 — Skills Modal)

## Description

Refactor `UserSkillsModal` to use local state during editing instead of writing directly to the store on every change. Changes are only synced to the store when the user closes the modal (via the close button). Cancel/Escape/overlay click discards local changes. This prevents individual skill edits from triggering the dirty flag and aligns with the manual-search paradigm.

## Files to Modify

| File | Change |
|------|--------|
| `apps/frontend/src/components/UserSkillsModal.tsx` | Major refactor: local state, sync on close |
| `apps/frontend/src/components/UserSkillsModal.test.tsx` | Update tests for new behavior |

## Current State

The modal currently calls props callbacks directly on every change:
- `onUserSkillsChange` on add/remove — immediately updates the store → sets isDirty → triggers reactive search
- `onUserSeniorityChange` on seniority change — immediately updates the store
- `onMoveToRequired(skillsToMove)` — immediately updates both `skills` (required) and `userSkills` in the store

## Specification

### 1. Props Interface (No Change Needed)

The modal already receives the necessary props:
```tsx
interface UserSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSkills: string[];
  userSeniority: string;
  onUserSkillsChange: (skills: string[]) => void;
  onUserSeniorityChange: (seniority: string) => void;
  skills: string[];
  onMoveToRequired: (skillsToMove: string[]) => void;
}
```

### 2. Local State Initialization

When the modal opens, initialize local copies from props:
```typescript
const [localSkills, setLocalSkills] = useState<string[]>([]);
const [localSeniority, setLocalSeniority] = useState("");
const [localRequiredSkills, setLocalRequiredSkills] = useState<string[]>([]);
const [hasChanges, setHasChanges] = useState(false);

useEffect(() => {
  if (isOpen) {
    setLocalSkills(userSkills);
    setLocalSeniority(userSeniority);
    setLocalRequiredSkills(skills);  // 'skills' prop = required skills from parent
    setHasChanges(false);
    setCheckedSkills(new Set());
    setShowRemoveConfirm(false);
  }
}, [isOpen, userSkills, userSeniority, skills]);
```

### 3. All Edit Operations Use Local State

Every handler that currently calls prop callbacks should operate on local state instead:

- **Add skill:** `setLocalSkills(prev => [...prev, skill])` + `setHasChanges(true)`
- **Remove skill:** `setLocalSkills(prev => prev.filter(s => s !== skill))` + `setHasChanges(true)`
- **Seniority change:** `setLocalSeniority(value)` + `setHasChanges(true)`
- **Move to required:** `setLocalSkills(prev => prev.filter(s => !checkedSkills))` + `setLocalRequiredSkills(prev => [...prev, ...checkedSkills])` + `setHasChanges(true)` + `setCheckedSkills(new Set())`
- **Remove all:** `setLocalSkills([])` + `setHasChanges(true)` + `setShowRemoveConfirm(false)`

### 4. Sync on Close (Close Button Only)

When the close button (X) or the explicit close action happens:
```typescript
const handleCloseWithSync = useCallback(() => {
  onUserSkillsChange(localSkills);
  onUserSeniorityChange(localSeniority);
  // If required skills changed, sync them too
  if (JSON.stringify(localRequiredSkills) !== JSON.stringify(skills)) {
    // onMoveToRequired expects skillsToMove, but we need a different approach
    // Since the parent manages required skills, we need to sync the difference
    const addedSkills = localRequiredSkills.filter(s => !skills.includes(s));
    if (addedSkills.length > 0) {
      onMoveToRequired(addedSkills);
    }
    const removedSkills = skills.filter(s => !localRequiredSkills.includes(s));
    if (removedSkills.length > 0) {
      // For removals from required, we need a callback — but the current API
      // doesn't have one. However, the parent (HomePage or header component)
      // calls setSkills() which accepts the full array.
    }
  }
  onClose();
}, [localSkills, localSeniority, localRequiredSkills, skills, onUserSkillsChange, onUserSeniorityChange, onMoveToRequired, onClose]);
```

**Note:** The sync logic for required skills needs careful handling. The current `onMoveToRequired` only supports ADDING skills to required. For the full local-state approach, the parent component may need to accept the full `skills` array as a replacement. **Recommendation:** Add a new prop or modify the parent to accept a `onRequiredSkillsChange` callback that receives the full array. Alternatively, keep the move-to-required add-only and note that removal from required is handled elsewhere.

For MVP: Sync only `userSkills` and `userSeniority` on close. The required skills sync can be handled by calling `onMoveToRequired` with the net-new skills since close.

### 5. Discard on Cancel

When the user closes via overlay click or Escape:
```typescript
const handleOverlayClick = useCallback(
  (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      if (hasChanges) {
        // Show confirmation dialog — or simply discard
        // For MVP, just discard without confirmation
      }
      onClose();  // No sync — local changes are lost
    }
  },
  [hasChanges, onClose],
);
```

**Risk R3 mitigation:** The risk document suggests showing a confirmation dialog if there are unsaved changes. For MVP, a simple discard without confirmation is acceptable (keeping it simple). The confirmation dialog can be added in a follow-up.

### 6. Template Changes

Update the JSX to use `localSkills` and `localSeniority` instead of props:

```tsx
// Before: uses props directly
<AutocompleteInput
  selectedItems={userSkills}
  onAdd={(skill) => onUserSkillsChange([...userSkills, skill])}
  onRemove={(skill) => onUserSkillsChange(userSkills.filter((s) => s !== skill))}
/>

// After: uses local state
<AutocompleteInput
  selectedItems={localSkills}
  onAdd={(skill) => {
    setLocalSkills(prev => [...prev, skill]);
    setHasChanges(true);
  }}
  onRemove={(skill) => {
    setLocalSkills(prev => prev.filter(s => s !== skill));
    setHasChanges(true);
  }}
/>
```

Update `handleMoveSelected` to operate on local state:
```typescript
const handleMoveSelected = useCallback(() => {
  const skillsToMove = Array.from(checkedSkills);
  if (skillsToMove.length === 0) return;
  setLocalSkills(prev => prev.filter(s => !skillsToMove.includes(s)));
  setLocalRequiredSkills(prev => [...prev, ...skillsToMove]);
  setCheckedSkills(new Set());
  setHasChanges(true);
}, [checkedSkills]);
```

### Test Updates (`UserSkillsModal.test.tsx`)

Cover the new behavior:
- **Local editing:** adding skills doesn't call prop callbacks until close
- **Sync on close:** close button triggers prop callbacks with local state
- **Discard on cancel:** overlay click/Escape does NOT trigger prop callbacks
- **Move to required:** operates on local state, syncs on close
- **Remove all:** operates on local state, syncs on close
- **Has changes flag:** tracks whether edits were made
- **Dirty flag:** NOT set during editing (only on close sync)

## Acceptance Criteria

- [ ] Skill additions/removals inside the modal do NOT trigger `onUserSkillsChange` until modal close
- [ ] On close button click, local state is synced to store via prop callbacks
- [ ] On overlay click/Escape, local changes are discarded (no sync)
- [ ] "Move Selected to Required" operates on local state and syncs on close
- [ ] "Remove all skills" operates on local state and syncs on close
- [ ] Dirty flag is only set after modal close sync (via store setter), not during editing
- [ ] All keyboard and accessibility behavior is preserved
- [ ] All existing and new tests pass

## Notes

- This task depends on TASK-005 because after this change, skill edits only set the dirty flag on modal close, which is the correct behavior for the manual-search paradigm
- The `hasChanges` state is used internally to track whether any edits were made (useful for future confirmation dialog feature)
