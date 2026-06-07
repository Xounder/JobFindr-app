# 01-system-overview.md

# System Overview

## Purpose

The Job Search Aggregator is a lightweight SaaS application focused on aggregating online job opportunities from multiple platforms into a single intelligent search experience.

---

## Main Goals

- Aggregate jobs from multiple providers
- Provide intelligent job ranking
- Perform skill matchmaking
- Filter low-trust companies
- Keep backend stateless
- Avoid user data retention

---

## What the System Avoids

- User accounts
- Resumes
- Persistent search history
- Personal data retention

---

## High-Level Architecture

```txt
Frontend SPA
      ↓
Fastify API
      ↓
Aggregation Engine
      ↓
Providers + Matchmaking + Trust + Ranking
````

---

## Related Documents

* [02-architecture-principles.md](./02-architecture-principles.md)
* [06-backend-architecture.md](./06-backend-architecture.md)
* [08-provider-architecture.md](./08-provider-architecture.md)

````