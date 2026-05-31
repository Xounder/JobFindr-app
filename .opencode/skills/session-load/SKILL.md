---
name: session-load
description: >
  Loads the last saved session in .opencode/sessions/ when starting a new chat, restoring the context of DONE, WRONG, IMPROV, LEARN, NEXT from the previous session.
---

# Session Load Skill

## When to use

Use this skill **at the start of every new chat session**, immediately after reading `AGENTS.md`. It must be loaded before any implementation task, as it restores context from the previous session.

## Workflow

1. **List sessions** in `.opencode/sessions/` — find the most recent `.tmp` file (descending alphabetical order = newest first, since the `MM-DD-YY-HH-MM` format is chronological)

2. **Read the file** most recent and display its content to the user as context from the previous session

3. **Ask the user** if they want to continue from where they left off (especially if there were `NEXT` items) or if they want to ignore the history

## Expected output

- Content of the last session displayed to the user
- User's decision on how to proceed (continue or ignore)

## Session file format

```
DONE: What was accomplished
WRONG: What went wrong
IMPROV: Improvements to apply
LEARN: Lessons learned
NEXT: Next steps
```

Files follow the naming pattern: `MM-DD-YY-HH-MM-description-session.tmp`
