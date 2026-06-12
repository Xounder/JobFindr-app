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
Triggered when the user makes a **specific and direct** request like "create tests", "add an endpoint", "fix bug in component X", etc. In this mode, skip PM and Tech Lead and route directly to implementation agents. See the [Direct flow](#direct-flow-direct-task-mode) section below for the full routing specification.

## Pipeline initialization (Full Pipeline Mode)

**Before any phase**, the orchestrator MUST check for existing context:

1. Use `glob(".opencode/plan/active.txt")` to check if an active context exists
2. If `active.txt` exists, read it with `read()` to get the active context folder
3. Check for analysis files in the context folder root: `glob(".opencode/plan/<folder>/*.md")` (e.g., feasibility.md, impact-analysis.md, risks.md, recommendations.md, index.md)
4. Check if epics already exist with `glob(".opencode/plan/<folder>/epics/**/*")`
5. If analysis files exist in folder root OR epics exist → skip PM, go directly to Tech Lead (Phase 2) to create tasks from epics/analysis
6. If no `active.txt` → start normally with PM (Phase 1)

**Create `pipeline.yaml`** at the project root with the initial state:

**Also create/read `.opencode/plan/active.txt`** to track the active planning context folder:
- If starting fresh: Product Manager creates `.opencode/plan/<context>/` folder, then orchestrator writes `active.txt`
- If resuming: read `active.txt` to get the active context folder
- Format: `{active: [<context-folder-name>], date: <ISO-8601-date>}`
- **Removed at pipeline conclusion** (Phase 6)

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
      problems: []
    tech-lead:
      status: pending
      notes: null
      updated_at: null
      problems: []
    senior-frontend:
      status: pending
      notes: null
      updated_at: null
      problems: []
    senior-backend:
      status: pending
      notes: null
      updated_at: null
      problems: []
    qa-frontend:
      status: pending
      notes: null
      updated_at: null
      problems: []
    qa-backend:
      status: pending
      notes: null
      updated_at: null
      problems: []
```

At each completed step, UPDATE `pipeline.yaml`:
- Mark the current step as `completed` with descriptive `notes`
- Advance `current_step` to the next step
- Update `updated_at`

## Full flow (Full Pipeline Mode)

### Phase 1: Product Manager (conditional)
**Pre-check:** Before entering Phase 1, the orchestrator MUST check if `active.txt` exists via `glob(".opencode/plan/active.txt")`:
- If `active.txt` exists **and** (analysis files exist in `.opencode/plan/<folder>/` root like feasibility.md, impact-analysis.md, risks.md, recommendations.md **OR** epics exist in `.opencode/plan/<folder>/epics/`) → **skip PM entirely**. Set `steps.product-manager.status: "skipped"`, advance `current_step` to `tech-lead`, and proceed to Phase 2.
- If no `active.txt` → proceed with PM normally.

Only if PM is needed:
 1. Trigger **Product Manager Agent** via Task tool (`subagent_type: "Product Manager"`)
 2. Update `pipeline.yaml`: `current_step: "product-manager"`, `steps.product-manager.status: "in_progress"`
 3. **IMPORTANT**: Do NOT instruct the PM to ask questions in your prompt. The PM agent checks existing docs automatically:
    - If `.opencode/plan/active.txt` exists: read it to get the active context folder, then read existing epics from `.opencode/plan/<active-folder>/epics/` — **skip questions entirely**
    - If no `active.txt`: PM creates new context folder and asks clarifying questions
    - Telling it to ask questions overrides this logic.
 4. PM creates folder `.opencode/plan/<context>/epics/` with `index.md` + one `.md` per epic
 5. **Update `pipeline.yaml`**: `steps.product-manager.status: "completed"`, `current_step: "tech-lead"`
 6. **Write `.opencode/plan/active.txt`** with the context folder name created by PM:  `{active: [<context-folder-name>], date: <ISO-8601-date>}`

### Phase 2: Tech Lead
 1. Trigger **Tech Lead Agent** via Task tool (`subagent_type: "Tech Lead"`)
 2. Update `pipeline.yaml`: `steps.tech-lead.status: "in_progress"`
 3. TL reads epics from `.opencode/plan/<context>/epics/` folder and creates tasks in `.opencode/plan/<context>/tasks/` with one `.md` per task + `index.md`
 4. **REQUIRED**: All task files MUST follow `TASK-NN-<context-task>` naming convention (e.g., `TASK-01-<context-task>.md`, `TASK-02-<context-task>.md`, etc.)
 5. TL allocates tasks to frontend and/or backend
 6. **Update `pipeline.yaml`**: `steps.tech-lead.status: "completed"`, `current_step: "development"`

### Phase 3: Development (parallel)
1. Update `pipeline.yaml`: `steps.senior-frontend.status: "in_progress"`, `steps.senior-backend.status: "in_progress"`
2. Trigger **Senior Frontend Agent** via Task tool (`subagent_type: "Senior Frontend"`)
3. Trigger **Senior Backend Agent** via Task tool (`subagent_type: "Senior Backend"`)
4. **Both execute in parallel** — use the Task tool to trigger simultaneously
5. **IMPORTANT**: The orchestrator prompt for Senior Frontend MUST explicitly include the full validation sequence: lint, build, start app (backend or frontend), stop app. Do NOT rely on the agent reading its own definition file.
6. When each concludes: update `pipeline.yaml` with `steps.senior-frontend.status: "completed"` and/or `steps.senior-backend.status: "completed"`
7. When both complete: `current_step: "qa"`

### Phase 4: QA Review (parallel)
1. Update `pipeline.yaml`: `steps.qa-frontend.status: "in_progress"`, `steps.qa-backend.status: "in_progress"`
2. Trigger **QA Reviewer Agent** via Task tool (`subagent_type: "QA Reviewer"`) — **one instance for frontend, another for backend**
3. Instantiate **two separate reviews**: one for frontend, another for backend
4. **Both execute in parallel**
5. **IMPORTANT**: The orchestrator prompt for QA Frontend MUST explicitly include: review code, run lint + build + tests, start app (backend or frontend), stop app. Do NOT rely on the agent reading its own definition file.
6. When each QA concludes: update `pipeline.yaml`

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
  4. Commit changes with a descriptive commit message following project conventions (use `git commit -m "type(scope): description"`)
  5. Report to the user
  6. **Remove `.opencode/plan/active.txt`** — the active context file is only needed during pipeline execution
  7. Load skills in sequence: `learning-improvement` → `continuous-learning` → `session-save`
  8. Update `AGENTS.md` if necessary (tests, commands, scripts)

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
- **Only the orchestrator updates `pipeline.yaml`**: Agents (PM, TL, Senior, QA) MUST NOT update `pipeline.yaml` directly. They return structured summaries to the orchestrator, who is the sole owner of `pipeline.yaml`. The orchestrator sets all status fields, notes, problems, and `current_step`.
- **All tasks must be completed**: The orchestrator MUST auto-continue phases until ALL tasks in the plan are implemented, validated, and QA-approved. For example, after Phase 1 (TASK-001, TASK-004, TASK-005) passes QA, the orchestrator must immediately proceed to Phase 2 (TASK-002, TASK-003, TASK-006) without waiting for user input. Only run the STOP hook after ALL tasks are done.
- **App cleanup**: After agents finish validation (HTTP tests, etc.), they MUST terminate any running processes started during their execution. Do not leave the app running.
- **Error reporting**: All agents MUST return a structured summary (non-empty) of what was implemented, validation results, and any errors encountered. This includes tool failures, process spawn issues, port conflicts, build problems, and empty/missing agent results. Errors must be reported back to the orchestrator in the final return message.
- **Problems tracking**: Agents MUST include any non-code errors (test failures, process spawn issues, port conflicts, build problems) in their return summary. The orchestrator will populate the `problems` array in `pipeline.yaml`.
- **YAML validation**: The orchestrator MUST validate the YAML has correct indentation (no misaligned keys) after each update to `pipeline.yaml`.
- **Active context propagation**: The orchestrator MUST read `.opencode/plan/active.txt` at startup (both Full Pipeline and Direct Task Mode) and pass the `active` folder path to ALL subagents via the Task tool prompt. Subagents (Tech Lead, Senior Frontend, Senior Backend, QA Reviewer) MUST read their working context from `.opencode/plan/<active-folder>/` — do NOT hardcode or guess the folder name.
