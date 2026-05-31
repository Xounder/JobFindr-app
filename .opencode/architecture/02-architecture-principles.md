# 02-architecture-principles.md

# Architecture Principles

---

# Stateless First

The system MUST NOT:
- store resumes;
- store user accounts;
- store searches.

Only temporary cache is allowed.

---

# Provider Isolation

Providers must:
- run independently;
- fail independently;
- never break the aggregation pipeline.

See:
- [08-provider-architecture.md](./08-provider-architecture.md)

---

# Modularity

All major systems must remain isolated:
- ranking;
- matchmaking;
- trust;
- scraping;
- normalization.

---

# Performance First

Prioritize:
- low latency;
- parallelism;
- lightweight responses.

See:
- [16-performance-architecture.md](./16-performance-architecture.md)

---

# Explainability

The system must prioritize explainable behavior:
- explainable ranking;
- explainable matchmaking;
- deterministic scoring.

Opaque AI scoring must be avoided in the MVP.

---

# Engineering Philosophy

Prioritize:
- simplicity;
- modularity;
- explicitness;
- isolation;
- scalability;
- readability.

Avoid:
- overengineering;
- unnecessary abstractions;
- premature optimization;
- hidden business logic.

---

# Scalability

The MVP must support future migration toward:
- Redis;
- PostgreSQL;
- ElasticSearch;
- AI embeddings.

See:
- [20-scalability-roadmap.md](./20-scalability-roadmap.md)