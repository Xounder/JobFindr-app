# 07-api-architecture.md

# API Architecture

---

# Style

- REST-first
- Stateless
- JSON responses

---

# Main Endpoint

```http
GET /jobs/search
```

---

# Query Example

```txt
/jobs/search
?q=backend
&skills=java,docker
&page=1
```

---

# Pagination

- Maximum 20 jobs per page
- Offset pagination for MVP

---

# Error Shape

```json
{
  "error": {
    "code": "PROVIDER_TIMEOUT",
    "message": "Provider timeout"
  }
}
```

---

# Error Handling Rules

Never expose:
- stack traces;
- internal implementation details.

Always return structured errors with:
- error code;
- user-safe message.

---

# Related Documents

- [06-backend-architecture.md](./06-backend-architecture.md)
- [14-caching-architecture.md](./14-caching-architecture.md)
