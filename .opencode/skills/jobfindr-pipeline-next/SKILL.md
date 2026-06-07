---
name: jobfindr-pipeline-next
description: >
  Continues the JobFindr pipeline from where it stopped by reading pipeline.yaml. Skips the information gathering phase and resumes from the last incomplete phase.
---

# JobFindr Pipeline Next Skill (Continuation)

## When to use

Use this skill when the pipeline has already been started (pipeline.yaml exists) and you need to continue execution. It **skips the Product Manager phase** and resumes from the step indicated in pipeline.yaml.

It can also be used in **Direct Task Mode**: if there is no pipeline.yaml, use the direct routing rules (see `jobfindr-pipeline` skill).

## How to determine the resumption point

**First, read `.opencode/plan/active.txt`** to get the active planning context folder. The file format: `{active: [<context-folder-name>], date: <ISO-8601-date>}`

Then read the `pipeline.yaml` file at the project root and identify the first step with status `pending`:

1. **`current_step` indicates the current step** — this is your starting point
2. Check the status of each step in `pipeline.steps` and find the first `pending` or `in_progress`

### Step to phase mapping

| current_step / pending step | Phase to execute |
|---|---|
| `tech-lead` | Phase 2 — Tech Lead |
| `development` or `senior-frontend` / `senior-backend` | Phase 3 — Development |
| `qa` or `qa-frontend` / `qa-backend` | Phase 4 — QA Review |
| Corrections loop | Check which step is `in_progress` with pending corrections |
| `completed` | Pipeline already finished — just report |

## Flow (from the resumption point)

### If resuming from Tech Lead
1. Update `pipeline.yaml`: `steps.tech-lead.status: "in_progress"`
2. Trigger **Tech Lead Agent** via Task tool (`subagent_type: "Tech Lead"`)
3. Create folder `.opencode/plan/<task-context>/` with one `.md` per task + `index.md`
4. **Update `pipeline.yaml`**: `steps.tech-lead.status: "completed"`, `current_step: "development"`
5. Proceed to Development (Phase 3)

### If resuming from Development
1. Update `pipeline.yaml`: pending steps as `in_progress`
2. Trigger **Senior Frontend Agent** via Task tool (`subagent_type: "Senior Frontend"`) and/or **Senior Backend Agent** via Task tool (`subagent_type: "Senior Backend"`) (according to unimplemented tasks)
3. Execute in parallel
4. Update `pipeline.yaml` when each concludes
5. Proceed to QA (Phase 4)

### If resuming from QA / Corrections loop
1. Update `pipeline.yaml`: QA steps as `in_progress`
2. Trigger **QA Reviewer Agent** via Task tool (`subagent_type: "QA Reviewer"`) — one instance per layer
3. Review implemented code (frontend and/or backend)
4. If corrections needed → reopen developer step and repeat
5. If approved → mark as `completed`

### If resuming from Conclusion
 1. Just confirm status and report to the user
 2. **Remove `.opencode/plan/active.txt`** — the active context file is only needed during pipeline execution

## Rules

- **Never** redo Product Manager questions
- **Never** recreate artifacts that already exist
- **Always** read `pipeline.yaml` to decide the starting point
- **Always** update `pipeline.yaml` after each step
- Respect parallelism between frontend and backend
- If `pipeline.yaml` does not exist, assume **Direct Task Mode** (see `jobfindr-pipeline` skill)
- **Active context propagation**: The orchestrator MUST read `.opencode/plan/active.txt` at startup and pass the `active` folder path to ALL subagents via the Task tool prompt. Subagents (Tech Lead, Senior Frontend, Senior Backend, QA Reviewer) MUST read their working context from `.opencode/plan/<active-folder>/` — do NOT hardcode or guess the folder name.
