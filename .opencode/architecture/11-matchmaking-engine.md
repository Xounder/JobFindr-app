# 11-matchmaking-engine.md

# Matchmaking Engine

---

# Responsibilities

- extract skills;
- compare similarities;
- generate scores;
- explain matches.

---

# Pipeline

```txt
User Input
    ↓
Skill Extraction
    ↓
Normalization
    ↓
Similarity Analysis
    ↓
Match Score
````

---

# Priorities

Focus on:
- skill overlap;
- semantic similarity;
- seniority compatibility;
- keyword relevance.

---

# Avoid

Avoid:
- opaque AI scoring;
- non-deterministic ranking;
- black-box embeddings in MVP.

---

# Goals

* explainability;
* deterministic behavior;
* future AI compatibility.

---

# Related Documents

* [10-normalization-layer.md](./10-normalization-layer.md)
* [13-ranking-engine.md](./13-ranking-engine.md)