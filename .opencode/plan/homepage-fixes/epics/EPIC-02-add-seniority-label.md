# EPIC 02 — Add Seniority Label on Homepage

## Objective

Display the currently selected seniority level as a visible label on the homepage so users can immediately see their current seniority selection without having to interact with the dropdown.

## Motivation

The seniority filter dropdown allows users to select their experience level (Junior, Mid-Level, Senior, Lead), but the selected value is only visible when the dropdown is open. Once closed, there is no visual indicator on the homepage showing which seniority level is active. This forces users to re-open the dropdown to confirm their selection, creating friction.

## Deliverables

- Add a label below the SenioritySelector in FiltersPanel showing the currently selected seniority value

## Affected File

- `apps/frontend/src/components/filters/FiltersPanel.tsx`

## Approach

Import `useSkillsStore` in `FiltersPanel.tsx` and render a `<p>` element below the `<SenioritySelector>` component displaying the `userSeniority` value from the store.

## Tasks

- [ ] Import `useSkillsStore` in `FiltersPanel.tsx`
- [ ] Read `userSeniority` from the store
- [ ] Render a `<p>` element below `<SenioritySelector>` showing the selected seniority label
- [ ] Use responsive text sizing for narrow screens
- [ ] Verify the label updates reactively when seniority changes

## Acceptance Criteria

- [ ] The selected seniority level is visible on the homepage at all times
- [ ] The label updates immediately when a different seniority level is selected
- [ ] The layout does not break on narrow/mobile viewports
- [ ] When no seniority is selected, the label displays "Not set" or an appropriate default
- [ ] No regressions in the seniority selector dropdown behavior

## Priority

Medium — UX improvement that reduces friction.

## Effort

Small (~5 lines added, 1 file).
