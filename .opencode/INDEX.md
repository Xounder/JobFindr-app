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

1. `architecture/01-system-overview.md` — System overview
2. `architecture/02-architecture-principles.md` — Architecture principles + engineering philosophy
3. `architecture/03-monorepo-structure.md` — Monorepo structure

Then continue depending on the task — see the architecture files in `.opencode/architecture/` for the complete doc index.

---

# Key Constraints

- **Stateless**: no user accounts, resumes, personal data, or search history
- **Provider isolation**: each provider must fail independently; one failure never crashes the pipeline
- **Deterministic scoring**: ranking, matchmaking, and trust must be explainable (no opaque AI)
- **Frontend has zero business logic** — no ranking, trust, or matchmaking in the browser
- **State management**: local state → Zustand → TanStack Query
- **API**: `GET /jobs/search`, offset pagination (max 20), structured error responses

---

# Project Overview

See [01-system-overview.md](./architecture/01-system-overview.md) for the full system description, goals, and architecture diagram.

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
- [Codebase Analysis skill](./skills/codebase-analysis/SKILL.md) — standalone structural scanner for source code (`--mode implementation`) and `.opencode/` documentation (`--mode docs`); load on-demand when agents need a full map of the codebase