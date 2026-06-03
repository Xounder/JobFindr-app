---
name: continuous-learning
description: >
  Receives the evaluation from the learning-improvement skill, analyzes which .opencode/ docs can be improved based on learnings, creates a change plan and presents it to the user for approval before applying.
---

# Continuous Learning Skill

## When to use

Use this skill after `learning-improvement` in the STOP hook. It is the **second** of 3 skills called in sequence:

1. **learning-improvement** — evaluates the session
2. **continuous-learning** — proposes doc updates (this skill)
3. **session-save** — persists the session file

## Workflow

1. **Receive evaluation** — read the output of the `learning-improvement` skill (DONE, WRONG, IMPROV, LEARN, NEXT)
2. **Analyze existing docs** — consult `.opencode/docs-catalog.md` to map which file to modify, then review the relevant files:
   - `project-structure.md` — keep updated if important folders/files changed
   - `docs-catalog.md` — keep updated if new `.md` files were created in `.opencode/`; **remove completely** the entries for files that no longer exist in the project tree (do not leave strikethrough markdown)
   - `AGENTS.md` — commands, scripts, conventions
   - `INDEX.md` — central guide, references
   - `skills/**/SKILL.md` — skills that need adjustment
   - `commands/*.md` — chat commands
   - `architecture/*.md` — architecture docs
   - `plan/*.md` — tasks and epics
3. **Create change plan** — list files and proposed changes, with justification based on session learnings
4. **Present plan to the user** — display clearly in chat:
   ```
   ## Doc update plan
   
   Based on the session evaluation, I propose:
   
   1. `path/file.md` — what to change and why
   2. `path/other.md` — what to change and why
   
   Would you like to apply these changes? (yes / adjustments)
   ```
5. **Wait for user response**:
   - If **yes**: apply all changes
   - If **adjustments**: user informs what to adjust, apply as requested
6. **Chain to `session-save` IMMEDIATELY** — after applying changes (or determining no changes are needed), you MUST load the `session-save` skill without waiting for user input. Never stop after step 5.

## Rules

- Never modify application source code (only docs in `.opencode/`)
- Always justify each proposed change based on the session evaluation
- If no changes are needed, inform the user and proceed
- After applying changes, **do not save session** — this is the responsibility of the `session-save` skill
