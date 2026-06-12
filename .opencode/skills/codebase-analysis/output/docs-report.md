# Codebase Analysis — Documentation

Generated: 2026-06-12T04:04:55.007Z

```

╔══════════════════════════════════════════╗
║     Codebase — Documentation Report      ║
╚══════════════════════════════════════════╝

Generated: 2026-06-12T04:04:55.007Z

── Overview ──
  Total files:       53
  Markdown (.md):    46
  JSON:              6
  YAML:              1
  Text (.txt):       0
  Total headings:    336
  Total code blocks: 34
  Total list items:  880

── Code Block Languages ──
  ts                   12
  txt                  8
  (none)               6
  json                 3
  css                  3
  http                 2

── Duplicate Headings (24) ──
  "role" — 5x
  "before you start" — 5x
  "workflow" — 9x
  "when finished" — 3x
  "output" — 3x
  "constraints" — 2x
  "related documents" — 23x
  "retry limit (failure escalation)" — 4x
  "responsibilities" — 7x
  "implementation rules" — 2x
  "rules" — 7x
  "purpose" — 3x
  "provider isolation" — 2x
  "frontend" — 2x
  "backend" — 2x
  ... and 9 more

── All Headings (257) ──
  product manager agent                         .opencode/agents/01-product-manager.md
  role                                          .opencode/agents/01-product-manager.md
  before you start                              .opencode/agents/01-product-manager.md
  requirement: collect information first (terminal-choice wizard) .opencode/agents/01-product-manager.md
  wizard rules                                  .opencode/agents/01-product-manager.md
  when receiving an existing plan/document      .opencode/agents/01-product-manager.md
  handling skipped questions                    .opencode/agents/01-product-manager.md
  workflow                                      .opencode/agents/01-product-manager.md
  output structure example                      .opencode/agents/01-product-manager.md
  when finished                                 .opencode/agents/01-product-manager.md
  output                                        .opencode/agents/01-product-manager.md
  constraints                                   .opencode/agents/01-product-manager.md
  related documents                             .opencode/agents/01-product-manager.md
  tech lead agent                               .opencode/agents/02-tech-lead.md
  retry limit (failure escalation)              .opencode/agents/02-tech-lead.md
  task creation example                         .opencode/agents/02-tech-lead.md
  task-nn-<context>: [descriptive task name]    .opencode/agents/02-tech-lead.md
  depends on                                    .opencode/agents/02-tech-lead.md
  description                                   .opencode/agents/02-tech-lead.md
  technical details                             .opencode/agents/02-tech-lead.md
  implementation approach                       .opencode/agents/02-tech-lead.md
  testing                                       .opencode/agents/02-tech-lead.md
  references                                    .opencode/agents/02-tech-lead.md
  senior frontend agent                         .opencode/agents/03-senior-frontend.md
  responsibilities                              .opencode/agents/03-senior-frontend.md
  implementation rules                          .opencode/agents/03-senior-frontend.md
  branding                                      .opencode/agents/03-senior-frontend.md
  corrections cycle (qa)                        .opencode/agents/03-senior-frontend.md
  senior backend agent                          .opencode/agents/04-senior-backend.md
  qa reviewer agent                             .opencode/agents/05-qa-reviewer.md
  ... and 227 more

── Files Scanned ──
  .opencode/INDEX.md  [7 headings, 0 code blocks]
  .opencode/OPENCODE_PLUGINS.md  [21 headings, 10 code blocks]
  .opencode/agents/00-planning-agent.md  [0 headings, 0 code blocks]
  .opencode/agents/01-product-manager.md  [13 headings, 0 code blocks]
  .opencode/agents/02-tech-lead.md  [17 headings, 0 code blocks]
  .opencode/agents/03-senior-frontend.md  [10 headings, 0 code blocks]
  .opencode/agents/04-senior-backend.md  [8 headings, 0 code blocks]
  .opencode/agents/05-qa-reviewer.md  [11 headings, 0 code blocks]
  .opencode/architecture/01-system-overview.md  [7 headings, 0 code blocks]
  .opencode/architecture/02-architecture-principles.md  [9 headings, 0 code blocks]
  .opencode/architecture/03-monorepo-structure.md  [8 headings, 1 code blocks]
  .opencode/architecture/04-frontend-architecture.md  [7 headings, 1 code blocks]
  .opencode/architecture/05-frontend-guidelines.md  [9 headings, 0 code blocks]
  .opencode/architecture/06-backend-architecture.md  [9 headings, 2 code blocks]
  .opencode/architecture/07-api-architecture.md  [9 headings, 3 code blocks]
  .opencode/architecture/08-provider-architecture.md  [10 headings, 2 code blocks]
  .opencode/architecture/09-scraping-architecture.md  [6 headings, 0 code blocks]
  .opencode/architecture/10-normalization-layer.md  [6 headings, 1 code blocks]
  .opencode/architecture/11-matchmaking-engine.md  [8 headings, 1 code blocks]
  .opencode/architecture/12-trust-engine.md  [7 headings, 0 code blocks]
  .opencode/architecture/13-ranking-engine.md  [5 headings, 0 code blocks]
  .opencode/architecture/14-caching-architecture.md  [5 headings, 0 code blocks]
  .opencode/architecture/15-security-architecture.md  [5 headings, 0 code blocks]
  .opencode/architecture/16-performance-architecture.md  [6 headings, 0 code blocks]
  .opencode/architecture/17-observability-architecture.md  [6 headings, 1 code blocks]
  .opencode/architecture/18-deployment-architecture.md  [6 headings, 0 code blocks]
  .opencode/architecture/19-engineering-guidelines.md  [9 headings, 2 code blocks]
  .opencode/architecture/20-scalability-roadmap.md  [6 headings, 0 code blocks]
  .opencode/architecture/22-testing-philosophy.md  [5 headings, 0 code blocks]
  .opencode/architecture/commit-pattern.md  [6 headings, 2 code blocks]
  .opencode/commands/agent-routing.md  [1 headings, 0 code blocks]
  .opencode/commands/doc-audit.md  [5 headings, 0 code blocks]
  .opencode/commands/jobfindr-pipeline.md  [0 headings, 0 code blocks]
  .opencode/docs-catalog.md  [7 headings, 0 code blocks]
  .opencode/package-lock.json  [keys: name, lockfileVersion, requires, packages]
  .opencode/package.json  [keys: dependencies]
  .opencode/pipeline.yaml  [keys: pipeline, epics, tasks, steps, current_step]
  .opencode/project-structure.md  [1 headings, 0 code blocks]
  .opencode/skills/06-branding/SKILL.md  [12 headings, 3 code blocks]
  .opencode/skills/codebase-analysis/SKILL.md  [13 headings, 0 code blocks]
  .opencode/skills/codebase-analysis/output/combined-report.json  [keys: generatedAt, mode, implementation, documentation]
  .opencode/skills/codebase-analysis/output/combined-report.md  [2 headings, 1 code blocks]
  .opencode/skills/codebase-analysis/output/docs-report.json  [keys: generatedAt, mode, summary, files, errors, headingIndex, codeBlockLanguages]
  .opencode/skills/codebase-analysis/output/docs-report.md  [1 headings, 1 code blocks]
  .opencode/skills/codebase-analysis/output/implementation-report.json  [keys: generatedAt, mode, parser, summary, files, errors, dependencyCount, perPackage]
  .opencode/skills/codebase-analysis/output/implementation-report.md  [1 headings, 1 code blocks]
  .opencode/skills/codebase-analysis/scripts/package.json  [keys: name, type, private, dependencies]
  .opencode/skills/continuous-learning/SKILL.md  [4 headings, 0 code blocks]
  .opencode/skills/doc-audit/SKILL.md  [11 headings, 0 code blocks]
  .opencode/skills/jobfindr-pipeline-next/SKILL.md  [10 headings, 0 code blocks]
  .opencode/skills/jobfindr-pipeline/SKILL.md  [15 headings, 0 code blocks]
  .opencode/skills/learning-improvement/SKILL.md  [5 headings, 0 code blocks]
  .opencode/skills/session-save/SKILL.md  [7 headings, 2 code blocks]

```
