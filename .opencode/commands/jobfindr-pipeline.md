---
description: Main orchestrator — executes the full pipeline (PM → Tech Lead → Dev → QA) or direct route (Dev → QA) as requested
---

Load the `jobfindr-pipeline` skill and execute the pipeline.

**Two modes:**
- **Full Pipeline**: `/start` — PM → Tech Lead → Frontend+Backend → QA → corrections → conclusion. Use when the user says 'start the pipeline', 'begin development'.
- **Direct Task Mode**: When the user gives a specific task, route directly to the implementation agent (Senior Frontend or Senior Backend) → QA → STOP. No PM/TL ceremony.

> **Full specification**: See `.opencode/skills/jobfindr-pipeline/SKILL.md` for complete pipeline logic, YAML structure, and orchestrator rules.
