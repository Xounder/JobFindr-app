# Codebase Analysis — Documentation

Generated: 2026-06-06T06:49:27.350Z

```

╔══════════════════════════════════════════╗
║     Codebase — Documentation Report      ║
╚══════════════════════════════════════════╝

Generated: 2026-06-06T06:49:27.350Z

── Overview ──
  Total files:       56
  Markdown (.md):    51
  JSON:              4
  YAML:              1
  Text (.txt):       0
  Total headings:    388
  Total code blocks: 30
  Total list items:  908

── Code Block Languages ──
  ts                   12
  txt                  6
  (none)               6
  css                  3
  http                 2
  json                 1

── Duplicate Headings (27) ──
  "role" — 6x
  "workflow" — 11x
  "constraints" — 3x
  "related documents" — 25x
  "before you start" — 5x
  "output structure example" — 2x
  "when finished" — 3x
  "output" — 3x
  "responsibilities" — 7x
  "implementation rules" — 2x
  "rules" — 8x
  "purpose" — 3x
  "provider isolation" — 2x
  "frontend" — 2x
  "backend" — 2x
  ... and 12 more

── All Headings (299) ──
  planning analyst agent                        .opencode/agents/00-planning-agent.md
  role                                          .opencode/agents/00-planning-agent.md
  when to invoke                                .opencode/agents/00-planning-agent.md
  workflow                                      .opencode/agents/00-planning-agent.md
  phase 1: understand the request               .opencode/agents/00-planning-agent.md
  phase 2: explore the codebase                 .opencode/agents/00-planning-agent.md
  phase 3: analyze                              .opencode/agents/00-planning-agent.md
  phase 4: discuss approaches with user (mandatory before feasibility.md) .opencode/agents/00-planning-agent.md
  phase 4b: present plan structure before creating files .opencode/agents/00-planning-agent.md
  phase 5: generate planning documents — always write files .opencode/agents/00-planning-agent.md
  index.md format                               .opencode/agents/00-planning-agent.md
  <plan title>                                  .opencode/agents/00-planning-agent.md
  objective                                     .opencode/agents/00-planning-agent.md
  scope                                         .opencode/agents/00-planning-agent.md
  summary of findings                           .opencode/agents/00-planning-agent.md
  documents                                     .opencode/agents/00-planning-agent.md
  feasibility.md format                         .opencode/agents/00-planning-agent.md
  feasibility — <topic>                         .opencode/agents/00-planning-agent.md
  approaches                                    .opencode/agents/00-planning-agent.md
  approach a: <name>                            .opencode/agents/00-planning-agent.md
  approach b: <name>                            .opencode/agents/00-planning-agent.md
  recommendation                                .opencode/agents/00-planning-agent.md
  impact-analysis.md format                     .opencode/agents/00-planning-agent.md
  impact analysis — <topic>                     .opencode/agents/00-planning-agent.md
  layer impact matrix                           .opencode/agents/00-planning-agent.md
  breaking changes                              .opencode/agents/00-planning-agent.md
  performance impact                            .opencode/agents/00-planning-agent.md
  risks.md format                               .opencode/agents/00-planning-agent.md
  risks — <topic>                               .opencode/agents/00-planning-agent.md
  regression points                             .opencode/agents/00-planning-agent.md
  ... and 269 more

── Files Scanned ──
  .opencode/INDEX.md  [13 headings, 0 code blocks]
  .opencode/OPENCODE_PLUGINS.md  [21 headings, 10 code blocks]
  .opencode/agents/00-planning-agent.md  [37 headings, 0 code blocks]
  .opencode/agents/01-product-manager.md  [13 headings, 0 code blocks]
  .opencode/agents/02-tech-lead.md  [15 headings, 0 code blocks]
  .opencode/agents/03-senior-frontend.md  [9 headings, 0 code blocks]
  .opencode/agents/04-senior-backend.md  [7 headings, 0 code blocks]
  .opencode/agents/05-qa-reviewer.md  [12 headings, 0 code blocks]
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
  .opencode/architecture/19-engineering-guidelines.md  [8 headings, 0 code blocks]
  .opencode/architecture/20-scalability-roadmap.md  [6 headings, 0 code blocks]
  .opencode/architecture/21-anti-patterns.md  [5 headings, 0 code blocks]
  .opencode/architecture/22-testing-philosophy.md  [5 headings, 0 code blocks]
  .opencode/architecture/architecture.md  [8 headings, 0 code blocks]
  .opencode/architecture/commit-pattern.md  [6 headings, 2 code blocks]
  .opencode/commands/doc-audit.md  [5 headings, 0 code blocks]
  .opencode/commands/jobfindr-pipeline.md  [0 headings, 0 code blocks]
  .opencode/commands/product-manager.md  [0 headings, 0 code blocks]
  .opencode/commands/qa-reviewer.md  [0 headings, 0 code blocks]
  .opencode/commands/senior-backend.md  [0 headings, 0 code blocks]
  .opencode/commands/senior-frontend.md  [0 headings, 0 code blocks]
  .opencode/commands/tech-lead.md  [0 headings, 0 code blocks]
  .opencode/docs-catalog.md  [7 headings, 0 code blocks]
  .opencode/package-lock.json  [keys: name, lockfileVersion, requires, packages]
  .opencode/package.json  [keys: dependencies]
  .opencode/pipeline.yaml  [keys: pipeline, epics, tasks, steps, current_step]
  .opencode/project-structure.md  [1 headings, 0 code blocks]
  .opencode/skills/06-branding/SKILL.md  [12 headings, 3 code blocks]
  .opencode/skills/codebase-analysis/SKILL.md  [13 headings, 0 code blocks]
  .opencode/skills/codebase-analysis/output/docs-report.json  [keys: generatedAt, mode, summary, files, errors, headingIndex, codeBlockLanguages]
  .opencode/skills/codebase-analysis/output/docs-report.md  [1 headings, 1 code blocks]
  .opencode/skills/codebase-analysis/scripts/package.json  [keys: name, type, private, dependencies]
  .opencode/skills/continuous-learning/SKILL.md  [4 headings, 0 code blocks]
  .opencode/skills/doc-audit/SKILL.md  [11 headings, 0 code blocks]
  .opencode/skills/jobfindr-pipeline-next/SKILL.md  [10 headings, 0 code blocks]
  .opencode/skills/jobfindr-pipeline/SKILL.md  [15 headings, 0 code blocks]
  .opencode/skills/learning-improvement/SKILL.md  [5 headings, 0 code blocks]
  .opencode/skills/session-load/SKILL.md  [5 headings, 1 code blocks]
  .opencode/skills/session-save/SKILL.md  [6 headings, 1 code blocks]

```
