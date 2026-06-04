---
name: jobfindr-pipeline
description: >
  Main orchestrator of the JobFindr agent pipeline. Manages the full execution: PM → Tech Lead → Frontend + Backend (parallel) → QA (parallel) → corrections loop until approval.
---

# JobFindr Pipeline Skill (Orchestrator)

## When to use

Use this skill to start the development pipeline from scratch. It orchestrates all agents in the correct order, respecting parallelism and quality loops.

## Operation modes

The pipeline operates in **two modes** depending on the type of user request:

### Full Pipeline Mode
Triggered by the `/start` command or when the user says "start the pipeline", "begin development", etc.

Full flow: PM → Tech Lead → Frontend + Backend (parallel) → QA Frontend + QA Backend (parallel) → loop → conclusion

### Direct Task Mode
Triggered when the user makes a **specific and direct** request like "create tests", "add an endpoint", "fix bug in component X", etc. In this mode:

1. **Analyze scope** — determine if the task affects frontend, backend or both
2. **Skip PM and Tech Lead** — the task is already defined by the user
3. **Direct routing** — use Task tool to trigger implementation agent(s):
   - Backend-only task → `Senior Backend` → `QA Backend` → STOP
   - Frontend-only task → `Senior Frontend` → `QA Frontend` → STOP
   - Both tasks → `Senior Frontend` + `Senior Backend` (parallel) → `QA Frontend` + `QA Backend` (parallel) → STOP
4. **QA is MANDATORY** in any mode — never skip
5. **No formal conclusion phase** — just report to the user that it passed QA

## Pipeline initialization (Full Pipeline Mode)

**Before any phase**, create the `pipeline.yaml` file at the project root with the initial state:

```yaml
pipeline:
  name: JobFindr Pipeline
  started_at: "<current-date-time>"
  updated_at: "<current-date-time>"
  current_step: "product-manager"
  steps:
    product-manager:
      status: pending
      notes: null
      updated_at: null
    tech-lead:
      status: pending
      notes: null
      updated_at: null
    senior-frontend:
      status: pending
      notes: null
      updated_at: null
    senior-backend:
      status: pending
      notes: null
      updated_at: null
    qa-frontend:
      status: pending
      notes: null
      updated_at: null
    qa-backend:
      status: pending
      notes: null
      updated_at: null
```

At each completed step, UPDATE `pipeline.yaml`:
- Mark the current step as `completed` with descriptive `notes`
- Advance `current_step` to the next step
- Update `updated_at`

## Full flow (Full Pipeline Mode)

### Phase 1: Product Manager
1. Trigger **Product Manager Agent** via Task tool (`subagent_type: "Product Manager"`)
2. Update `pipeline.yaml`: `current_step: "product-manager"`, `steps.product-manager.status: "in_progress"`
3. **IMPORTANT**: Do NOT instruct the PM to ask questions in your prompt. The PM agent checks existing docs automatically — if `.opencode/plan/<context>/` already exists, it skips questions. Telling it to ask questions overrides this logic.
4. PM creates folder `.opencode/plan/<context>/epics/` with `index.md` + one `.md` per epic
5. **Update `pipeline.yaml`**: `steps.product-manager.status: "completed"`, `current_step: "tech-lead"`

### Phase 2: Tech Lead
1. Trigger **Tech Lead Agent** via Task tool (`subagent_type: "Tech Lead"`)
2. Update `pipeline.yaml`: `steps.tech-lead.status: "in_progress"`
3. TL reads epics from `.opencode/plan/<context>/epics/` folder and creates tasks in `.opencode/plan/<context>/tasks/` with one `.md` per task + `index.md`
4. TL allocates tasks to frontend and/or backend
5. **Update `pipeline.yaml`**: `steps.tech-lead.status: "completed"`, `current_step: "development"`

### Phase 3: Development (parallel)
1. Update `pipeline.yaml`: `steps.senior-frontend.status: "in_progress"`, `steps.senior-backend.status: "in_progress"`
2. Trigger **Senior Frontend Agent** via Task tool (`subagent_type: "Senior Frontend"`)
3. Trigger **Senior Backend Agent** via Task tool (`subagent_type: "Senior Backend"`)
4. **Both execute in parallel** — use the Task tool to trigger simultaneously
5. When each concludes: update `pipeline.yaml` with `steps.senior-frontend.status: "completed"` and/or `steps.senior-backend.status: "completed"`
6. When both complete: `current_step: "qa"`

### Phase 4: QA Review (parallel)
1. Update `pipeline.yaml`: `steps.qa-frontend.status: "in_progress"`, `steps.qa-backend.status: "in_progress"`
2. Trigger **QA Reviewer Agent** via Task tool (`subagent_type: "QA Reviewer"`) — **one instance for frontend, another for backend**
3. Instantiate **two separate reviews**: one for frontend, another for backend
4. **Both execute in parallel**
5. When each QA concludes: update `pipeline.yaml`

### Phase 5: Corrections loop
For each layer (frontend and backend), **independently**:
1. If QA approved → `steps.qa-frontend.status: "completed"` or `steps.qa-backend.status: "completed"`
2. If QA pointed out corrections → reopen `steps.senior-frontend` or `steps.senior-backend` as `in_progress`
3. **Re-invoke the implementation agent via Task tool** (`subagent_type: "Senior Frontend"` or `"Senior Backend"`) with the QA issues as input — do NOT fix code directly in the orchestrator role
4. Agent implements corrections
5. QA revalidates (via Task tool, `subagent_type: "QA Reviewer"`)
6. Repeat until approval

### Phase 6: Conclusion
1. Confirm frontend and backend are approved
2. Update `pipeline.yaml`: `current_step: "completed"`
3. Summarize what was done
4. Report to the user
5. Load skills in sequence: `learning-improvement` → `continuous-learning` → `session-save`
6. Update `AGENTS.md` if necessary (tests, commands, scripts)

## Direct flow (Direct Task Mode)

Execute this flow when the user gives a direct and specific task:

1. **Analyze the request** — identify which layer(s) are affected (frontend, backend, both)
2. **Check if the task is trivial or complex**:
   - Trivial task (e.g.: change button color) → execute directly, skip QA
   - Complex task (e.g.: create tests, new endpoint, new component) → use agents + QA
3. **Routing**:
   ```
   If frontend only:
     Task(Senior Frontend) → Task(QA Frontend) → report
   If backend only:
     Task(Senior Backend) → Task(QA Backend) → report
   If both:
     Task(Senior Frontend) + Task(Senior Backend) [parallel]
       → Task(QA Frontend) + Task(QA Backend) [parallel]
       → report
   ```
4. **Load skills** — use `Task tool` with the appropriate subagent type
5. **QA is mandatory** for complex tasks — never skip
6. **Skip learning-improvement/continuous-learning/session-save** — only complex and complete tasks justify session logging

## Orchestrator rules

- **Product Manager** and **Tech Lead** are SERIAL — only in Full Pipeline Mode
- **Frontend** and **Backend** are PARALLEL — both modes
- **QA Frontend** and **QA Backend** are PARALLEL — both modes
- The corrections loop is ISOLATED per layer — frontend does not wait for backend and vice-versa
- Use the Task tool for parallel subagent execution
- In Full Pipeline Mode: **Always** update `pipeline.yaml` before and after each phase
- **Validate** the YAML after each edit to avoid duplicate keys — prefer replacing entire blocks instead of appending new ones
- In Direct Task Mode: **QA is mandatory** for non-trivial tasks
- **Corrections loop rule**: When QA finds issues, the orchestrator MUST re-invoke the implementation agent via Task tool — NEVER fix code directly. The orchestrator's role is to route work, not to implement.
- **Orchestrator owns `current_step`**: Agents (PM, TL, Senior, QA) must only update their own `status` and `notes` in `pipeline.yaml`. Only the orchestrator sets `current_step` to advance phases. Agents MUST NOT change `current_step`.
