# Hooks

Validation utilities for opencode.

| Script | Purpose | How to invoke |
|--------|---------|---------------|
| `validate-after-agent.ps1` | Runs lint + TypeScript checks after agent implementation; returns errors for correction loop | `validate:frontend`, `validate:backend`, or `validate:both` commands |
| `/learning-improvement` (command) | Loads learning-improvement skill to analyze current session | `/learning-improvement` chat command |

## STOP Hook Flow

At the end of complete implementations (e.g.: Frontend → QA → STOP), load in sequence:

1. **`learning-improvement`** — evaluates the session (DONE, WRONG, IMPROV, LEARN, NEXT)
2. **`continuous-learning`** — proposes doc updates, shows plan for user approval, applies
3. **`session-save`** — persists the session file in `.opencode/sessions/`

These skills are in `.opencode/skills/learning-improvement/`, `.opencode/skills/continuous-learning/`, `.opencode/skills/session-save/`.

## Session Load

The last session context is loaded automatically via the `session-load` skill, which should be executed in the startup ritual (see `AGENTS.md`).
