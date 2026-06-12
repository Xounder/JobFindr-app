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

# Tailwind 4 Animations

Custom animations (`animate-[name_...]`) require `@keyframes` registered in `index.css`. Tailwind 4 does not auto-create keyframes from arbitrary values — you must define them explicitly.

# Performance

See:
- [16-performance-architecture.md](./16-performance-architecture.md)