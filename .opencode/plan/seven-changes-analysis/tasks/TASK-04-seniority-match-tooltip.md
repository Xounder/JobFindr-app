# Task: Seniority Match Tooltip in MatchExplanationModal (Change 2)

## Description
Extend the `MatchBreakdown` type with `userSeniority` and `jobSeniority` fields, populate them in the backend matchmaking, and display a tooltip on the seniority badge in `MatchExplanationModal.tsx` showing "(User Level / Job Level)".

## Technical Details
- **Files to modify:**
  - `packages/types/src/match.types.ts` — Add `userSeniority?: string` and `jobSeniority?: string` to `MatchBreakdown`
  - `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts` — Populate new fields in `computeMatchScoreWithBreakdown()`
  - `apps/frontend/src/types/index.ts` — Add matching fields to frontend `MatchBreakdown` interface
  - `apps/frontend/src/components/MatchExplanationModal.tsx` — Add tooltip on seniority badge (lines 108-113)
- **Dependencies:** Requires shared types (`packages/types`) to be built first, then backend, then frontend
- **Acceptance criteria:**
  1. `MatchBreakdown` type in shared package includes optional `userSeniority` and `jobSeniority` fields
  2. Backend populates these fields from the matchmaking function parameters
  3. Frontend type mirrors the shared type
  4. Seniority badge in `MatchExplanationModal` shows tooltip with format: `"(Junior / Senior)"` (user / job)
  5. Handles undefined values gracefully (shows "Not specified")
  6. All tests pass

## Implementation Approach
1. **Shared Types (`packages/types/src/match.types.ts`):**
   - Add `userSeniority?: string` and `jobSeniority?: string` to `MatchBreakdown` interface
   - Run `pnpm --filter @jobfindr/types build`

2. **Backend (`apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts`):**
   - In `computeMatchScoreWithBreakdown()`, add `userSeniority` and `jobSeniority` to the returned breakdown object
   - Pass through the `userSeniority` and `jobSeniority` parameters

3. **Frontend Types (`apps/frontend/src/types/index.ts`):**
   - Add `userSeniority?: string` and `jobSeniority?: string` to `MatchBreakdown` interface

4. **Frontend Component (`apps/frontend/src/components/MatchExplanationModal.tsx`):**
   - Locate seniority badge (lines 108-113)
   - Add `title` attribute with tooltip text:
     ```tsx
     title={
       matchBreakdown.userSeniority || matchBreakdown.jobSeniority
         ? `${matchBreakdown.userSeniority ?? "Not specified"} / ${matchBreakdown.jobSeniority ?? "Not specified"}`
         : undefined
     }
     ```
   - This provides native browser tooltip (works on desktop hover, mobile long-press)

5. Build and test:
   - `pnpm --filter @jobfindr/types build`
   - `pnpm --filter backend build`
   - `pnpm --filter frontend build`
   - Run tests for all packages

## Testing
- Build all packages in order: types → backend → frontend
- Run backend tests: `pnpm --filter backend test`
- Run frontend tests: `pnpm --filter frontend test`
- Manual test: Open match explanation modal, hover over seniority badge
- Verify tooltip shows correct user/job seniority values
- Test with undefined values (no seniority set) — should show "Not specified / Not specified"

## Epic Origin
Epic 2: Match Score & Seniority Fixes (Change 2)