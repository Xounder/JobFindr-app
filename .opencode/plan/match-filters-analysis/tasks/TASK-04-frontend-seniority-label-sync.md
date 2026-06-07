# TASK-04-frontend: Seniority Label with Sync

## Depends on
None

## Description
Make the "Your Skill Seniority" label in the filter panel clickable. Currently it's a read-only `<p>` element showing the user's seniority when it differs from the filter seniority. Change it to an interactive element that, on click, synchronizes the filter seniority to the user's seniority value.

This is a trivial UI change — the data flow already exists: `FiltersPanel` receives `onSeniorityChange` callback and has access to `userSeniority` from the store. The only change is converting the display-only `<p>` into a clickable control.

## Technical Details

### Files to modify
- `apps/frontend/src/components/FiltersPanel.tsx` — Modify ~5-10 lines around the seniority label

### Acceptance criteria
- The seniority difference indicator changes from `<p>` to a `<button>` or styled clickable element
- Label text changes to `"Use your Seniority: <value>"` (e.g., "Use your Seniority: Senior")
- On click, calls `onSeniorityChange(userSeniority)` to sync the filter seniority to the user's seniority
- Element has proper interactive styling: `cursor: pointer`, hover state, focus ring for accessibility
- Only renders when `userSeniority` is valid (non-empty, non-undefined)
- Clicking does nothing when `userSeniority` is already equal to the filter seniority (element is hidden)
- All existing tests pass (`FiltersPanel.test.tsx`)

## Implementation Approach

1. **Locate the seniority indicator in FiltersPanel.tsx** (around lines 100-104):
   ```tsx
   {userSeniority && userSeniority !== filters.seniority && (
     <p className="mt-1 text-xs text-gray-500">
       Your Skill Seniority: {SENIORITY_DISPLAY[userSeniority] ?? userSeniority}
     </p>
   )}
   ```

2. **Change to clickable element**:
   ```tsx
   {userSeniority && userSeniority !== filters.seniority && (
     <button
       type="button"
       onClick={() => onSeniorityChange(userSeniority)}
       className="mt-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded"
       title="Click to use your seniority for filtering"
     >
       Use your Seniority: {SENIORITY_DISPLAY[userSeniority] ?? userSeniority}
     </button>
   )}
   ```

3. **Styling details**:
   - Use indigo color (matching app theme) to indicate clickability
   - Add `hover:underline` and `hover:text-indigo-800` for hover feedback
   - Add `focus:ring-2` and `focus:ring-indigo-500` for keyboard accessibility
   - Keep same `mt-1 text-xs` spacing to prevent layout shift
   - Use `<button type="button">` to prevent form submission

4. **Edge cases**:
   - `userSeniority` is empty string → element not rendered (existing guard)
   - `userSeniority` equals filter seniority → element not rendered (existing guard)
   - Rapid clicks → `onSeniorityChange` is called each time, but setting same value is idempotent

## Testing

### Unit tests
- `FiltersPanel.test.tsx`: Verify clickable label calls `onSeniorityChange` with correct value
- Verify element has `role="button"` or is a `<button>` element
- Verify element not rendered when `userSeniority` is empty or matches filter seniority

### Manual verification
- Run `pnpm --filter frontend test` and confirm all tests pass
- Open app, set user seniority in modal, set different filter seniority, click the label → filter updates

## References
- `.opencode/plan/match-filters-analysis/feasibility.md` — Change 3: Seniority Label with Sync
- `.opencode/plan/match-filters-analysis/impact-analysis.md` — Layer impact details
- `.opencode/plan/match-filters-analysis/risks.md` — Risk register for Change 3
- `apps/frontend/src/components/FiltersPanel.tsx` — Current seniority label implementation (lines ~100-104)
