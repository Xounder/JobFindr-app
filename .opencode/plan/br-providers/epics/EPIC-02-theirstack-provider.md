# EPIC-02: TheirStack Provider

## Description
Implement a job provider for TheirStack API (theirstack.com). TheirStack aggregates 199M job postings from 333k sources across 195 countries. Offers REST API with Bearer token authentication. Covers Brazil with tech-focused job data.

## API Details
- **Base URL**: `https://api.theirstack.com/v1`
- **Auth**: Bearer token via `Authorization: Bearer <token>` header
- **Endpoints**: `POST /jobs/search`
- **Key fields**: job_title, company_name, location, salary, description, technologies, posting_age, remote
- **Rate limit (free)**: 4/s, 10/min, 50/hr, 400/day

## Tasks
- TASK-03: Create TheirStack provider class extending ApiProvider
- TASK-04: Implement search method with filters
- TASK-05: Map TheirStack response fields to NormalizedJob
- TASK-06: Add env vars and rate-limit handling
- TASK-07: Create factory function and tests
