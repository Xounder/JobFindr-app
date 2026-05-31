# EPIC 03 — Provider Architecture ⚠️ SUPERSEDED

**Note:** This epic has been superseded by **EPIC 16 (Provider Acquisition)** and the detailed epics in `.opencode/plan/provider-acquisition/`. Kept only for historical reference.

## Objective
Create an extensible multi-provider job architecture.


## Deliverables
- Standard provider interface
- Initial providers
- Normalization system


## Tasks
- Create `JobProvider`
- Create provider registry
- Create normalizer
- Create Gupy provider
- ~~Create LinkedIn provider~~ (removed — out of scope)
- Create Greenhouse provider
- Create Workday provider
- Create fallback provider


## Acceptance Criteria
- Providers are independent
- All providers return `NormalizedJob`
- Providers are pluggable
- New providers are easy to add

---
