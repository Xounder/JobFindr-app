# EPIC 02 — Search Engine Core

## TASK-009 — Create Search Endpoint
**Layer:** Backend
**Depends on:** TASK-003
### Description
Create `/jobs/search` endpoint.

---

## TASK-010 — Create Search DTO
**Layer:** Backend
**Depends on:** TASK-003
### Description
Create request validation DTO.

---

## TASK-011 — Implement Search Validation
**Layer:** Backend
**Depends on:** TASK-010
### Description
Validate query params and filters.

---

## TASK-012 — Create Aggregation Service
**Layer:** Backend
**Depends on:** TASK-017, TASK-018
### Description
Create service that orchestrates providers.

---

## TASK-013 — Implement Parallel Provider Execution
**Layer:** Backend
**Depends on:** TASK-012
### Description
Execute providers concurrently.

---

## TASK-014 — Create Provider Timeout Manager
**Layer:** Backend
**Depends on:** TASK-029
### Description
Prevent slow providers from blocking requests.

---

## TASK-015 — Implement Pagination
**Layer:** Backend
**Depends on:** TASK-009
### Description
Create max 20 item pagination system.

---

## TASK-016 — Implement Partial Responses
**Layer:** Backend
**Depends on:** TASK-013
### Description
Allow successful providers to return results even if some fail.

---
