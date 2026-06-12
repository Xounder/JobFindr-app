---
description: Agent routing reference — maps each agent to its subagent_type and purpose
---

# Agent Routing

Use the table below to determine which agent to invoke via `Task tool`:

| Agent | `subagent_type` | Purpose |
|-------|----------------|---------|
| Product Manager | `Product Manager` | Requirements → epics in `.opencode/plan/<context>/epics/` |
| Tech Lead | `Tech Lead` | Epics → technical tasks in `.opencode/plan/<context>/tasks/` |
| Senior Frontend | `Senior Frontend` | Implement frontend tasks |
| Senior Backend | `Senior Backend` | Implement backend tasks |
| QA Reviewer | `QA Reviewer` | Review code (specify layer: frontend or backend) |

See `.opencode/skills/jobfindr-pipeline/SKILL.md` for full pipeline orchestration rules.
