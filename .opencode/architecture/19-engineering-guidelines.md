# 19-engineering-guidelines.md

# Engineering Guidelines

---

# Code Style

- TypeScript strict mode required;
- avoid any;
- explicit naming preferred.

---

# Naming Conventions

Use explicit naming.

Good:
```txt
ranking-engine.ts
job-provider.ts
trust-score.ts
```

Bad:

```txt
ranking.ts
final-provider.ts
helper.ts
```

---

# TypeScript Rules

Required:
- strict mode enabled;
- avoid any;
- explicit return types preferred.

Prefer:
- readonly where appropriate;
- small interfaces;
- pure functions.

---

# Anti-Patterns / Forbidden Patterns

- giant services;
- provider coupling;
- business logic in controllers;
- shared mutable state;
- frontend ranking logic;
- user data retention.
- tests that duplicate implementation logic instead of testing the real code (tests pass even when the real implementation is broken).

---

# Why These Patterns Are Forbidden

These patterns:
- reduce maintainability;
- increase coupling;
- reduce scalability;
- increase technical debt.

---

# AI Contribution Workflow

Before implementing:
1. Read relevant architecture docs
2. Understand module boundaries
3. Identify affected layers
4. Reuse existing abstractions
5. Keep changes isolated

When generating code:
- prefer explicitness over cleverness
- keep files focused
- avoid speculative abstractions
- maintain architecture consistency

---

# Related Documents

* [22-testing-philosophy.md](./22-testing-philosophy.md)