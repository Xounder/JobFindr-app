---
name: session-save
description: >
  Saves the session file in .opencode/sessions/ based on the evaluation from the learning-improvement skill. It is the last skill called in the STOP hook.
---

# Session Save Skill

## When to use

Use this skill at the end of the STOP hook, after `learning-improvement` and `continuous-learning`. It is the **third and last** of 3 skills called in sequence:

1. **learning-improvement** — evaluates the session
2. **continuous-learning** — proposes and applies doc updates (with user approval)
3. **session-save** — persists the session file (this skill)

## Workflow

1. **Receive evaluation** — use the output of the `learning-improvement` skill (evaluation with DONE, WRONG, IMPROV, LEARN, NEXT)
2. **Create file** in `.opencode/sessions/` in the format:
   ```
   MM-DD-YY-HH-MM-description-session.tmp
   ```
   - `MM` — month (2 digits)
   - `DD` — day (2 digits)
   - `YY` — year (2 digits)
   - `HH` — hour (2 digits, 24h)
   - `MM` — minute (2 digits)
   - `description` — brief description of what was done (e.g.: `brand-tests`, `pipeline-mvp`)
3. **Content** — same as the received evaluation, 5-7 lines in English, each section starting with an uppercase label followed by `:`

## Expected output

- File `.opencode/sessions/MM-DD-YY-HH-MM-description-session.tmp` created

## Rules

- Do not modify the received evaluation
- Do not propose changes to docs (this is the responsibility of `continuous-learning`)
- Only save the file and report to the user

## Chain position

This is the **LAST** (3rd) skill in the STOP chain: `learning-improvement` → `continuous-learning` → **`session-save`**. After saving, the chain is complete — report to the user and stop. Do not load any further skills.
