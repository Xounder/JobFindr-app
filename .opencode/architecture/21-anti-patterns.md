# 21-anti-patterns.md

# Anti-Patterns

---

# Forbidden Patterns

- giant services;
- provider coupling;
- business logic in controllers;
- shared mutable state;
- frontend ranking logic;
- user data retention.
- tests that duplicate implementation logic instead of testing the real code (tests pass even when the real implementation is broken).

---

# Why

These patterns:
- reduce maintainability;
- increase coupling;
- reduce scalability;
- increase technical debt.

---

# Related Documents

- [19-engineering-guidelines.md](./19-engineering-guidelines.md)