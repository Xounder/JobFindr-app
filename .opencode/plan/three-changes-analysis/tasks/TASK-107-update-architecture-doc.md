# TASK-107 — Update Architecture Documentation

**Layer:** documentation
**Depends on:** TASK-101 (new thresholds must be finalized)
**Epic origin:** EPIC-01-trust-model-rework (`.opencode/plan/three-changes-analysis/epics/EPIC-01-trust-model-rework.md`)

## Description

Update the trust engine architecture documentation at `.opencode/architecture/12-trust-engine.md` to reflect the new thresholds and 6-level classification system.

### Current Content (to update)

```markdown
## Trust Thresholds

| Score | Result |
|---|---|
| < 4 | blocked |
| 4-6.4 | hidden |
| >= 6.5 | visible |
| >= 8 | highlighted |

## Default Behavior

- scores < 6.5 are hidden by default;
- users may manually enable hidden results.
```

### New Content

```markdown
## Trust Thresholds

| Score | Visibility | Classification |
|---|---|---|
| < 5 | blocked | Extreme Low Trust |
| 5 - 5.9 | hidden | Low Trust |
| 6 - 6.9 | visible | Medium Trust |
| 7 - 7.9 | visible | Trust |
| 8 - 8.9 | highlighted | Good Trust |
| >= 9 | highlighted | High Trust |

## Default Behavior

- scores < 6.0 are hidden by default;
- users may manually enable hidden results.

## Ranking Boost

- Jobs with trust score >= 8.0 receive a **1.25x** ranking boost
- Jobs with trust score >= 9.0 receive a **1.5x** ranking boost (multiplicative with 1.25x)
- The final ranking score is capped at 100
```

## Files to Modify

| File | Action |
|------|--------|
| `.opencode/architecture/12-trust-engine.md` | Modify (update thresholds, add classification table, add ranking boost section) |

## Complexity

**Tiny** (~15-20 lines of markdown changes)

## Agent Allocation

**Documentation** — any agent can handle this

## Deliverables

- [ ] Update thresholds table with new values and classification column
- [ ] Update default behavior text (6.0 instead of 6.5)
- [ ] Add ranking boost section documenting 1.25x and 1.5x multipliers
- [ ] Ensure markdown formatting is consistent with other architecture docs
