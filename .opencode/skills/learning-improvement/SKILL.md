---
name: learning-improvement
description: >
  Analyzes the session that just occurred and extracts learnings: what was done, what went right, what went wrong, what can be improved. Generates the evaluation for the following skills (continuous-learning and session-save).
---

# Learning Improvement Skill

## When to use

Use this skill at the end of a complete implementation (e.g.: Frontend → QA → STOP). It is the **first** of 3 skills called in sequence in the STOP hook:

1. **learning-improvement** — evaluates the session (this skill)
2. **continuous-learning** — proposes doc updates with user approval
3. **session-save** — persists the session file

## Workflow

1. Review the current session history (tool calls, errors, results)
2. Extract the following topics:
   - **DONE**: What was accomplished in the session
   - **WRONG**: What went wrong (bugs, bad decisions, rework)
   - **IMPROV**: Improvements to apply in future sessions
   - **LEARN**: Discoveries and lessons learned
   - **NEXT**: Suggested next steps

3. **Do not save file** — only produce the evaluation in memory to pass forward

## Expected output

- Text evaluation with DONE, WRONG, IMPROV, LEARN, NEXT (5-7 lines, English)
- Pass this evaluation to the `continuous-learning` skill as input
