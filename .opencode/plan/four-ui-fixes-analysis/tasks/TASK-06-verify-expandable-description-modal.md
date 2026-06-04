# TASK-06 — Verify `ExpandableDescription.tsx` Modal Sizing

**Layer:** frontend
**Depends on:** TASK-05
**Epic origin:** EPIC-03-modal-sizing-fix.md

## Description

After the `Modal.tsx` refactor in TASK-05, verify that `ExpandableDescription.tsx` correctly passes its `MODAL_DIALOG_CLASS` constant which should now fully override the default width classes.

## Current Code in `ExpandableDescription.tsx` (line 10-11, 38)

```tsx
const MODAL_DIALOG_CLASS = "w-[min(70vw,100%)] max-w-[min(70vw,100%)] max-h-[70vh] overflow-y-auto";

// Usage:
<Modal isOpen={showModal} onClose={handleClose} title={jobTitle ?? "Job Description"} dialogClassName={MODAL_DIALOG_CLASS}>
```

## Verification Steps

1. Confirm that `MODAL_DIALOG_CLASS` uses the `min(70vw, 100%)` pattern which:
   - On desktop: ~70% of viewport width
   - On small screens (mobile): falls back to 100% width since `70vw > 100%`
2. The `max-h-[70vh] overflow-y-auto` ensures the modal content doesn't exceed 70% of viewport height
3. After TASK-05, no additional override is needed — the `dialogClassName` prop now fully replaces the default

## What to Verify

- The `MODAL_DIALOG_CLASS` constant is correct as-is and needs no changes
- The `ExpandableDescription` component passes `dialogClassName={MODAL_DIALOG_CLASS}` to `<Modal>`
- No duplicate or conflicting width classes exist

## If There Are Issues

If testing reveals the modal still doesn't occupy ~70% width, check:
1. That `TASK-05` was correctly implemented and the dialog className no longer contains `w-full max-w-md`
2. That Tailwind v4 is processing the arbitrary values correctly (`w-[min(70vw,100%)]` syntax)
3. That no parent CSS is constraining the dialog width

## Acceptance Criteria

- [ ] "Show More" modal occupies ~70% of viewport width on desktop screens
- [ ] On small screens, modal falls back to full width (`min(70vw, 100%)`)
- [ ] Modal content scrolls vertically when it exceeds `max-h-[70vh]`
- [ ] Trust and Match explanation modals unaffected (still `max-w-md`)
- [ ] No visual regressions
- [ ] All tests pass

## Files to Review / Modify

- `apps/frontend/src/components/ExpandableDescription.tsx` — review (likely no changes needed after TASK-05)
- `apps/frontend/src/components/Modal.tsx` — verify the refactor from TASK-05 is correct
