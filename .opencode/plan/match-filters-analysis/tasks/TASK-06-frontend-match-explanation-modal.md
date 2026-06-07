# TASK-06-frontend: MatchExplanationModal Work Type Display

## Depends on
- TASK-01-backend-match-score-refinement (requires `workTypeMatch` field in `MatchBreakdown` types)

## Description
Update the `MatchExplanationModal` component to display the new `workTypeMatch` field from `MatchBreakdown`. After TASK-01 adds the `workTypeMatch` field to the shared types, this task adds a visual row in the match explanation breakdown showing whether the job's work type matched the user's filters.

This is a small, focused frontend change that depends on the types update from TASK-01.

## Technical Details

### Files to modify
- `apps/frontend/src/components/MatchExplanationModal.tsx` — Add work type match display row (~15-20 lines)

### Acceptance criteria
- When `matchBreakdown.workTypeMatch` is present, a "Work Type Match" row is displayed in the breakdown section
- The row shows the work type match status with appropriate badge colors:
  - `'exact'` → green badge ("Exact Match")
  - `'partial'` → yellow badge ("Partial Match")
  - `'none'` → gray badge ("No Match")
- When `workTypeMatch` is undefined/null, no work type row is shown (graceful fallback)
- The row follows the same visual pattern as the existing "Seniority Match" row
- All existing tests pass (`MatchExplanationModal.test.tsx`)
- Build succeeds without type errors (types must be rebuilt from TASK-01 first)

## Implementation Approach

1. **Read the types**: Ensure `MatchBreakdown` from `@jobfindr/types` now includes optional `workTypeMatch?: 'exact' | 'partial' | 'none'`. Rebuild types package if needed:
   ```
   pnpm --filter @jobfindr/types build
   ```

2. **Add badge helper functions** in `MatchExplanationModal.tsx`:
   ```typescript
   function workTypeBadgeColor(workTypeMatch: 'exact' | 'partial' | 'none'): string {
     switch (workTypeMatch) {
       case "exact":
         return "bg-green-100 text-green-800";
       case "partial":
         return "bg-yellow-100 text-yellow-800";
       case "none":
         return "bg-gray-100 text-gray-600";
     }
   }

   function workTypeBadgeLabel(workTypeMatch: 'exact' | 'partial' | 'none'): string {
     switch (workTypeMatch) {
       case "exact":
         return "Exact Match";
       case "partial":
         return "Partial Match";
       case "none":
         return "No Match";
     }
   }
   ```

3. **Add work type row** in the breakdown section (after Seniority Match row, before Score Breakdown):
   ```tsx
   {matchBreakdown.workTypeMatch && (
     <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
       <span className="font-medium text-gray-700">Work Type Match</span>
       <span
         className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${workTypeBadgeColor(matchBreakdown.workTypeMatch)}`}
       >
         {workTypeBadgeLabel(matchBreakdown.workTypeMatch)}
       </span>
     </div>
   )}
   ```

4. **Update tests**:
   - `MatchExplanationModal.test.tsx`: Add test case for work type match display
   - Test all three states: exact, partial, none
   - Test undefined workTypeMatch (should not render)

## Testing

### Unit tests
- `MatchExplanationModal.test.tsx`: Verify work type match row with exact/partial/none values
- Verify no work type row rendered when `workTypeMatch` is undefined

### Manual verification
- Run `pnpm --filter frontend test` and confirm all tests pass
- Run `pnpm --filter frontend build` to verify types are consistent

### Sequencing note
This task should be executed AFTER TASK-01 is complete, since the `workTypeMatch` field must exist in the shared types package first. The `MatchBreakdown` type is re-exported locally at `apps/frontend/src/types` — ensure the re-export picks up the new field or import directly from `@jobfindr/types`.

## References
- `.opencode/plan/match-filters-analysis/feasibility.md` — Change 1: Match Score Calculation Refinement (work type display)
- `.opencode/plan/match-filters-analysis/impact-analysis.md` — Mentions MatchExplanationModal update
- `apps/frontend/src/components/MatchExplanationModal.tsx` — Current modal implementation
- `packages/types/src/match.types.ts` — Updated `MatchBreakdown` with `workTypeMatch` field (after TASK-01)
- `TASK-01-backend-match-score-refinement.md` — Prerequisite task that adds the types
