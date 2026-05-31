# 06-backend-architecture.md

# Backend Architecture

---

# Stack

- Node.js
- Fastify
- TypeScript
- Axios (HTTP client)
- Cheerio (HTML parsing)

---

# Structure

```txt
backend/src/
├── modules/
├── shared/
├── config/
└── cache/
```

---

# Module Pattern

```txt
module/
├── controllers/
├── services/
├── domain/
├── dto/
├── types/
└── utils/
```

---

# Responsibilities

The backend is responsible for:

- aggregation;
- provider orchestration;
- matchmaking;
- ranking;
- trust evaluation;
- normalization.

---

# Controller Rules

Controllers MUST:
- validate requests;
- serialize responses;
- call services.

Controllers MUST NOT:
- contain business logic;
- contain ranking logic;
- contain scraping logic.

---

# Service Rules

Services orchestrate:
- provider execution;
- ranking;
- matchmaking;
- aggregation flows.

Services must not contain scraping or controller logic.

---

# Related Documents

- [07-api-architecture.md](./07-api-architecture.md)
- [08-provider-architecture.md](./08-provider-architecture.md)
- [09-scraping-architecture.md](./09-scraping-architecture.md)
