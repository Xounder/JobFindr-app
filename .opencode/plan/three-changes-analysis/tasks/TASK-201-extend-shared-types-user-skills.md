# TASK-201 — Extend Shared Types for User Skills

**Layer:** types (shared package)
**Depends on:** None
**Epic origin:** EPIC-02-user-skills-matchmaking (`.opencode/plan/three-changes-analysis/epics/EPIC-02-user-skills-matchmaking.md`)

## Description

Add `userSkills` and `userSeniority` fields to the `ValidatedSearchInput` type in `packages/types/src/search-dto.ts`. These fields allow the frontend to send the user's full skill profile and seniority level separately from the "Required Skills" filter criteria.

### Changes to `ValidatedSearchInput`

Add two new optional fields:

```typescript
export type ValidatedSearchInput = {
  q: string
  skills: string[]
  userSkills?: string[]     // NEW: user's full skill profile (optional)
  userSeniority?: string    // NEW: user's seniority level (optional)
  page: number
  pageSize: number
  // ... rest unchanged
}
```

- `userSkills` is optional (`string[] | undefined`) — when absent, backend falls back to `skills`
- `userSeniority` is optional (`string | undefined`) — single value, not an array
- No changes to `SearchJobsInput` (the API-facing input type) since these come from validated/internal flow

### Backward Compatibility

- When `userSkills` is absent/undefined, existing behavior is preserved (uses `skills` for matchmaking)
- The `skills` field remains unchanged and continues to work as a pure filter

## Files to Modify

| File | Action |
|------|--------|
| `packages/types/src/search-dto.ts` | Modify (add `userSkills` and `userSeniority` to `ValidatedSearchInput`) |

## Deliverables

- [ ] Add `userSkills?: string[]` to `ValidatedSearchInput`
- [ ] Add `userSeniority?: string` to `ValidatedSearchInput`
- [ ] Ensure types build successfully (`pnpm --filter @jobfindr/types build`)
- [ ] No breaking changes to existing consumers

## Complexity

**Tiny** (~3 lines added)

## Agent Allocation

**Types (shared package)**

## Test Requirements

- N/A — pure type change; no runtime tests needed
- Verify `pnpm --filter @jobfindr/types build` succeeds
