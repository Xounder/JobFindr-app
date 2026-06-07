# 08-provider-architecture.md

# Provider Architecture

---

# Responsibilities

Providers:
- fetch jobs;
- parse provider responses;
- normalize data.

Providers MUST NOT:
- rank jobs;
- perform matchmaking;
- contain business logic.

---

# Interface

```ts
export interface JobProvider {
  name: string

  search(input: SearchJobsInput): Promise<NormalizedJob[]>
}
````

---

# Supported Providers

* Greenhouse (public API)
* Ashby (public API with compensation)
* Lever (public API)
* Workday (CXS JSON endpoint)
* Gupy (public BR API)

---

# Provider Strategy

Prefer:
- public APIs;
- lightweight scraping;
- resilient parsing.

Use Playwright only when necessary.

---

# Provider Isolation

Providers must:

* fail independently;
* have isolated retries;
* have isolated timeouts.

A provider failure must NEVER crash the aggregation pipeline.

---

# Multi-Company Provider Pattern

Providers that query multiple companies (Greenhouse, Ashby, Lever, Workday) MUST use **`Promise.allSettled`** to parallelize requests per company. Sequential iteration (`for...of`) is forbidden — it creates unacceptable latency when providers search 6-13 companies.

```ts
// CORRECT — parallel
const results = await Promise.allSettled(
  COMPANIES.map(async (company) => {
    return this.fetchCompanyJobs(company.token, query)
  })
)

// WRONG — sequential, slow
for (const company of COMPANIES) {
  const jobs = await this.fetchCompanyJobs(company.token, query)
}
```

Each company request must be individually wrapped in try/catch (or use `Promise.allSettled` result inspection) to maintain provider isolation at the company level.

---

# Provider Constraints

Providers MUST:
- normalize output;
- isolate failures;
- implement retries;
- implement timeouts.

Providers MUST NOT:
- know about UI;
- rank jobs;
- perform matchmaking;
- contain unrelated logic.

---

# Related Documents

* [09-scraping-architecture.md](./09-scraping-architecture.md)
* [10-normalization-layer.md](./10-normalization-layer.md)
