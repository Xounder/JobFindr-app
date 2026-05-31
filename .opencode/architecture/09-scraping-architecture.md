# 09-scraping-architecture.md

# Scraping Architecture

---

# Strategies

| Scenario | Strategy |
|---|---|
| Static pages | Axios + Cheerio |
| JS-heavy pages | Playwright |
| Public APIs | Axios |

---

# Safety Mechanisms

- request throttling;
- retries;
- timeout control;
- user-agent rotation.

---

# Goals

- resiliency;
- low blocking risk;
- provider independence.

---

# Related Documents

- [08-provider-architecture.md](./08-provider-architecture.md)
- [16-performance-architecture.md](./16-performance-architecture.md)
- [15-security-architecture.md](./15-security-architecture.md)