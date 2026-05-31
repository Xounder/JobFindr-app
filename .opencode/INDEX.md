# INDEX.md

# Job Search Aggregator — AI Engineering Guide

This file provides the operational context, architectural guidance, development workflow, and engineering rules for AI agents and contributors working in this repository.

The goal is to ensure:
- architectural consistency;
- maintainability;
- modularity;
- scalability;
- predictable code generation.

This project follows lightweight modular architecture principles inspired by:
- Clean Architecture;
- Vertical Slice Architecture;
- Provider Isolation;
- Stateless Systems.

---

# Documentation Flow

Always start by reading documentation in this order:

1. `architecture/architecture.md` — Architecture README / index
2. `architecture/01-system-overview.md` — System overview
3. `architecture/02-architecture-principles.md` — Architecture principles + engineering philosophy
4. `architecture/03-monorepo-structure.md` — Monorepo structure

Then continue depending on the task below.

---

## Frontend Tasks

| File | Description |
|------|-------------|
| [`architecture/04-frontend-architecture.md`](architecture/04-frontend-architecture.md) | Frontend stack, structure, responsibilities |
| [`architecture/05-frontend-guidelines.md`](architecture/05-frontend-guidelines.md) | UI principles, state management, component rules |

## Backend Tasks

| File | Description |
|------|-------------|
| [`architecture/06-backend-architecture.md`](architecture/06-backend-architecture.md) | Backend stack, module pattern, controller/service rules |
| [`architecture/07-api-architecture.md`](architecture/07-api-architecture.md) | REST endpoints, pagination, error handling |

## Provider Tasks

| File | Description |
|------|-------------|
| [`architecture/08-provider-architecture.md`](architecture/08-provider-architecture.md) | Provider interface, constraints, strategy, isolation |
| [`architecture/09-scraping-architecture.md`](architecture/09-scraping-architecture.md) | Scraping strategies, safety mechanisms |
| [`architecture/10-normalization-layer.md`](architecture/10-normalization-layer.md) | NormalizedJob type, responsibilities |

## Search & Intelligence Tasks

| File | Description |
|------|-------------|
| [`architecture/architecture.md`](architecture/architecture.md) | Architecture overview & index |
| [`architecture/11-matchmaking-engine.md`](architecture/11-matchmaking-engine.md) | Matchmaking pipeline, priorities, avoid list |
| [`architecture/12-trust-engine.md`](architecture/12-trust-engine.md) | Trust thresholds, signals, default behavior |
| [`architecture/13-ranking-engine.md`](architecture/13-ranking-engine.md) | Ranking priorities, deterministic scoring |

## Infrastructure Tasks

| File | Description |
|------|-------------|
| [`architecture/14-caching-architecture.md`](architecture/14-caching-architecture.md) | MVP cache strategy, TTLs |
| [`architecture/15-security-architecture.md`](architecture/15-security-architecture.md) | Security requirements, forbidden data retention |
| [`architecture/16-performance-architecture.md`](architecture/16-performance-architecture.md) | Backend & frontend performance rules |
| [`architecture/17-observability-architecture.md`](architecture/17-observability-architecture.md) | Logging, health check, metrics |
| [`architecture/18-deployment-architecture.md`](architecture/18-deployment-architecture.md) | Deployment targets, containers |

## Engineering & Governance

| File | Description |
|------|-------------|

| [`architecture/19-engineering-guidelines.md`](architecture/19-engineering-guidelines.md) | Code style, naming, TS rules, AI workflow |
| [`architecture/20-scalability-roadmap.md`](architecture/20-scalability-roadmap.md) | MVP philosophy, future additions |
| [`architecture/21-anti-patterns.md`](architecture/21-anti-patterns.md) | Forbidden patterns and why |
| [`architecture/22-testing-philosophy.md`](architecture/22-testing-philosophy.md) | Testing priorities, methodology |

---

# Key Constraints

- **Stateless**: no user accounts, resumes, personal data, or search history
- **Provider isolation**: each provider must fail independently; one failure never crashes the pipeline
- **Deterministic scoring**: ranking, matchmaking, and trust must be explainable (no opaque AI in MVP)
- **Frontend has zero business logic** — no ranking, trust, or matchmaking in the browser
- **State management**: local state → Zustand → TanStack Query
- **API**: `GET /jobs/search`, offset pagination (max 20), structured error responses

---

# Project Overview

The Job Search Aggregator is a lightweight SaaS MVP that aggregates job opportunities from multiple online providers into a single search experience.

Core features:
- multi-provider job aggregation;
- intelligent job ranking;
- skill matchmaking;
- trust-based filtering;
- provider abstraction;
- stateless backend.

The system intentionally avoids:
- user accounts;
- resumes;
- persistent search history;
- personal data retention.

---

## Pipeline Modes

The agent pipeline has two modes:

- **Full Pipeline** (`/start`): PM → Tech Lead → Dev → QA, complete with ceremony
- **Direct Task Mode** (specific tasks): direct routing to the implementation agent → QA → STOP, no PM/TL

**Optional pre-phase**: Before any mode, invoke the [Planning Analyst](./agents/00-planning-agent.md) on-demand for feasibility, risk, and impact analysis. Its output can feed into the Product Manager or directly inform implementation choices.

See [jobfindr-pipeline skill](./skills/jobfindr-pipeline/SKILL.md) for details.

---

# Related Files

- [Plan & tasks](./plan/) — task breakdown and epics
- [Pipeline skill](./skills/jobfindr-pipeline/SKILL.md) — orchestrator
- [Pipeline next skill](./skills/jobfindr-pipeline-next/SKILL.md) — continuation
- [Planning Analyst agent](./agents/00-planning-agent.md) — on-demand feasibility, risk & impact analysis
- [QA Reviewer agent](./agents/05-qa-reviewer.md) — code validation
- [Learning Improvement skill](./skills/learning-improvement/SKILL.md) — session evaluation (skill 1/3 of STOP)
- [Continuous Learning skill](./skills/continuous-learning/SKILL.md) — doc updates (skill 2/3 of STOP)
- [Session Save skill](./skills/session-save/SKILL.md) — session persistence (skill 3/3 of STOP)
