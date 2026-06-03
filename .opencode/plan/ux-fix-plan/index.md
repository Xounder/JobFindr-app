# UX Fix Plan — JobFindr

**Date:** 2026-06-03
**Requested by:** User
**Status:** Draft

## Objective

Analyze and plan 7 interrelated UX changes to the JobFindr job search interface: fix sort toggle bug, add trust descriptions to slider, decouple Your Skills modal from store, change to manual search on button click, add match% and trust explanation modals, and convert "Show more" to modal.

## Scope

- **Frontend only** — all 7 changes are primarily UI/UX
- **Backend minor** — new endpoints for match/trust explanation (changes 5, 6)
- **No shared packages** — types/utils unchanged

## Summary of Findings

All 7 changes are feasible. Changes 1, 3, and 4 are deeply interdependent — moving to manual search (change 4) naturally fixes the sort bug (change 1) and aligns with the modal-on-close pattern (change 3). A reusable Modal component is the key dependency for changes 5, 6, and 7. The recommended build order is: Modal → Trust labels → Your Skills sync → Search button (+ sort fix) → Match/Trust modals → Show More modal. Backend work is limited to two lightweight explanation endpoints.

## Documents

| File | Description |
|------|-------------|
| `feasibility.md` | Technical feasibility, approaches, and trade-offs for each change |
| `impact-analysis.md` | Impact per layer, files changed, side effects |
| `risks.md` | Risk assessment, what could break, mitigations |
| `recommendations.md` | Build order, phasing, product recommendations |
