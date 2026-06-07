# 05-frontend-guidelines.md

# Frontend Guidelines

---

# UI Principles

The UI must be:
- minimal;
- fast;
- information-first;
- responsive.

---

# State Management

## Local State
Use:
- useState
- useReducer

---

## Global State
Use:
- Zustand

Avoid Redux — Zustand is sufficient.

---

# Server State

Use:
- TanStack Query

---

# Component Rules

Components must:
- remain small;
- remain reusable;
- avoid business logic.

---

# Performance

See:
- [16-performance-architecture.md](./16-performance-architecture.md)