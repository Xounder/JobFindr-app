# TASK-05 — Refactor `Modal.tsx` — Add `DEFAULT_DIALOG_CLASS` Default Parameter

**Layer:** frontend
**Depends on:** (none)
**Epic origin:** EPIC-03-modal-sizing-fix.md

## Description

Refactor `Modal.tsx` so that the base width classes (`w-full max-w-md`) are defined as a constant and used as the **default value** for the `dialogClassName` prop. This fixes a CSS cascade conflict where `ExpandableDescription.tsx` passes custom `dialogClassName` but the hardcoded `w-full max-w-md` in the base className string wins due to CSS specificity.

## Root Cause

The current implementation hardcodes `w-full max-w-md` in the dialog className:

```tsx
className={`mx-4 w-full max-w-md rounded-lg bg-white shadow-xl ${dialogClassName}`.trim()}
```

When `ExpandableDescription` passes `dialogClassName="w-[min(70vw,100%)] max-w-[min(70vw,100%)] max-h-[70vh] overflow-y-auto"`, the `w-full` and `max-w-md` from the base string still apply, creating a specificity conflict.

## Deliverables

1. Add a `DEFAULT_DIALOG_CLASS` constant at module scope:

```tsx
const DEFAULT_DIALOG_CLASS = "w-full max-w-md";
```

2. Change the `dialogClassName` prop default from `""` to `DEFAULT_DIALOG_CLASS`:

```tsx
export function Modal({ isOpen, onClose, title, children, dialogClassName = DEFAULT_DIALOG_CLASS }: ModalProps) {
```

3. Remove the hardcoded `w-full max-w-md` from the className string, using only:

```tsx
className={`mx-4 rounded-lg bg-white shadow-xl ${dialogClassName}`.trim()}
```

## Expected Final State of Modal.tsx

```tsx
const DEFAULT_DIALOG_CLASS = "w-full max-w-md";

// ... interface unchanged ...

export function Modal({ isOpen, onClose, title, children, dialogClassName = DEFAULT_DIALOG_CLASS }: ModalProps) {
  // ... all logic unchanged ...

  return (
    <div ...>
      <div
        ref={dialogRef}
        className={`mx-4 rounded-lg bg-white shadow-xl ${dialogClassName}`.trim()}
      >
        {/* ... header and body unchanged ... */}
      </div>
    </div>
  );
}
```

## Why This Works

- Callers that don't pass `dialogClassName` still get `w-full max-w-md` (backward compatible via default parameter)
- Callers that pass `dialogClassName` (like `ExpandableDescription`) fully override the width classes
- No need to touch `TrustExplanationModal` or `MatchExplanationModal` — they inherit the default

## Acceptance Criteria

- [ ] `DEFAULT_DIALOG_CLASS` constant defined at module scope in `Modal.tsx`
- [ ] `dialogClassName` prop default changed to `DEFAULT_DIALOG_CLASS`
- [ ] Hardcoded `w-full max-w-md` removed from the className template literal
- [ ] All existing tests pass (`pnpm --filter frontend test`)
- [ ] TypeScript compiles cleanly (`pnpm --filter frontend build`)
- [ ] Trust explanation modal still displays at `max-w-md` width (no visual change)
- [ ] Match explanation modal still displays at `max-w-md` width (no visual change)
- [ ] `ExpandableDescription` modal now correctly receives full override

## Files to Modify

- `apps/frontend/src/components/Modal.tsx` — add constant, change default prop, clean up className
