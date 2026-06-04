# TASK-HF-02 — Add Seniority Label on Homepage

**Layer:** frontend
**Depends on:** None
**Epic origin:** [EPIC-02-add-seniority-label.md](../epics/EPIC-02-add-seniority-label.md)

## Description

Display the currently selected user seniority level as a visible label on the homepage so users can immediately see their current seniority selection without having to open the modal or inspect the dropdown.

### Motivation

Users select their seniority level (Junior, Mid-Level, Senior, Lead, Principal) inside the "Your Skills" modal. Once the modal closes, there is no persistent visual indicator on the homepage showing which seniority level is active. Users must re-open the modal to confirm their selection, creating friction. The seniority value is already stored in `useSearchStore.userSeniority` but is not rendered in the FiltersPanel outside the "Your Skills" summary section.

## Deliverables

1. **Import store** — Add `import { useSearchStore } from "@/store/searchStore";` in `FiltersPanel.tsx`
2. **Read `userSeniority`** — Call `useSearchStore()` and destructure `userSeniority`
3. **Render label** — Add a `<p>` element **below** the `<SenioritySelector>` component that displays the currently selected seniority label
   - If `userSeniority` is set: show the human-readable label (e.g., "Seniority: Senior")
   - If `userSeniority` is empty/falsy: display "Seniority: Not set"
4. **Responsive sizing** — Use `text-xs` or `text-sm` with appropriate spacing so the layout doesn't break on narrow/mobile viewports
5. **Verify reactivity** — Confirm the label updates immediately when a different seniority level is selected and saved in the modal

## Acceptance Criteria

- [ ] The selected seniority level is visible on the homepage at all times (below the SenioritySelector)
- [ ] The label updates immediately when a different seniority level is selected and saved
- [ ] The layout does not break on narrow/mobile viewports
- [ ] When no seniority is selected, the label displays "Not set" or an appropriate default
- [ ] No regressions in the seniority selector dropdown behavior

## Files Changed

- `apps/frontend/src/components/FiltersPanel.tsx` — ~5 lines added

## Technical Notes

- `useSearchStore` is the store that holds `userSeniority` (persisted via Zustand persist middleware)
- The label should be placed **after** the `<SenioritySelector>` closing tag (around line 89 in current code), inside the `<aside>` container
- Use Tailwind classes like `mt-1 text-xs text-gray-500` for consistent styling with surrounding elements
- The existing "Your Skills" section (lines 59-87) already shows `filters.userSeniority` inside a summary block — this new label is a **separate, always-visible** indicator below the SenioritySelector
