# EPIC-01: Reusable Modal Component & Trust Labels

**Phase:** 1 — Foundation
**Changes:** Cross-cutting (Modal component), Change 2 (Trust descriptions on slider)
**Effort:** Small
**Dependencies:** None

---

## Objective

Create a reusable Modal component that will serve as the foundation for all three modal-based features (Show More, Match% explanation, Trust explanation), and add descriptive trust-level labels to the TrustFilters slider to improve user comprehension.

---

## Deliverables

### 1. Reusable Modal Component

A lightweight, accessible modal component shared across changes 5, 6, and 7.

**File:** `apps/frontend/src/components/Modal.tsx` (NEW)

**Specification:**

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}
```

- Fixed overlay with centered dialog
- Closes on: overlay click, Escape key, or X button
- Accessible: `role="dialog"`, `aria-modal="true"`, focus trap
- Follows the same structural pattern as the existing `UserSkillsModal`

### 2. Trust Descriptions on Slider

Add inline descriptive labels to the trust slider so users understand what each trust level means.

**File:** `apps/frontend/src/components/TrustFilters.tsx` (MODIFY)

- Show the trust label (from `trustLabel()` utility) next to the current slider value
- Add labeled tick marks along the slider for all 6 trust levels
- Label updates in real-time as the slider moves
- Minimal visual changes — keep existing layout

---

## Tasks

- [ ] Create `apps/frontend/src/components/Modal.tsx` with all required accessibility attributes
- [ ] Implement overlay click, Escape key, and X button close behavior
- [ ] Add focus trap for accessibility
- [ ] Add `Modal.test.tsx` covering: open/close states, overlay click, Escape key, content rendering
- [ ] Modify `apps/frontend/src/components/TrustFilters.tsx` to show current trust label next to value
- [ ] Add labeled tick marks for all 6 trust levels on the slider
- [ ] Update `TrustFilters.test.tsx` to cover new label rendering and real-time updates

---

## Acceptance Criteria

- [ ] **Modal** renders as a centered dialog with overlay
- [ ] **Modal** closes on: overlay click, Escape keypress, and X button click
- [ ] **Modal** has correct ARIA attributes (`role="dialog"`, `aria-modal="true"`)
- [ ] **Modal** traps focus within the dialog while open
- [ ] **Modal** does not break existing tests (UserSkillsModal, any parent components)
- [ ] **Trust slider** shows the descriptive label for the current value
- [ ] **Trust slider** label updates dynamically as the user drags
- [ ] **Trust slider** shows labeled tick marks for all 6 trust levels
- [ ] **Trust slider** existing functionality (value selection, range) remains unchanged
- [ ] All existing tests pass after changes
