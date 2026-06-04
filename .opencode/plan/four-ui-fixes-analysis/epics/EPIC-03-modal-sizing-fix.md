# EPIC-03: Modal Sizing Fix

**Change:** #1 — "Show More" modal to occupy ~70% of viewport
**Priority:** 🟡 Medium (better readability)
**Effort:** Small (~30 min)
**Dependencies:** None (but shares `Modal.tsx` with Epic 4 — coordinate if parallel)

---

## Objective

Fix the "Show More" modal in `ExpandableDescription.tsx` so it occupies approximately 70% of the viewport width. The root cause is a CSS cascade conflict between the base `Modal.tsx` (which hardcodes `w-full max-w-md`) and the override classes passed via `dialogClassName`.

## Root Cause

1. **`Modal.tsx` (base):** Hardcodes `w-full max-w-md` in the dialog div className
2. **`ExpandableDescription.tsx`:** Passes `w-[min(70vw,100%)] max-w-[min(70vw,100%)]` via `dialogClassName`
3. **Conflict:** Both classes set `width` with equal CSS specificity. Tailwind v4's CSS cascade layer ordering can cause `w-full` to win, capping width at `max-w-md` (448px) instead of the intended 70vw.

## Solution

Refactor `Modal.tsx` to use a `DEFAULT_DIALOG_CLASS` constant as the default value for the `dialogClassName` prop. This way:
- Callers that don't pass `dialogClassName` still get `w-full max-w-md` (backward compatible)
- `ExpandableDescription` passes its own `dialogClassName` which fully overrides
- No need to touch Trust/Match modals

## Deliverables

- [ ] `Modal.tsx` — refactor to use `dialogClassName` default parameter pattern
- [ ] `ExpandableDescription.tsx` — verify/simplify `MODAL_DIALOG_CLASS` (no redundant overrides needed)

## Tasks

- [ ] **Task 3.1:** Add `DEFAULT_DIALOG_CLASS = "w-full max-w-md"` constant in `Modal.tsx`
- [ ] **Task 3.2:** Set `dialogClassName` default prop to `DEFAULT_DIALOG_CLASS`
- [ ] **Task 3.3:** Remove `w-full max-w-md` from the base className string; use only `mx-auto rounded-lg bg-white shadow-xl ${dialogClassName}`
- [ ] **Task 3.4:** Verify `ExpandableDescription.tsx` `MODAL_DIALOG_CLASS` — ensure `w-[min(70vw,100%)] max-w-[min(70vw,100%)] max-h-[70vh] overflow-y-auto` produces intended 70% width
- [ ] **Task 3.5:** Test in multiple viewport sizes (desktop, tablet, mobile) that the modal respects 70vw with a max of 100% on small screens

## Acceptance Criteria

- [ ] "Show More" modal occupies ~70% of viewport width on desktop screens
- [ ] On small screens (mobile), modal gracefully falls back to full width (`min(70vw, 100%)`)
- [ ] Trust explanation modal still displays at `max-w-md` width (default behavior unchanged)
- [ ] Match explanation modal still displays at `max-w-md` width (default behavior unchanged)
- [ ] All existing modal tests pass
- [ ] No visual regressions in any modal rendering
