# UX Improvements — Epic Overview

**Context:** `.opencode/plan/prioridades-ux/`
**Date:** 2026-05-31
**Status:** Draft

## Objective

Improve the overall user experience of JobFindr by making search results more transparent, the search bar more responsive, and skill management more accessible.

## Epic Mapping

| # | Epic | Priority | Layer | Dependencies | Effort |
|---|------|----------|-------|-------------|--------|
| 1 | Trust-First Default Ordering | 1 (Foundation) | Backend only | None | Small |
| 2 | Sort Toggle: Trust vs Match | 2 (Control) | Full-stack | Epic 1 | Medium-High |
| 3 | Search Bar Improvements | 3 (UX) | Frontend only | None | Small-Medium |
| 4 | Your Skills in Header | 4 (UX) | Frontend only | None | Medium |

## Execution Strategy

- **Incremental delivery** — each epic is independently deployable
- **Phase 1 (Sorting):** Epic 1 → Epic 2 (Epic 1 is a prerequisite for Epic 2)
- **Phase 2 (Search):** Epic 3 (independent, can run in parallel with Phase 1)
- **Phase 3 (Skills):** Epic 4 (largest UI effort, benefits from stable foundation)

## Related Documents

- [Impact Analysis](../impact-analysis.md)
- [Risks](../risks.md)
- [Recommendations](../recommendations.md)
