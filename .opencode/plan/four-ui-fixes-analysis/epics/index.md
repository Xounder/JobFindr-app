# Epics — Four UI Fixes

**Context:** `four-ui-fixes-analysis`
**Date:** 2026-06-03
**Status:** Draft

## Overview

Four independent frontend-only UI fixes for the JobFindr search aggregator. All changes are low-risk, independently implementable, and require no backend modifications.

## Epic Mapping

| Epic | Change | Priority | Effort | Files Affected |
|------|--------|----------|--------|----------------|
| [EPIC-01: Search Bar Bug Fix](./EPIC-01-search-bar-bug-fix.md) | Change 4 — Clear button triggers unwanted search | 🔴 Highest | Tiny (~5 min) | `SearchBar.tsx`, `SearchBar.test.tsx` |
| [EPIC-02: Job Card Skill Highlighting](./EPIC-02-job-card-skill-highlighting.md) | Change 3 — Highlight matching user skills in job cards | 🟠 High | Small (~30 min) | `JobCard.tsx`, `JobCard.test.tsx` |
| [EPIC-03: Modal Sizing Fix](./EPIC-03-modal-sizing-fix.md) | Change 1 — "Show More" modal to occupy ~70% viewport | 🟡 Medium | Small (~30 min) | `Modal.tsx`, `ExpandableDescription.tsx` |
| [EPIC-04: Trust & Match Explanation Text](./EPIC-04-trust-match-explanation-text.md) | Change 2 — Human-readable explanations in modals | 🟢 Lower | Small (~1 hr) | `TrustExplanationModal.tsx`, `MatchExplanationModal.tsx`, utility file (optional) |

## Dependencies

- **No dependencies between epics** — all 4 changes are fully independent
- Can be implemented in any order, recommended order follows priority above
- Note: Epic 3 and Epic 4 both touch `TrustExplanationModal.tsx` and `MatchExplanationModal.tsx` — coordinate to avoid merge conflicts if done in parallel

## Key Constraints

- **Frontend only** — no backend changes
- **No external APIs** — all changes use existing data
- **MVP scope** — avoid gold-plating
- **Tests must be updated** for changed behavior (especially Epic 1 which fixes a bug where the test validates the buggy behavior)
- **Tailwind CSS v4** — ensure arbitrary value syntax compatibility
