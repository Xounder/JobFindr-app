# Item 4: Job Cards — "Show More" Modal

## Current Implementation

`ExpandableDescription.tsx` already uses the reusable `Modal` component (TASK-008 was implemented in the previous cycle):

```tsx
<Modal isOpen={isModalOpen} onClose={handleClose} title="Job Description">
  <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
    {description}
  </p>
</Modal>
```

The Modal has `max-w-md` class (Tailwind: `max-width: 28rem` / ~448px).

## Request

- Modal should cover **70% of screen width** and **70% of screen height**
- Should display the **same title as the job** (e.g., "Senior Frontend Developer")

## Feasibility: ✅ Feasible — Small Effort

### Approach

#### Width/Height Change

The `Modal` component renders:
```tsx
<div ref={dialogRef} className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
```

**Recommended:** Add a `dialogClassName?: string` prop to `Modal` for callers to customize dialog dimensions:

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  dialogClassName?: string;  // NEW
}
```

Apply it:
```tsx
<div ref={dialogRef} className={`mx-4 w-full max-w-md rounded-lg bg-white shadow-xl ${dialogClassName ?? ""}`}>
```

**In `ExpandableDescription`:**
```tsx
<Modal
  isOpen={isModalOpen}
  onClose={handleClose}
  title={jobTitle}
  dialogClassName="w-[70vw] max-w-[70vw] max-h-[70vh] min-h-0 overflow-y-auto"
>
```

#### Job Title

`ExpandableDescription` currently has no concept of the job title. It needs a new prop:

```tsx
interface ExpandableDescriptionProps {
  description: string;
  maxLength?: number;
  jobTitle?: string;  // NEW
}
```

And `JobCard.tsx` passes:
```tsx
<ExpandableDescription description={job.description} jobTitle={job.title} />
```

**Fallback:** If `jobTitle` is not provided, default to "Job Description" (backward compatible).

#### Responsive Considerations

On small screens (mobile, < 640px):
- 70vw could exceed screen width — add `max-w-full` as a constraint
- Better: `w-[70vw] max-w-[70vw] max-w-full` means "takes 70vw but never more than full width"

Suggested classes:
```
dialogClassName="w-[min(70vw,100%)] max-w-[min(70vw,100%)] max-h-[70vh] overflow-y-auto"
```

Or use Tailwind responsive variants:
```
dialogClassName="w-full sm:w-[70vw] max-w-full sm:max-w-[70vw] max-h-[70vh] overflow-y-auto"
```

## Files to Modify

| File | Change |
|------|--------|
| `apps/frontend/src/components/Modal.tsx` | Add `dialogClassName?: string` prop |
| `apps/frontend/src/components/ExpandableDescription.tsx` | Add `jobTitle` prop; pass to Modal; use 70% sizing |
| `apps/frontend/src/components/JobCard.tsx` | Pass `job.title` as `jobTitle` |
| `apps/frontend/src/components/ExpandableDescription.test.tsx` | Update tests for new title and size |

**Total: 4 files modified, 0 new files**

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| 70vw too wide on mobile | Low | Medium | Use responsive sizing or `max-w-full` constraint |
| Overriding `max-w-md` with `max-w-[70vw]` may cause visual inconsistency | Low | Low | Other modals still use `max-w-md`. This is specific to the "Show More" use case. |
| No existing `jobTitle` on ExpandableDescription props — changes ripple | Medium | Low | Backward-compatible: `jobTitle` defaults to "Job Description" |
