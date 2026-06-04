# TASK-004 — Job Detail Modal 70% Sizing + Title

**Layer:** Frontend
**Depends on:** None
**Epic origin:** EPIC-03-job-detail-modal-enhancement.md (Item 4: Show More sizing + title)
**Agent:** Senior Frontend

## Description

Enhance the "Show More" job detail modal with larger dimensions (70% viewport width and height) and display the actual job title as the modal title instead of the generic "Job Description". This requires adding a `dialogClassName` prop to the `Modal` component and a `jobTitle` prop to `ExpandableDescription`.

## Files to Modify

- `apps/frontend/src/components/Modal.tsx` — Add `dialogClassName` prop
- `apps/frontend/src/components/ExpandableDescription.tsx` — Add `jobTitle` prop, pass as modal title
- `apps/frontend/src/components/JobCard.tsx` — Pass `job.title` as `jobTitle` to `ExpandableDescription`
- `apps/frontend/src/components/ExpandableDescription.test.tsx` — Update tests
- `apps/frontend/src/components/Modal.test.tsx` — Update tests

## Deliverables

1. Add `dialogClassName?: string` prop to `Modal.tsx` component interface:
   ```tsx
   interface ModalProps {
     isOpen: boolean;
     onClose: () => void;
     title: string;
     children: ReactNode;
     dialogClassName?: string;
   }
   ```
2. Apply `dialogClassName` to the dialog container div (currently `className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl"`)
3. Add `jobTitle?: string` prop to `ExpandableDescription.tsx`
4. Use `jobTitle` as the `title` prop for `<Modal>` when provided, fall back to "Job Description" when not provided
5. Pass `jobTitle={job.title}` from `JobCard.tsx` to `ExpandableDescription`
6. Apply responsive sizing classes to the Show More modal:
   - `w-[min(70vw,100%)] max-w-[min(70vw,100%)] max-h-[70vh] overflow-y-auto`
   - These should go in the `dialogClassName` passed from `ExpandableDescription`
7. Update tests:
   - Test that `dialogClassName` is applied to the dialog in `Modal.test.tsx`
   - Test that `jobTitle` appears as modal title in `ExpandableDescription.test.tsx`
   - Test fallback to "Job Description" when `jobTitle` is not provided
   - Verify no regressions in existing tests

## Implementation Notes

Current `Modal.tsx` dialog div:
```tsx
<div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
```

Should become:
```tsx
<div className={`mx-4 w-full max-w-md rounded-lg bg-white shadow-xl ${dialogClassName ?? ''}`}>
```

In `ExpandableDescription.tsx`, generate dialog classes:
```tsx
const modalDialogClass = "w-[min(70vw,100%)] max-w-[min(70vw,100%)] max-h-[70vh] overflow-y-auto";
```

And pass to Modal:
```tsx
<Modal
  isOpen={showModal}
  onClose={handleClose}
  title={jobTitle ?? "Job Description"}
  dialogClassName={modalDialogClass}
>
```

## Acceptance Criteria

- [ ] The "Show More" modal displays at approximately 70% of viewport width (capped at 100% on mobile)
- [ ] The "Show More" modal displays at approximately 70% of viewport height with scrollable content
- [ ] The modal title shows the actual job title (e.g., "Senior Frontend Developer") instead of "Job Description"
- [ ] When `jobTitle` is not provided, the modal falls back to "Job Description" as the title
- [ ] The `Modal` component remains backward compatible — existing modals without `dialogClassName` are unaffected
- [ ] All existing tests pass (no regressions)
- [ ] The modal looks visually consistent on desktop and mobile viewports
