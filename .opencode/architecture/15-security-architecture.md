# 15-security-architecture.md

# Security Architecture

---

# Requirements

The system must:
- sanitize HTML;
- validate query params;
- rate limit requests;
- prevent abuse.

---

# Forbidden Data Retention

Never store:
- resumes;
- personal searches;
- personal identifiers.

---

# Related Documents

- [09-scraping-architecture.md](./09-scraping-architecture.md)