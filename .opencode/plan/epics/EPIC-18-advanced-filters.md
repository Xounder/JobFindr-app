# EPIC 18 — Advanced Filters

## Objective
Implement filtering by remote mode, seniority, posted date, and country on both frontend and backend, giving users more control over job search results.

## Motivation
Users currently cannot filter by remote mode, seniority level, posted date, or country. These fields are already collected and normalized from providers, and the backend validates them — but they are never applied as filters. This epic delivers the full filter pipeline: backend application + frontend UI.

## Deliverables
- Server-side filtering for remoteMode, seniority, postedAfter
- Frontend remoteMode filter UI
- Frontend and backend country filter

## Related Improvements
- 02-filtros-server-side (High) — base for all others
- 03-remoteMode-filter (High)
- 04-pais-filter (Medium)

## Priority
High — core filtering functionality

## Dependencies
- US-18.1 must be completed before US-18.2 and US-18.3

## Tasks
- US-18.1: Apply remoteMode, seniority and postedAfter filters server-side
- US-18.2: Add remoteMode filter component to frontend
- US-18.3: Add country filter to frontend and backend

## Acceptance Criteria
- Backend filters jobs by remoteMode, seniority, postedAfter before matchmaking
- Frontend exposes remoteMode and country filter controls
- All filters compose correctly with existing filters (companies, trust score)
- Empty/absent filter values result in no filtering (pass-through)

---

