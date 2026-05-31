# 04-frontend-architecture.md

# Frontend Architecture

---

# Stack

- React
- TypeScript
- Vite
- TailwindCSS
- Zustand
- TanStack Query

---

# Structure

```txt
frontend/src/
├── pages/
├── components/
├── hooks/
├── services/
├── store/
└── utils/
````

---

# Responsibilities

The frontend is responsible for:

* rendering;
* search UX;
* filters;
* pagination;
* loading states.

The frontend MUST NOT:

* implement ranking;
* implement matchmaking;
* implement business logic.

---

# Related Documents

* [05-frontend-guidelines.md](./05-frontend-guidelines.md)
* [07-api-architecture.md](./07-api-architecture.md)
