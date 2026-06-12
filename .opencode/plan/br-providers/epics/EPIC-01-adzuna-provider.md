# EPIC-01: Adzuna Provider

## Description
Implement a job provider for Adzuna API (developer.adzuna.com). Adzuna aggregates job listings from multiple sources and offers a REST API with API key authentication. Supports 12 countries including Brazil (br) with BRL currency.

## API Details
- **Base URL**: `https://api.adzuna.com/v1/api`
- **Auth**: `app_id` + `app_key` (query parameters)
- **Country code**: `br` for Brazil
- **Endpoints**: `/jobs/br/search/{page}`, `/jobs/br/categories`
- **Key fields**: title, company, location, salary_min, salary_max, description, category, contract_type, created_date

## Tasks
- TASK-01: Create Adzuna provider class extending ApiProvider
- TASK-02: Implement search method with keyword, location, category filters
- TASK-03: Map Adzuna response fields to NormalizedJob
- TASK-04: Add env vars and timeout configuration
- TASK-05: Create factory function and tests
