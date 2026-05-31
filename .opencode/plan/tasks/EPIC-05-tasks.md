# EPIC 05 — Job Normalization

## TASK-034 — Create NormalizedJob Type
**Layer:** Backend (types package)
**Depends on:** TASK-004
### Description
Create standardized job entity.

---

## TASK-035 — Create Skill Extraction Engine
**Layer:** Backend
**Depends on:** TASK-034
### Description
Extract skills from descriptions.

---

## TASK-036 — Create Skill Normalizer
**Layer:** Backend
**Depends on:** TASK-035
### Description
Normalize skill aliases and synonyms.

---

## TASK-037 — Create Salary Parser
**Layer:** Backend
**Depends on:** TASK-034
### Description
Parse salary ranges from text.

---

## TASK-038 — Create Benefits Parser
**Layer:** Backend
**Depends on:** TASK-034
### Description
Extract benefits from descriptions.

---

## TASK-039 — Create HTML Cleaner
**Layer:** Backend
**Depends on:** TASK-034
### Description
Remove unsafe and unnecessary HTML.

---

## TASK-040 — Create Seniority Parser
**Layer:** Backend
**Depends on:** TASK-034
### Description
Extract seniority level from jobs.

---

## TASK-041 — Create Remote Detection System
**Layer:** Backend
**Depends on:** TASK-034
### Description
Detect remote/hybrid/on-site jobs.

---
