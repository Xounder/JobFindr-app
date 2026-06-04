# EPIC-03: Job Detail Modal Enhancement

**Source Item:** Item 4 (Show More sizing + title)
**Layer:** Frontend-only
**Effort:** Small
**Dependencies:** None
**Source Docs:** `item-4-show-more-modal.md`

## Objective

Enhance the "Show More" job detail modal to use a larger, more readable layout: 70% of screen width and 70% of screen height, with the job title displayed as the modal title instead of the generic "Job Description".

## Deliverables

1. **`dialogClassName` prop on Modal** — Allow callers to customize the modal dialog dimensions via a new optional className prop
2. **Job title in ExpandableDescription** — Pass `jobTitle` prop from `JobCard` through to the Modal title
3. **70vw/70vh sizing** — The Show More modal occupies 70% of viewport width and 70% of viewport height, with responsive constraints for mobile

## Tasks

- [ ] Add `dialogClassName?: string` prop to `Modal.tsx` component
- [ ] Apply `dialogClassName` to the dialog container div alongside existing classes
- [ ] Add `jobTitle?: string` prop to `ExpandableDescription.tsx`
- [ ] Pass `jobTitle` as the `title` prop to `<Modal>` in `ExpandableDescription`
- [ ] Fallback to "Job Description" when `jobTitle` is not provided (backward compatible)
- [ ] Set dialog classes to `w-[min(70vw,100%)] max-w-[min(70vw,100%)] max-h-[70vh] overflow-y-auto`
- [ ] Pass `job.title` as `jobTitle` from `JobCard.tsx` to `ExpandableDescription`
- [ ] Update `ExpandableDescription.test.tsx` for new title and sizing behavior
- [ ] Verify responsive behavior on mobile (< 640px) — modal should not overflow

## Acceptance Criteria

- [ ] The "Show More" modal displays at approximately 70% of viewport width (capped at 100% on mobile)
- [ ] The "Show More" modal displays at approximately 70% of viewport height with scrollable content
- [ ] The modal title shows the actual job title (e.g., "Senior Frontend Developer") instead of "Job Description"
- [ ] When `jobTitle` is not provided, the modal falls back to "Job Description" as the title
- [ ] The `Modal` component remains backward compatible — existing modals without `dialogClassName` are unaffected
- [ ] All existing tests pass (no regressions)
- [ ] The modal looks visually consistent on desktop and mobile viewports
