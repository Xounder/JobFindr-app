# JobFindr

**Job Search Aggregator** — Aggregates job opportunities from multiple platforms (LinkedIn, Gupy, Greenhouse, Workday) into a single intelligent search experience.

## Features

- **Multi-Provider Aggregation** — Simultaneous search across multiple job providers with fault isolation
- **Intelligent Matchmaking** — Ranking based on skill matching with explainable scoring
- **Trust Engine** — Company filtering by trust score (default threshold 6.5/10)
- **Deterministic Ranking** — Scoring based on recency, company size and salary
- **Partial Streaming** — Partial results while slow providers finish
- **In-Memory Cache** — Smart TTLs (jobs: 5min, trust: 24h, metadata: 1h)
- **Stateless Backend** — No user accounts, resumes or personal data storage
- **React Frontend** — Modern interface with search, filters and lazy loading

## Stack

| Layer | Technology |
|--------|-----------|
| **Monorepo** | pnpm workspaces |
| **Frontend** | React 19, Vite 6, Tailwind CSS 4, Zustand, TanStack Query, React Router 7 |
| **Backend** | Node.js 22, Fastify 5, TypeScript 6, Axios, Cheerio, Playwright, Zod |
| **Shared** | `@jobfindr/types`, `@jobfindr/utils` |
| **Infra** | Docker, Railway / Render |

## Architecture

```
JobFindr/
├── apps/
│   ├── frontend/          # React SPA (Vite + Tailwind + Zustand + TanStack Query)
│   │   └── src/
│   │       ├── components/  # JobCard, SearchBar, FiltersPanel, TrustIndicator, etc.
│   │       ├── pages/       # HomePage
│   │       ├── hooks/       # useJobSearch, useDebounce
│   │       ├── services/    # api.ts
│   │       ├── store/       # searchStore (Zustand)
│   │       └── utils/       # formatDate, truncate, trustLabel, buildQueryString
│   └── backend/           # Fastify API server
│       └── src/
│           ├── modules/
│           │   ├── search/      # Controller, Service, DTO, Validation
│           │   ├── providers/   # LinkedIn, Gupy, Greenhouse, Workday
│           │   ├── scraping/    # HTTP, Playwright, Parsing
│           │   ├── normalization/
│           │   ├── matchmaking/ # Skill-based matching
│           │   ├── ranking/     # Deterministic scoring
│           │   └── trust/       # Company trust signals
│           ├── cache/           # In-memory cache layer
│           ├── config/          # Environment config (Zod)
│           ├── middleware/      # Rate-limit, security, error handler
│           └── shared/          # Logger, Metrics, Streaming
├── packages/
│   ├── types/             # @jobfindr/types (NormalizedJob, SearchParams, DTOs)
│   └── utils/             # @jobfindr/utils (createJobId, sleep, clamp, etc.)
└── docker-compose.yml
```

## Requirements

- **Node.js** ^22
- **pnpm** ^11.1.3

## Installation

```bash
pnpm install
```

## Development

### Frontend
```bash
pnpm --filter frontend dev
```
Starts at `http://localhost:5173`.

### Backend
```bash
pnpm --filter backend dev
```
Starts at `http://localhost:3001`.

### Docker (backend)
```bash
docker compose up
```

## Scripts

### Frontend
| Command | Description |
|---------|-------------|
| `pnpm --filter frontend dev` | Dev server (Vite) |
| `pnpm --filter frontend build` | TypeScript check + build |
| `pnpm --filter frontend lint` | ESLint |
| `pnpm --filter frontend preview` | Preview build |

### Backend
| Command | Description |
|---------|-------------|
| `pnpm --filter backend dev` | Dev server (tsx watch) |
| `pnpm --filter backend build` | TypeScript build |
| `pnpm --filter backend start` | Production (`node dist/index.js`) |
| `pnpm --filter backend clean` | Remove `dist/` |

### Packages
| Command | Description |
|---------|-------------|
| `pnpm --filter @jobfindr/types build` | Build types package |
| `pnpm --filter @jobfindr/utils build` | Build utils package |

## API

### `GET /api/v1/jobs/search`

Query parameters:

| Parameter | Type | Description |
|-----------|------|-----------|
| `query` | `string` | Search term |
| `location` | `string` | Location |
| `skills` | `string[]` | Skills for matchmaking |
| `providers` | `string[]` | Providers (linkedin, gupy, greenhouse, workday) |
| `minTrust` | `number` | Minimum trust score (0–10) |
| `minSalary` | `number` | Minimum salary |
| `remote` | `boolean` | Remote only |
| `offset` | `number` | Pagination (max 20 per page) |

## License

ISC
