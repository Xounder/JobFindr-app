# 16-performance-architecture.md

# Performance Architecture

---

# Backend Performance

The backend must:
- execute providers concurrently;
- support partial responses;
- timeout slow providers;
- cache repeated requests.

---

# Provider Timeout Calibration

Providers have **two timeout layers**:

1. **Axios-level** (`PROVIDER_TIMEOUT_MS`, default 10000ms) — kills individual HTTP requests
2. **Provider-level** (e.g. `GREENHOUSE_TIMEOUT_MS`, `ASHBY_TIMEOUT_MS`) — kills the entire provider execution via `executeIsolatedProvider`

Provider-level timeouts MUST be calibrated based on real API response measurements, not arbitrary values. As of May 2026:

| Provider   | Timeout | Reason                               |
|------------|---------|--------------------------------------|
| Greenhouse | 30000ms | 13 companies × multiple pages each   |
| Ashby      | 20000ms | 6 companies, parallelized            |
| Lever      | 20000ms | 6 companies + Netflix retry overhead |
| Workday    | 15000ms | 4 companies, parallelized            |
| Gupy       | 10000ms | Single endpoint, fast                |

---

# Frontend Performance

The frontend must:
- lazy load routes;
- debounce searches;
- minimize rerenders.

---

# Related Documents

- [14-caching-architecture.md](./14-caching-architecture.md)
- [09-scraping-architecture.md](./09-scraping-architecture.md)