# TASK-002 — Add Trust Descriptions to Slider

**Layer:** Frontend
**Depends on:** None
**Epic origin:** EPIC-01-modal-and-trust-labels (Phase 1 — Foundation)

## Description

Add descriptive trust-level labels to the `TrustFilters` slider so users understand what each trust level means. The label updates in real-time as the slider is dragged, and labeled tick marks show all 6 trust levels along the slider track.

## Files to Modify

| File | Change |
|------|--------|
| `apps/frontend/src/components/TrustFilters.tsx` | Add trust labels + tick marks |
| `apps/frontend/src/components/TrustFilters.test.tsx` | Update tests for new labels |

## Current State

The slider currently shows:
- A label: `Minimum Trust Score: {value}`
- Range endpoints: `0 (Any)` and `10 (Highest)`
- No tick marks or descriptive labels

## Specification

### Trust Level Labels

The existing `trustLabel()` utility (already used elsewhere in the codebase) maps trust scores to labels. Use it to display the current label next to the value.

| Score Range | Label |
|-------------|-------|
| 0 | Any |
| 0.5 | Very Low |
| 1.0 - 2.0 | Low |
| 2.5 - 4.0 | Below Average |
| 4.5 - 5.5 | Average |
| 6.0 - 7.5 | Good |
| 8.0 - 9.0 | Very Good |
| 9.5 - 10.0 | Excellent |

Note: these labels map to the step values (0, 0.5, 1.0, ... 10.0). The `trustLabel()` function should be imported or recreated.

### Visual Changes

1. **Current value display:** Replace "Minimum Trust Score: {value}" with a two-line label:
   - Line 1: "Minimum Trust Score: {value}"
   - Line 2: "Label: {trustLabel(value)}" (in a smaller, accent-colored text)

2. **Tick marks:** Add labeled ticks along the slider track showing key levels:
   - Position ticks at values: 0, 2, 4, 6, 8, 10
   - Label each tick with the corresponding trust label
   - Use small text and subtle styling (e.g., `text-[10px] text-gray-400`)
   - Ticks should be positioned proportionally along the slider width

3. **Real-time update:** As the user drags the slider, the label text updates live

### Implementation Notes

- Use CSS grid or flexbox to align ticks with the slider track
- The slider input range is 0 to 10, step 0.5
- Ticks are informational/visual only (the slider handles value selection)
- Keep the existing `accent-indigo-600` styling on the slider
- Don't break existing layout or functionality

## Acceptance Criteria

- [ ] Current trust label (from `trustLabel()`) is displayed next to the slider value
- [ ] Label updates in real-time as the slider is dragged
- [ ] Tick marks are shown at positions 0, 2, 4, 6, 8, 10 with descriptive labels
- [ ] Ticks are visually aligned with the slider track
- [ ] Existing slider behavior (value selection, range, step) is unchanged
- [ ] `onChange` callback behavior is unchanged
- [ ] All existing tests pass after updates
- [ ] New test covers: label rendering, real-time update, tick mark display
