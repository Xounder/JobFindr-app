# TASK-105 — Update TrustFilters.tsx Labels (Optional Cleanup)

**Layer:** frontend
**Depends on:** TASK-104 (same component area — do after JobCard colors)
**Epic origin:** EPIC-01-trust-model-rework (`.opencode/plan/three-changes-analysis/epics/EPIC-01-trust-model-rework.md`)

## Description

Review and update `TrustFilters.tsx` if it references old threshold names or incorrect scale descriptions. The slider already uses the correct 0-10 scale, but labels may need updating for clarity.

### Current State (Correct)

The current `TrustFilters.tsx` already uses:
- `min={0}`, `max={10}`, `step={0.5}` — correct 0-10 scale
- Labels: `"0 (Any)"` and `"10 (Highest)"` — scale-neutral, still accurate

### Potential Improvements

If the PM or design review suggests, the labels could be updated to reflect the new 6-level system:

- Option A: Keep as-is (labels are already correct)
- Option B: Add visual indicators showing the 6 trust levels along the slider

This task is **optional** — only implement if there's a specific design requirement.

## Files to Modify

| File | Action |
|------|--------|
| `apps/frontend/src/components/TrustFilters.tsx` | Review (modify only if labels need updating) |

## Deliverables

- [ ] Review `TrustFilters.tsx` for any references to old threshold names
- [ ] If needed, update labels/descriptions to match new 6-level system
- [ ] No functional changes to the slider component

## Complexity

**Tiny** (~0-10 lines, possibly no changes needed)

## Agent Allocation

**Frontend only**

## Test Requirements

- N/A — no functional changes
- If labels are updated, verify they display correctly in the browser
