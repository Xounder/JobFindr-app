# Monorepo Structure

```txt
root/
├── apps/
│   ├── frontend/
│   └── backend/
│
├── packages/
│   ├── types/
│   ├── utils/
│   └── configs/
│
└── docker/
````

---

# Applications

## frontend

Contains the React SPA.

See:

* [04-frontend-architecture.md](./04-frontend-architecture.md)

---

## backend

Contains the Fastify API.

See:

* [06-backend-architecture.md](./06-backend-architecture.md)

---

# Shared Packages

## types

Shared TypeScript types.

## utils

Reusable utility functions.

## configs

Shared configuration files.