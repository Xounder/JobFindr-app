# Provider Acquisition — Epics & Phases

## Overview

This directory contains the decomposition of the provider acquisition plan
(`.opencode/plan/provider-acquisition-plan/index.md`) into actionable epics
and stories. Each phase of the original plan becomes an epic with deliverables,
tasks and acceptance criteria.

## Phase → Epic mapping

| Phase | Epic | Layer | MVP | Description |
|-------|------|-------|-----|-------------|
| 1 | EPIC-PA-01 | Backend | ✅ | Provider Foundation — interface, registry, engine |
| 2 | EPIC-PA-02 | Backend | ✅ | Provider Classification — API / JSON / HTML / Browser |
| 3 | EPIC-PA-03 | Backend | ✅ | Greenhouse Integration |
| 4 | EPIC-PA-04 | Backend | ✅ | Ashby Integration |
| 5 | EPIC-PA-05 | Backend | ✅ | Lever Integration |
| 6 | EPIC-PA-06 | Backend | ✅ | Workday Integration |
| 7 | EPIC-PA-07 | Backend | ✅ | Gupy Integration |
| 8 | EPIC-PA-08 | Backend | ❌ | SmartRecruiters Integration |
| 9 | EPIC-PA-09 | Backend | ❌ | Company Career Pages (HTML scraping) |
| 10 | EPIC-PA-10 | Backend | ❌ | Provider Discovery Engine |
| 11 | EPIC-PA-11 | Backend | ❌ | Provider Reliability Layer |
| 12 | EPIC-PA-12 | Backend | ❌ | Job Acquisition Optimization |
| 13 | EPIC-PA-13 | Backend | ❌ | Browser Automation Layer (deferred) |

## Status legend

- ✅ MVP — implement now
- ❌ Post-MVP — implement later

## Current state

- EPIC 03 (Provider Architecture) exists in `epics.md` but has **mocked providers**
- These PA epics replace/expand EPIC 03 with **real provider implementations**
- Each phase file contains: Objective → Deliverables → Tasks → Acceptance Criteria

## Related docs

- `provider-acquisition-plan/` — full strategy doc (split by phase)
- `../epics.md` — main epics file (EPIC 01-15)
- `../tasks.md` — technical task breakdown
