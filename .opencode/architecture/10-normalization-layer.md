# 10-normalization-layer.md

# Normalization Layer

---

# Purpose

Convert provider-specific responses into a unified structure.

---

# NormalizedJob

```ts
export type NormalizedJob = {
  id: string
  title: string
  company: string
  description: string
  skills: string[]
  url: string
  source: string
}
````

---

# Responsibilities

* skill extraction;
* salary normalization;
* HTML sanitization;
* seniority parsing.

---

# Related Documents

* [08-provider-architecture.md](./08-provider-architecture.md)
* [11-matchmaking-engine.md](./11-matchmaking-engine.md)
