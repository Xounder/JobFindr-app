# TASK-202 — Add Backend Query Params & Validation for User Skills

**Layer:** backend
**Depends on:** TASK-201 (types must be updated first)
**Epic origin:** EPIC-02-user-skills-matchmaking (`.opencode/plan/three-changes-analysis/epics/EPIC-02-user-skills-matchmaking.md`)

## Description

Add `userSkills` and `userSeniority` as query string parameters to the backend search DTO and validation logic. The frontend will send these as comma-separated values in the URL query string.

### Step 1: Update `SearchRequestQuery` in `search-dto.ts`

Add two new optional query parameters:

```typescript
export type SearchRequestQuery = {
  q?: string
  skills?: string
  userSkills?: string       // NEW: comma-separated user skills
  userSeniority?: string    // NEW: single seniority level
  page?: string
  // ... rest unchanged
}
```

### Step 2: Update `validateSearchInput()` in `search-validation.ts`

Add parsing and validation for the new parameters:

- **`userSkills`**: Parse comma-separated string into `string[]` (same as `skills` parsing)
  - Max 30 skills limit applies
  - Convert to lowercase for consistency
- **`userSeniority`**: Single string value, validate against `VALID_SENIORITY_LEVELS`
  - If provided but invalid → validation error
  - If missing → `undefined` (backward compatible)

### Step 3: Return values in `ValidatedSearchInput`

```typescript
return {
  q,
  skills,
  userSkills,       // NEW: string[] | undefined
  userSeniority,    // NEW: string | undefined
  page,
  pageSize,
  // ... rest unchanged
}
```

## Files to Modify

| File | Action |
|------|--------|
| `apps/backend/src/modules/search/dto/search-dto.ts` | Modify (add `userSkills` and `userSeniority` to query type) |
| `apps/backend/src/modules/search/validation/search-validation.ts` | Modify (parse and validate new params) |

## Complexity

**Small** (~20-30 lines added)

## Agent Allocation

**Backend only**

## Test Requirements

- Unit test validation: `userSkills` comma-separated parsing (e.g., `"react,typescript"` → `["react", "typescript"]`)
- Unit test validation: `userSeniority` valid levels (e.g., `"senior"` → passes, `"expert"` → validation error)
- Unit test validation: `userSeniority` undefined is OK (backward compatible)
- Unit test validation: `userSkills` exceeding 30 items → validation error
- Test that existing `skills` validation still works unchanged
