# TASK-001 — Create Reusable Modal Component

**Layer:** Frontend
**Depends on:** None
**Epic origin:** EPIC-01-modal-and-trust-labels (Phase 1 — Foundation)

## Description

Create a lightweight, accessible, reusable Modal component that will serve as the foundation for all three modal-based features (Show More, Match% explanation, Trust explanation). This component follows the same structural pattern as the existing `UserSkillsModal` but is generic and reusable.

## Files to Create

| File | Purpose |
|------|---------|
| `apps/frontend/src/components/Modal.tsx` | New reusable Modal component |
| `apps/frontend/src/components/Modal.test.tsx` | Unit tests for Modal |

## Specification

### Props Interface

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}
```

### Behavior

- **Rendering:** Renders a fixed overlay (`fixed inset-0`) with a centered dialog
- **Overlay:** Semi-transparent black background (`bg-black/50`)
- **Close on overlay click:** Clicking outside the dialog (on the overlay) calls `onClose`
- **Close on Escape:** Pressing the Escape key calls `onClose`
- **Close on X button:** An X button in the modal header calls `onClose`
- **Accessibility:**
  - `role="dialog"` on the dialog container
  - `aria-modal="true"`
  - `aria-label` or `aria-labelledby` pointing to the title
  - Focus trap: when open, Tab/Shift+Tab cycles only through modal elements
  - Initial focus should be on the first focusable element (or the close button)
- **Content:** Renders children inside the dialog body
- **Returns `null`** when `isOpen` is `false`

### Visual Layout

```
┌────────────────────────────────────────────┐
│░░░░░░░░░░░░ Overlay (bg-black/50) ░░░░░░░░░░│
│  ┌────────────────────────────────┐         │
│  │  Header: Title        [X]      │         │
│  ├────────────────────────────────┤         │
│  │  Children (scrollable)         │         │
│  │  ...                           │         │
│  └────────────────────────────────┘         │
└────────────────────────────────────────────┘
```

- Dialog: white background, rounded corners, shadow, max-width (e.g., `max-w-lg` or `max-w-2xl`), centered
- Header: border-bottom, title on left, close button on right
- Body: padding, overflow-y-auto if content is tall

## Acceptance Criteria

- [ ] Modal renders with overlay when `isOpen={true}`
- [ ] Modal returns `null` when `isOpen={false}`
- [ ] Clicking overlay calls `onClose`
- [ ] Pressing Escape calls `onClose`
- [ ] Clicking X button calls `onClose`
- [ ] Modal has `role="dialog"` and `aria-modal="true"` attributes
- [ ] Title is rendered and linked via `aria-labelledby`
- [ ] Focus is trapped within the modal while open
- [ ] Children content is rendered correctly
- [ ] No styling leaks to parent components
- [ ] All existing tests continue to pass

## Files NOT Modified

No existing files are modified by this task. This is a pure additive change.
