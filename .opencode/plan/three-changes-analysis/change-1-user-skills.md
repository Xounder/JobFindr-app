# Change 1: User Skills Tab in Filters Panel

## Summary

Add a separate tab/panel for users to input their own skills (distinct from the current "Required Skills" filter). This enables the matchmaking engine to use the user's full skill profile while keeping "Required Skills" as a filter criterion.

---

## Problem Description

Currently, the `SearchParams.skills` array serves dual purpose:
1. It is sent to the backend as the user's skill profile for matchmaking calculation
2. It acts as a **filter** on the frontend, tagging jobs that include these skills

The user wants:
- A dedicated "Your Skills" input above the current filter section
- Auto-suggestions from the same skill list as Required Skills, but also allow manual entry (free text)
- If "Required Skills" is empty, auto-populate it from user skills
- A button to "move all" user skills to Required Skills
- The `%match` calculation should use user skills (not just Required Skills) AND seniority
- If seniority is not selected, use it as a negative factor in match % calculation

---

## Current Codebase State

### What exists today

1. **Frontend types** (`apps/frontend/src/types/index.ts`):
   - `FiltersState.skills: string[]` — single skills array (used for both display and API)
   - `SearchParams.skills: string[]` — sent to backend

2. **Frontend store** (`apps/frontend/src/store/searchStore.ts`):
   - `skills: string[]` with `setSkills()`

3. **Frontend component** (`apps/frontend/src/components/SkillsTagsInput.tsx`):
   - Labeled "Required Skills"
   - Uses `useSuggestions()` for autocomplete
   - Single list of selected skills

4. **Backend** (`aggregation-service.ts` lines 188-204):
   ```typescript
   const userSkills = input.skills.length > 0
     ? parseUserSkills(input.skills)
     : null
   // ...
   const matchScore = calculateWeightedMatchScore(
     userSkills.normalized,
     undefined,  // <-- User seniority NOT collected → neutral
     job.skills,
     job.seniority,
   )
   ```
   - Uses `input.skills` as the user's skill profile
   - Seniority is `undefined` (neutral) — never passed

5. **Backend DTO** (`search-dto.ts`):
   - `ValidatedSearchInput.skills: string[]` — single skills field
   - No `userSkills` or `seniority` separate fields

6. **Matchmaking** (`weighted-match-scoring.ts`):
   - `calculateWeightedMatchScore(userSkills, userSeniority, jobSkills, jobSeniority)`
   - Seniority scoring is already implemented (`calculateSeniorityScore`)
   - Default weight: 0.6 skill + 0.25 seniority + 0.15 keyword

---

## Proposed Architecture Changes

### Layer 1: Shared Types (`packages/types/`)

**No changes needed** in the shared types package if we extend the existing `ValidatedSearchInput`:
- Keep `skills` as is (will remain the Required Skills filter for backward compatibility)
- Add optional `userSkills?: string[]` to `ValidatedSearchInput`

But better approach: send user skills as a separate query parameter, and the backend differentiates between "filter skills" and "profile skills".

#### Files to change in `packages/types/`:
- `search-dto.ts`: Add `userSkills?: string[]` and `userSeniority?: string` to `ValidatedSearchInput`

### Layer 2: Backend

#### `apps/backend/src/modules/search/dto/search-dto.ts`
- Add `userSkills?: string` query param (comma-separated)
- Add `userSeniority?: string` query param

#### `apps/backend/src/modules/search/validation/search-validation.ts`
- Parse `userSkills` and `userSeniority` from query params
- Validate `userSeniority` against valid seniority levels

#### `apps/backend/src/modules/search/services/aggregation-service.ts`
- **Current behavior**: `input.skills` → user skills for matchmaking
- **New behavior**:
  - If `input.userSkills` is provided, use it for matchmaking
  - If not, fall back to `input.skills` (backward compat)
  - Pass `userSeniority` to `calculateWeightedMatchScore()` instead of `undefined`
- Line 191: `parseUserSkills(input.skills)` → `parseUserSkills(input.userSkills ?? input.skills)`
- Line 196-197: `undefined` → `input.userSeniority` or null

### Layer 3: Frontend

#### New component: `UserSkillsInput.tsx` (or similar)
- Reuses the same `AutocompleteInput` and `useSuggestions` pattern as `SkillsTagsInput`
- Separate state from the filters
- "Move all to Required Skills" button

#### `apps/frontend/src/types/index.ts`
- Add `userSkills: string[]` and `userSeniority: string` to `FiltersState`

#### `apps/frontend/src/store/searchStore.ts`
- Add `userSkills` and `userSeniority` to the store, `setUserSkills`, `setUserSeniority`
- These persist locally for UX but are sent as `userSkills` param to backend

#### `apps/frontend/src/components/FiltersPanel.tsx`
- Add `UserSkillsInput` component above the existing filter sections
- Pass `userSkills`, `userSeniority`, and change handlers

#### `apps/frontend/src/services/api.ts`
- Add `userSkills` and `userSeniority` to query params in `searchJobs()`

#### `apps/frontend/src/hooks/useJobSearch.ts`
- Include `userSkills` and `userSeniority` from store in search params dependency

### Auto-populate logic (frontend only)
```
if (requiredSkills.length === 0 && userSkills.length > 0) {
  // Send userSkills to backend; required skills filter is empty (no filter)
}
```
This is **not** business logic — it's UX behavior. The actual match % calculation stays on the backend.

### Seniority as negative factor
If seniority is not selected by the user, `calculateSeniorityScore` returns 0.5 (neutral). The user wants it as a negative factor. This means if `userSeniority` is undefined, the seniority component should penalize rather than be neutral. This is a backend change in `calculateSeniorityScore()` — return 0 instead of 0.5 when both are undefined.

---

## Approaches

### Approach A: Add new query params (recommended)

Separate `userSkills` and `userSeniority` from the existing `skills` filter.

**Pros:**
- Clear separation of concerns: `skills` = Required Skills filter, `userSkills` = Matchmaking profile
- Backward compatible (if `userSkills` absent, falls back to `skills`)
- Clean API contract

**Cons:**
- One more query parameter
- Requires validation changes

### Approach B: Reuse `skills` param, derive user skills on frontend

Keep sending `skills` as the combined set. Frontend merges user skills + required skills before sending.

**Pros:**
- No backend DTO changes
- Simpler API

**Cons:**
- Mixes filter and profile concerns
- No way to distinguish "I want jobs with these skills" vs "this is my skill set"
- Seniority still needs a separate param

### Approach C: Always use userSkills, deprecate required skills from matchmaking

Send `userSkills` always; `skills` becomes purely a frontend filter tag.

**Pros:**
- Cleanest semantic separation
- Matchmaking always uses the full user profile

**Cons:**
- Breaking change if other consumers use `skills` for matchmaking
- More frontend complexity to manage two separate skill lists

---

## Files That Change

### Approach A (recommended):

| Layer | File | Change Type | Description |
|-------|------|-------------|-------------|
| Types | `packages/types/src/search-dto.ts` | Modify | Add `userSkills`, `userSeniority` to `ValidatedSearchInput` |
| Backend | `search-dto.ts` | Modify | Add `userSkills`, `userSeniority` query params |
| Backend | `search-validation.ts` | Modify | Parse and validate `userSkills`, `userSeniority` |
| Backend | `aggregation-service.ts` | Modify | Use `userSkills` for matchmaking, pass `userSeniority` |
| Backend | `weighted-match-scoring.ts` | Modify | Change seniority default from 0.5→0 when undefined |
| Frontend | `types/index.ts` | Modify | Add `userSkills`, `userSeniority` to `FiltersState` |
| Frontend | `store/searchStore.ts` | Modify | Add store fields, setters, persist |
| Frontend | `FiltersPanel.tsx` | Modify | Add UserSkillsInput component |
| Frontend | `api.ts` | Modify | Send `userSkills`, `userSeniority` params |
| Frontend | `useJobSearch.ts` | Modify | Include new fields in dependency |
| Frontend | **New:** `UserSkillsInput.tsx` | Create | New component (reuses AutocompleteInput) |
| Tests | Various | Modify | Update existing tests; add new ones |

### Estimated: 12 files changed, 1 new file

---

## Effort Estimate

- **Total: Medium** (~200-350 lines spread across 13 files)
- Backend logic: ~60 lines (validation, aggregation wiring, seniority default change)
- Frontend components: ~120 lines (new component, store changes, API wiring)
- Types: ~15 lines
- Tests: ~80 lines

---

## Constraints Check

| Constraint | Status | Notes |
|------------|--------|-------|
| Frontend has zero business logic | ✅ Not violated | Match calculation stays on backend |
| Stateless | ✅ Not violated | User skills stored in local Zustand persist only; not sent to server storage |
| Deterministic scoring | ✅ Not violated | Match scoring is already deterministic |
| Provider isolation | ✅ Not violated | No provider changes |
