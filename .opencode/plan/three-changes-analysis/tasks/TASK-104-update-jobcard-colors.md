# TASK-104 — Update JobCard.tsx Color Thresholds

**Layer:** frontend
**Depends on:** TASK-103 (`trustLabel()` must be updated first for consistency)
**Epic origin:** EPIC-01-trust-model-rework (`.opencode/plan/three-changes-analysis/epics/EPIC-01-trust-model-rework.md`)

## Description

Update the trust score color thresholds in `JobCard.tsx` to match the new 6-level classification system. Currently the component uses 0-100 scale thresholds (>=80 green, >=50 yellow, else red) which is incorrect.

### Current (Buggy) Colors

```tsx
job.trustScore >= 80
  ? "bg-green-100 text-green-800"      // >= 80 = green (but 8.0 is "Good Trust")
  : job.trustScore >= 50
    ? "bg-yellow-100 text-yellow-800"   // >= 50 = yellow (but 5.0 is "Low Trust")
    : "bg-red-100 text-red-800"         // else red
```

### New Colors (0-10 Scale)

| Score Range | Classification | Color (Tailwind) |
|-------------|---------------|------------------|
| >= 9        | High Trust    | `bg-green-100 text-green-800` |
| >= 8        | Good Trust    | `bg-emerald-100 text-emerald-800` |
| >= 7        | Trust         | `bg-blue-100 text-blue-800` |
| >= 6        | Medium Trust  | `bg-yellow-100 text-yellow-800` |
| >= 5        | Low Trust     | `bg-orange-100 text-orange-800` |
| < 5         | Extreme Low   | `bg-red-100 text-red-800` |

> **Note:** The Tailwind classes must exist in the project's CSS. `emerald`, `blue`, and `orange` are standard Tailwind 4 colors and should work without additional configuration.

## Files to Modify

| File | Action |
|------|--------|
| `apps/frontend/src/components/JobCard.tsx` | Modify (update color class logic) |

## Deliverables

- [ ] Update `trustScore` color rendering to use 6-level thresholds on 0-10 scale
- [ ] Colors: green (>=9), emerald (>=8), blue (>=7), yellow (>=6), orange (>=5), red (<5)
- [ ] Verify the Tailwind colors render correctly (no missing CSS classes)
- [ ] No changes to component structure, layout, or behavior

## Complexity

**Small** (~10-15 lines changed in JSX)

## Agent Allocation

**Frontend only**

## Test Requirements

- Update any snapshot or visual tests if they depend on color class values
- Manual verification: render jobs with scores 9.5, 8.5, 7.5, 6.5, 5.5, 4.5 and confirm correct colors
- No new unit tests needed if existing component tests cover rendering
