# TASKS.md

# Job Search Aggregator — Detailed Tasks Breakdown

## Allocation by Layer

| Layer | Tasks | Agent |
|-------|-------|-------|
| **Frontend** | 002, 063–088 | Senior Frontend (03) |
| **Backend** | 003, 006, 009–062, 084–103, 112–130 | Senior Backend (04) |
| **Shared** | 001, 004–005, 007–008, 104–111 | Both (coordination) |

## Execution Order (dependencies respected per layer)

**Backend** (sequencial sugerida): TASK-003 → TASK-017→019 → TASK-112→119 → TASK-120→124 → TASK-025→033 → TASK-034→041 → TASK-009→016 → TASK-042→048 → TASK-049→055 → TASK-056→062 → TASK-084→090 → TASK-091→097 → TASK-098→103 → TASK-125→130

**Frontend** (sequencial sugerida): TASK-002 → TASK-063→069 → TASK-070→076 → TASK-077→083 → TASK-087→088

> **Note:** TASK-020 (LinkedIn) is out of scope (see .opencode/plan/provider-acquisition-plan/).

## EPICs

- [Foundation & Monorepo Setup](EPIC-01-tasks.md)
- [Search Engine Core](EPIC-02-tasks.md)
- [Provider Architecture](EPIC-03-tasks.md)
- [Scraping Infrastructure](EPIC-04-tasks.md)
- [Job Normalization](EPIC-05-tasks.md)
- [Matchmaking Engine](EPIC-06-tasks.md)
- [Trust & Reputation System](EPIC-07-tasks.md)
- [Ranking Engine](EPIC-08-tasks.md)
- [Frontend Foundation](EPIC-09-tasks.md)
- [Search UI](EPIC-10-tasks.md)
- [Job Results Experience](EPIC-11-tasks.md)
- [Performance Optimization](EPIC-12-tasks.md)
- [Security & Stability](EPIC-13-tasks.md)
- [Observability & Monitoring](EPIC-14-tasks.md)
- [Deployment & DevOps](EPIC-15-tasks.md)
- [Provider Acquisition](EPIC-16-tasks.md)
