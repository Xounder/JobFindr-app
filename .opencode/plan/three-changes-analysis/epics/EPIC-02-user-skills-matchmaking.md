# EPIC-02: User Skills & Personalized Matchmaking

**Status:** Draft
**Priority:** Medium
**Effort:** Medium (~250-350 lines across 13 files — 12 modified, 1 new)
**Changes Covered:** Change 1 (User Skills Tab in Filters Panel)

---

## Description

Add a dedicated "Your Skills" input section in the filters panel, separate from the existing "Required Skills" filter. This enables the matchmaking engine to use the user's full skill profile for personalized match scoring, while keeping "Required Skills" as a pure filter criterion.

Key features:
- A new `UserSkillsInput` component with autocomplete + free-text entry
- A seniority selector for the user's experience level
- "Move all to Required Skills" button for convenience
- Backend uses `userSkills` + `userSeniority` for matchmaking calculation
- When seniority is not selected, it acts as a negative factor (penalizing mismatches) instead of being neutral
- Full backward compatibility — if `userSkills` param is absent, backend falls back to `skills`

This change does **not** violate statelessness: user skills are stored only in the Zustand store (localStorage via persist middleware), never on the server.

---

## User Stories

### US-02.01: Separate User Skills Input
**As a** job seeker  
**I want** a dedicated "Your Skills" input separate from "Required Skills"  
**So that** I can express my full skill profile without affecting which job filters are applied

**Acceptance Criteria:**
- "Your Skills" input appears above "Required Skills" in the filters panel
- Input supports autocomplete suggestions from the existing skill list
- Input also supports free-text entry (manual typing)
- "Required Skills" filter still works independently for filtering jobs
- Matchmaking uses "Your Skills" (or falls back to "Required Skills" if absent)

### US-02.02: Seniority-Based Match Scoring
**As a** job seeker  
**I want** my seniority level to be considered in the match percentage  
**So that** I see jobs that match my experience level ranked higher

**Acceptance Criteria:**
- Seniority selector (dropdown/radio) available in the filters panel
- Options match valid seniority levels (Junior, Mid-level, Senior, Lead, etc.)
- Backend uses `userSeniority` in `calculateWeightedMatchScore()`
- If seniority is not selected, it penalizes the match score (returning 0 instead of neutral 0.5)
- Match percentage visibly changes based on seniority alignment

### US-02.03: Quick Skill Transfer
**As a** job seeker  
**I want** a "Move all to Required Skills" button  
**So that** I can quickly use my skill profile as a filter without retyping

**Acceptance Criteria:**
- Button visible when user has skills in "Your Skills" input
- Clicking moves all user skills to "Required Skills"
- User skills list is cleared after moving
- Duplicate skills are not created

### US-02.04: Session Persistence
**As a** job seeker  
**I want** my skills and seniority to persist between visits  
**So that** I don't have to re-enter them every time I open the app

**Acceptance Criteria:**
- `userSkills` and `userSeniority` are stored in Zustand with persist middleware (localStorage)
- Values survive page refresh and browser restart
- No server-side storage of user data

---

## Deliverables

### Layer: Shared Types (`packages/types/`)

| File | Change | Description |
|------|--------|-------------|
| `src/search-dto.ts` | Modify | Add `userSkills?: string[]` and `userSeniority?: string` to `ValidatedSearchInput` |

### Layer: Backend (`apps/backend/`)

| File | Change | Description |
|------|--------|-------------|
| `modules/search/dto/search-dto.ts` | Modify | Add `userSkills` and `userSeniority` as optional query params |
| `modules/search/validation/search-validation.ts` | Modify | Parse and validate `userSkills` (comma-separated) and `userSeniority` (valid levels) |
| `modules/search/services/aggregation-service.ts` | Modify | Use `input.userSkills ?? input.skills` for matchmaking; pass `input.userSeniority` instead of `undefined` |
| `modules/matchmaking/services/weighted-match-scoring.ts` | Modify | Change seniority default from 0.5 to 0 when `userSeniority` is undefined/absent |

### Layer: Frontend (`apps/frontend/`)

| File | Change | Description |
|------|--------|-------------|
| `src/types/index.ts` | Modify | Add `userSkills: string[]` and `userSeniority: string` to `FiltersState` |
| `src/store/searchStore.ts` | Modify | Add `userSkills`, `userSeniority` to store + `setUserSkills()`, `setUserSeniority()` + persist middleware |
| `src/components/FiltersPanel.tsx` | Modify | Add `UserSkillsInput` component above existing filter sections |
| `src/components/UserSkillsInput.tsx` | **Create** | New component with autocomplete, free-text, "Move all" button |
| `src/services/api.ts` | Modify | Send `userSkills` and `userSeniority` as query params in `searchJobs()` |
| `src/hooks/useJobSearch.ts` | Modify | Include `userSkills` and `userSeniority` in search params dependency array |

### Layer: Tests

| File | Change | Description |
|------|--------|-------------|
| Backend search validation tests | Modify | Add tests for `userSkills` and `userSeniority` parsing |
| Backend aggregation tests | Modify | Add tests for `userSkills` fallback logic |
| Backend matchmaking tests | Modify | Update tests for new seniority default (0 instead of 0.5) |
| Frontend store tests | Modify | Add tests for `userSkills`/`userSeniority` store operations |
| Frontend component tests | **Create** | Add tests for `UserSkillsInput` component |

---

## Tasks

- [ ] **T-02.01**: Add `userSkills?: string[]` and `userSeniority?: string` to `ValidatedSearchInput` in `packages/types/src/search-dto.ts`

- [ ] **T-02.02**: Add `userSkills` (comma-separated string) and `userSeniority` query params to backend `search-dto.ts`

- [ ] **T-02.03**: Parse and validate `userSkills` and `userSeniority` in `search-validation.ts`
  - Parse comma-separated `userSkills` into string array
  - Validate `userSeniority` against allowed seniority levels
  - Add tests for validation

- [ ] **T-02.04**: Update `aggregation-service.ts` to use `userSkills` for matchmaking
  - `parseUserSkills(input.userSkills ?? input.skills)`
  - Pass `input.userSeniority` instead of `undefined` to `calculateWeightedMatchScore()`

- [ ] **T-02.05**: Change seniority default in `weighted-match-scoring.ts`
  - When `userSeniority` is undefined/null, return 0 (penalty) instead of 0.5 (neutral)
  - Update existing tests that expect 0.5 default

- [ ] **T-02.06**: Add `userSkills` and `userSeniority` to frontend `FiltersState` in `types/index.ts`

- [ ] **T-02.07**: Add store fields and setters in `searchStore.ts` with persist middleware

- [ ] **T-02.08**: Create `UserSkillsInput.tsx` component
  - Reuse `AutocompleteInput` and `useSuggestions` pattern
  - Support both autocomplete and free-text entry
  - "Move all to Required Skills" button
  - Seniority selector

- [ ] **T-02.09**: Integrate `UserSkillsInput` into `FiltersPanel.tsx`

- [ ] **T-02.10**: Wire API params in `api.ts` — append `userSkills` and `userSeniority` to search query

- [ ] **T-02.11**: Update `useJobSearch.ts` to include new fields in dependency array

- [ ] **T-02.12**: Add/update tests
  - Backend: validation, aggregation, matchmaking
  - Frontend: store, new component

---

## Acceptance Criteria

- [ ] "Your Skills" input with autocomplete + free-text entry is visible in the filters panel
- [ ] Seniority selector is present with valid options
- [ ] "Move all to Required Skills" button works correctly (moves skills, clears user list, no duplicates)
- [ ] Backend `aggregation-service.ts` uses `input.userSkills` for matchmaking when present
- [ ] Backend falls back to `input.skills` when `userSkills` is absent (backward compatible)
- [ ] Backend `weighted-match-scoring.ts` returns 0 (not 0.5) when seniority is undefined
- [ ] Match percentage changes based on user skills and seniority alignment
- [ ] `userSkills` and `userSeniority` persist across page refreshes (Zustand persist)
- [ ] No server-side storage of user data (stateless constraint maintained)
- [ ] All existing tests pass
- [ ] New tests cover: backend validation, aggregation wiring, seniority default, frontend store, UserSkillsInput component
- [ ] Frontend has zero business logic — match calculation stays on backend

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| None on EPIC-01 | Technical | User Skills touches no trust-related code; can be developed independently |
| Knowledge of `AutocompleteInput` and `useSuggestions` | Knowledge | Existing components should be reused |

---

## Constraints

| Constraint | Status | Notes |
|------------|--------|-------|
| Frontend has zero business logic | ✅ Not violated | Match calculation stays on backend |
| Stateless | ✅ Not violated | User skills in Zustand persist only; no server storage |
| Deterministic scoring | ✅ Not violated | Match scoring remains deterministic |
| Provider isolation | ✅ Not violated | No provider changes needed |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `userSkills` param ignored by older frontend versions | Low | Low | Backward-compatible fallback to `skills` |
| Seniority negative factor reduces match accuracy for some queries | Medium | Medium | Validate with sample queries; tune threshold if needed |
| UI complexity from two separate skill lists confuses users | Low | Medium | Clear labels and visual separation; tooltips if needed |
| Merge conflict with EPIC-01 | None | — | No overlapping files |
