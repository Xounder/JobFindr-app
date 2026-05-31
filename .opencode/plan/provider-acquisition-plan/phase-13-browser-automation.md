# Phase 13 — Browser Automation Layer (Deferred)

## Goal

Support providers inaccessible via APIs or scraping.

---

## Technology

- Playwright

---

## Use Cases

- React-only portals
- Protected pages
- Dynamic rendering

---

## Rules

Browser automation is always the last option.

Priority:

```txt
1. Public API
2. Public JSON Endpoint
3. HTML Scraping
4. Browser Automation
```

---

## Success Criteria

Hard-to-access providers become available without affecting overall system stability.

---

# MVP Scope

Initial providers:

1. Greenhouse
2. Ashby
3. Lever
4. Workday
5. Gupy

These providers cover a large portion of modern technology and corporate hiring while maintaining low operational complexity.

---

# Out of Scope (MVP)

Do not implement initially:

- LinkedIn scraping
- Indeed scraping
- Glassdoor scraping
- User accounts
- Resume uploads
- Automated applications
- AI-generated resumes
- AI interview preparation

These should only be evaluated after provider acquisition becomes stable and reliable.