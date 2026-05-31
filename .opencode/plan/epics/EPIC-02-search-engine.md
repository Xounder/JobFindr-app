# EPIC 02 — Search Engine Core

## Objective
Build the core job search engine.


## Deliverables
- Search endpoint
- Query parsing
- Aggregation pipeline
- Parallel search execution
- Provider timeout handling
- Pagination


## Tasks
- Create `/jobs/search` endpoint
- Implement Search DTO
- Implement validation
- Create aggregation service
- Implement Promise.all provider execution
- Create 20-item pagination
- Create timeout manager
- Implement partial responses


## Acceptance Criteria
- Search returns jobs
- Maximum 20 jobs per page
- Providers execute in parallel
- Failure in one provider does not break the system

---
