# Commit Message Convention

## Format

```
type(scope): description
```

## Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Formatting, missing semicolons, etc. (no code change) |
| `refactor` | Code restructuring (no behavior change) |
| `test` | Adding or modifying tests |
| `chore` | Maintenance tasks (build, deps, tools) |

## Scopes

| Scope | Description |
|-------|-------------|
| `backend` | Backend changes (Fastify, providers, matchmaking, trust, ranking) |
| `frontend` | Frontend changes (React, components, hooks, state) |
| `pipeline` | Pipeline, agents, skills, orchestration |
| `docs` | Documentation in `.opencode/` |
| `config` | Configuration files (tsconfig, vite, pnpm, docker) |
| `types` | Shared types package (`@jobfindr/types`) |
| `utils` | Shared utils package (`@jobfindr/utils`) |

## Rules

- **Always use lowercase** for type and scope
- **Scope is optional** but recommended for clarity
- **Description**: imperative mood, concise, no trailing period
- **Max 72 chars** for the first line
- **Body** (optional): explain *what* and *why*, not *how*

## Examples

```
feat(backend): implement job matching algorithm fixes
fix(frontend): resolve skill move bug in autocomplete
docs(pipeline): update agent rules for pipeline.yaml ownership
refactor(types): normalize NormalizedJob DTO structure
test(backend): add seniority penalty test cases
chore(config): update pnpm to v11
```

## Enforcement

- Referenced in `AGENTS.md` under "Commit Message Conventions"
- Used by all agents when creating commits
- CI/CD (when added) should validate format