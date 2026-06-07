# 14-caching-architecture.md

# Caching Architecture

---

# Cache Strategy

Use:
- in-memory cache.

Future:
- Redis.

---

# Cache Targets

| Data | TTL |
|---|---|
| Jobs | 5 min |
| Trust scores | 24h |
| Metadata | 1h |

---

# Related Documents

- [16-performance-architecture.md](./16-performance-architecture.md)