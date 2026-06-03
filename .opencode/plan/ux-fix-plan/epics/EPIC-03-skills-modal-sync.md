# EPIC-03: Your Skills Modal — Local State & Sync on Close

**Phase:** 3 — Skills Modal
**Changes:** Change 3 (Your Skills: sync only on modal close)
**Effort:** Small
**Dependencies:** EPIC-02 (store refactor — dirty flag propagation)

---

## Objective

Refactor `UserSkillsModal` to use local state during editing and only sync changes to the store when the user closes the modal. This prevents every individual skill add/remove from triggering dirty state and potential re-fetches, aligning with the new manual-search paradigm from EPIC-02.

---

## Deliverables

### 1. Local State Inside UserSkillsModal

**File:** `apps/frontend/src/components/UserSkillsModal.tsx` (MODIFY)

- `UserSkillsModal` receives `userSkills` and `userSeniority` as initial values (via props)
- Creates local copies (`localSkills`, `localSeniority`) via `useState`
- All add/remove/seniority changes operate on local state only
- On close (`onClose` callback), sync local state to store via the prop callbacks
- On cancel/Escape/overlay click, discard local changes (no sync)
- Show a confirmation dialog if there are unsaved changes and user clicks overlay/Escape

### 2. Move-to-Required with Local State

The "Move Selected to Required" functionality must also work locally:
- Moves operate on local copies of both `userSkills` and `skills` (required)
- On modal close, sync both arrays to the store
- Edge case: "Remove all skills" with confirmation must also be local

---

## Tasks

- [ ] Refactor `UserSkillsModal` to accept `userSkills` and `userSeniority` as props
- [ ] Initialize local state (`localSkills`, `localSeniority`) from props on mount
- [ ] Update all add/remove handlers to operate on local state only
- [ ] Update "Move Selected to Required" to operate on local copies
- [ ] Update "Remove all skills" confirmation to work on local state
- [ ] Implement sync on close: call prop callbacks with local state values
- [ ] Implement discard on cancel: do NOT sync, let local state be garbage collected
- [ ] Add unsaved changes confirmation dialog (optional, see risk mitigation)
- [ ] Update `UserSkillsModal.test.tsx` — test local state, sync on close, discard on cancel
- [ ] Ensure dirty flag in search store is only set when sync happens (modal close), not during editing

---

## Acceptance Criteria

- [ ] **Skill additions/removals** inside the modal do NOT trigger dirty state or API calls
- [ ] **On modal close** (via close button), local state is synced to the store
- [ ] **On modal cancel** (Escape/overlay click), local changes are discarded
- [ ] **"Move Selected to Required"** works on local state and syncs on close
- [ ] **"Remove all skills"** confirmation works on local state
- [ ] **Dirty flag** is only set after modal close sync, not during editing
- [ ] All existing keyboard and accessibility behavior is preserved
- [ ] `UserSkillsModal.test.tsx` covers: local editing, sync on close, discard on cancel, move-to-required
