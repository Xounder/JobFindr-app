# UX Filter & Modal Changes — Full Analysis

**Date:** 2026-06-03
**Requested by:** User
**Status:** Draft

## Objective

Analyze 5 UX changes to the JobFindr job search interface: converting "Add" buttons to "Clean", adding company mutual exclusion, reworking the Your Skills modal, improving the "Show More" modal, and converting trust/match badges into interactive explanation buttons.

## Scope

- **Frontend** — all 5 items have frontend impact
- **Backend** — Item 5 requires backend changes (embed `matchBreakdown`/`trustBreakdown` in search response)
- **No shared packages** — types may need minor updates for Item 5

## TL;DR Summary

| Item | Feasibility | Effort | Files Changed | Backend |
|------|-------------|--------|---------------|---------|
| 1 — "Add" → "Clean" | ✅ Feasible | Small | 2-4 | No |
| 2 — Company mutual exclusion | ✅ Feasible | Small | 2 | No |
| 3 — Your Skills modal changes | ✅ Feasible | Medium | 2 | No |
| 4 — "Show More" modal size | ✅ Feasible | Small | 3-4 | No |
| 5 — Trust/Match as buttons | ⚠️ Needs backend | Large | 8-12 | Yes |

**Total:** ~17-20 files across all items. Items 1-4 are frontend-only and fully independent.

## Documents

| File | Description |
|------|-------------|
| `index.md` | This file — overview and TL;DR |
| `item-1-clean-button.md` | Add → Clean button for AutocompleteInput |
| `item-2-company-exclusion.md` | Mutual exclusion between Include/Exclude companies |
| `item-3-skills-modal.md` | Your Skills modal: Save button, Close discards, fix move-to-required |
| `item-4-show-more-modal.md` | "Show More" modal: 70% size, job title |
| `item-5-trust-match-buttons.md` | Trust & Match badges as interactive explanation buttons |

## Key Dependencies

```
Item 1 ─── Standalone
Item 2 ─── Standalone
Item 3 ─── Standalone (but has conceptual overlap with Item 1 for "Add your skills")
Item 4 ─── Depends on: Modal component (already exists)
Item 5 ─── Depends on: Modal component, backend breakdown data
```

Items 1-4 can be implemented in any order. Item 5 requires backend changes first.

## Suggested Implementation Order

```
Phase 1: Foundation
  Item 4 — Modal sizing (quick, already has Modal dependency)
  Item 1 — Clean button (standalone)

Phase 2: Filter logic
  Item 2 — Company mutual exclusion (standalone)

Phase 3: Modal rework
  Item 3 — Your Skills modal changes (substantial, independent)

Phase 4: Backend + Labels as buttons
  Item 5 — Backend: embed breakdown data
  Item 5 — Frontend: convert badges to buttons
```

## Items Needing Clarification

1. **Item 1 scope:** Should `UserSkillsInput.tsx` (header's "Add your skills" input outside the modal) also change to "Clean"?
2. **Item 3 — "Remove all skills":** Remove entirely, or keep for the "Add your skills" section? The request says remove from "Move skills to Required Skills" which could imply the entire modal.
3. **Item 4 title:** The "Show More" modal needs a `jobTitle` prop passed from `JobCard` through `ExpandableDescription`.
4. **Item 5 deferral:** Previous planning explicitly deferred EPIC-05 (Match/Trust explanation modals). Confirm this is now in scope.
