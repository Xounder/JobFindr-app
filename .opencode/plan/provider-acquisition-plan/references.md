# Public ATS APIs & References

## Greenhouse

Official Documentation:

- https://developers.greenhouse.io/job-board
- https://support.greenhouse.io/hc/en-us/articles/10568627186203-Greenhouse-API-overview
- https://www.greenhouse.com/api

Public Jobs Endpoint:

```http
GET https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs
```

Example:

```http
GET https://boards-api.greenhouse.io/v1/boards/stripe/jobs
```

Notes:

- Public endpoint
- No authentication required for job listing retrieval
- Used by thousands of technology companies
- One of the best ATS targets for MVP

References:

- Greenhouse Job Board API documentation — https://developers.greenhouse.io/job-board
- Greenhouse public jobs API examples — https://boards-api.greenhouse.io/v1/boards/stripe/jobs

---

## Ashby

Official Documentation:

- https://developers.ashbyhq.com/docs/public-job-posting-api

Public Jobs Endpoint:

```http
GET https://api.ashbyhq.com/posting-api/job-board/{job_board_name}
```

Compensation Example:

```http
GET https://api.ashbyhq.com/posting-api/job-board/notion?includeCompensation=true
```

Notes:

- Public API
- No authentication required
- Includes compensation support
- Increasing adoption among tech companies

References:

- Ashby Public Job Posting API — https://developers.ashbyhq.com/reference/public-job-posting-api

---

## Workday

Official Documentation:

Workday does not expose a unified public documentation for public job retrieval.

Typical Endpoint Pattern:

```http
POST https://{company}.wd1.myworkdayjobs.com/wday/cxs/{tenant}/{career_site}/jobs
```

Example Structure:

```http
POST https://company.wd1.myworkdayjobs.com/wday/cxs/company/careers/jobs
```

Notes:

- Usually accessible without authentication
- JSON endpoints are often consumed directly by Workday frontend applications
- Requires endpoint discovery per tenant

---

## SmartRecruiters

Official Documentation:

- https://www.smartrecruiters.com

Common Endpoint Pattern:

```http
GET https://api.smartrecruiters.com/v1/companies/{company}/postings
```

Notes:

- Some APIs require authentication
- Public job pages may expose accessible JSON endpoints
- Needs validation per company

Community discussions indicate many developers avoid SmartRecruiters as an MVP-first provider due to authentication requirements.

---

## Lever

Official Documentation:

- https://github.com/lever/postings-api

Public Jobs Endpoint:

```http
GET https://api.lever.co/v0/postings/{company}
```

Example:

```http
GET https://api.lever.co/v0/postings/netflix
```

Notes:

- Public
- No authentication required
- Very popular among technology companies

---

# Provider Acquisition Strategy

Priority order:

```txt
1. Public API
2. Public JSON Endpoint
3. HTML Scraping
4. Browser Automation
```

Never invert this order.

---