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
* loading states;
* draft/commit search pattern (isDirty flag, committed params on Search button click).

# Search Flow

The search uses a **draft/commit pattern**:

1. **Draft state** (Zustand store) — user changes filters/sort freely, UI updates, `isDirty=true`
2. **Committed params** (useState in HomePage) — frozen snapshot on Search button click
3. **useJobSearch(committedParams)** — fires API call immediately (no debounce), no `placeholderData`
4. **Pagination bypasses** dirty check — page changes trigger search directly
5. **Reset filters** resets both draft + committed and auto-searches
6. **Page load** initializes committed params from persisted store → auto-search
7. **isDirty is NOT persisted** — excluded from Zustand `partialize`

The frontend MUST NOT:

* implement ranking;
* implement matchmaking;
* implement business logic.

---

# Related Documents

* [05-frontend-guidelines.md](./05-frontend-guidelines.md)
* [07-api-architecture.md](./07-api-architecture.md)
