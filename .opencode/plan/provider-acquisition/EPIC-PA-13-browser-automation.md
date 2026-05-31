# EPIC-PA-13 — Browser Automation Layer (Deferred)

**Corresponds to:** PROVIDER_ACQUISITION_PLAN Phase 13
**Layer:** Backend
**MVP:** ❌ No (pós-MVP)

## Objective

Support providers inaccessible via APIs or scraping using Playwright
for browser automation.

## Deliverables

- `BrowserProvider` base class
- Playwright integration
- Headless execution with resource limits

## Tasks

- [ ] Create `BrowserProvider` abstract class using Playwright
- [ ] Implement headless browser pool with max instances
- [ ] Create page interaction helpers (wait, scroll, click)
- [ ] Implement resource limits (memory, CPU, time)
- [ ] Handle CAPTCHA detection gracefully
- [ ] Implement browser context isolation per provider

## Acceptance Criteria

- [ ] Browser provider works for at least one dynamic job board
- [ ] Browser pool is properly limited and recycled
- [ ] Timeout kills hung pages
- [ ] Resource usage is bounded

## Constraint

Browser automation is the **last resort**. Priority order:
1. Public API
2. Public JSON endpoint
3. HTML Scraping
4. Browser Automation
