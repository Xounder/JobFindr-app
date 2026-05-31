# TASK-209 — Add Tests for User Skills Feature

**Layer:** both (frontend + backend tests)
**Depends on:** TASK-202, TASK-203, TASK-204, TASK-205, TASK-206, TASK-207, TASK-208
**Epic origin:** EPIC-02-user-skills-matchmaking (`.opencode/plan/three-changes-analysis/epics/EPIC-02-user-skills-matchmaking.md`)

## Description

Add and update tests across all layers to validate the user skills & matchmaking feature. This task should be done after all implementation tasks are complete, to validate the full feature.

### Backend Tests

#### 1. Search Validation Tests (`apps/backend/src/modules/search/validation/`)

If no test file exists for `search-validation.ts`, create one:

- `userSkills` comma-separated parsing: `"react,typescript"` → `["react", "typescript"]`
- `userSeniority` valid level: `"senior"` passes validation
- `userSeniority` invalid level: `"expert"` throws validation error
- `userSeniority` absent: returns `undefined` (no error)
- `userSkills` > 30 items: validation error
- Backward compatibility: existing `skills` parsing still works

#### 2. Aggregation Service Tests (`apps/backend/src/modules/search/services/aggregation-service.test.ts`)

Add tests for the `userSkills` fallback logic:

- `userSkills` present → used for matchmaking (not `skills`)
- `userSkills` absent → falls back to `skills`
- `userSeniority` passed to matchmaking instead of `undefined`

#### 3. Match Scoring Tests (`apps/backend/src/modules/matchmaking/services/weighted-match-scoring.test.ts`)

Update existing test and add new ones:

- Update: `handles missing seniority with neutral score` → `handles missing seniority with penalty` (expect lower overall)
- New: `returns 0 seniority score when userSeniority is undefined`
- New: `returns higher match when seniority matches vs undefined`

### Frontend Tests

#### 1. Store Tests (`apps/frontend/src/store/`)

If no test file exists for `searchStore`, create one:

- `setUserSkills(["react", "typescript"])` updates store value
- `setUserSeniority("senior")` updates store value
- Both setters reset page to 1
- Persisted values survive store re-creation

#### 2. UserSkillsInput Component Tests

Create test file for the new component:

- Renders autocomplete input
- Adding a skill (typing + enter/select) adds to tag list
- Removing a skill tag (clicking ×) removes it
- "Move all" button visible when skills exist, hidden when empty
- Seniority selector changes value
- "Move all" calls `onMoveToRequired` callback

#### 3. API Tests

If test file exists for `api.ts`:

- `searchJobs` includes `userSkills` and `userSeniority` params when present
- `searchJobs` omits them when empty/undefined

## Files to Modify

| File | Action | Layer |
|------|--------|-------|
| `apps/backend/src/modules/search/validation/*.test.ts` | Create/Modify | Backend |
| `apps/backend/src/modules/search/services/aggregation-service.test.ts` | Modify | Backend |
| `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.test.ts` | Modify | Backend |
| `apps/frontend/src/store/*.test.ts` | Create | Frontend |
| `apps/frontend/src/components/UserSkillsInput.test.tsx` | Create | Frontend |
| `apps/frontend/src/services/api.test.ts` | Create/Modify | Frontend |

## Complexity

**Medium** (~100-150 lines total across all test files)

## Agent Allocation

**Both** — Backend agent handles backend tests, Frontend agent handles frontend tests.

## Deliverables

- [ ] Backend validation tests for `userSkills` and `userSeniority`
- [ ] Backend aggregation tests for `userSkills` fallback
- [ ] Backend match scoring tests for seniority default change
- [ ] Frontend store tests for `userSkills`/`userSeniority` operations
- [ ] Frontend component tests for `UserSkillsInput`
- [ ] Frontend API tests for query parameter wiring
- [ ] All existing tests still pass
- [ ] `pnpm test` passes across all packages
