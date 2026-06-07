# Feasibility — Seven Changes

---

## Change 1: Match Score Should Be Job-Centric

### Current Behavior

The similarity engine (`similarity-engine.ts`) uses Jaccard similarity which divides by the **union** of user skills and job skills. The `buildSummary()` function in `weighted-match-scoring.ts` uses `userSkills.length` as the denominator.

**Problem example:** User has 30 skills, job requires 3, only 1 matches.
- Jaccard = 1/(30+3-1) = 1/32 ≈ 3%
- Summary says "1/30 skills match"
- matchedSkills = user skills that match job skills
- missingSkills = user skills that DON'T match job skills

**Desired behavior:**
- "1 of 3 job skills matched"
- matchedSkills = job skills that the user has
- missingSkills/unmatchedSkills = job skills the user DOESN'T have
- The denominator should be `jobSkills.length`, not `userSkills.length`

### Approach A: Refactor similarity-engine and weighted-match-scoring (Recommended)

**Description:** Rewrite `calculateSimilarity()` to compute from the **job's perspective**. Changes needed:

1. **`similarity-engine.ts`:**
   - Switch `matchedSkills` and `missingSkills` to be based on `jobSkills` (the set of job requirements), not `userSkills`
   - The intersection/union logic in `jaccardSimilarity()` should remain as-is for the Jaccard score (it's a symmetric metric), but the matched/missing arrays must change

2. **`weighted-match-scoring.ts`:**
   - `matchedSkillsDisplay` fallback logic (line 79-80) needs updating: currently falls back to `userSkills.filter(...)`, should fall back to `jobSkills.filter(...)`
   - `buildSummary()` must accept `jobSkills.length` instead of `userSkills.length`
   - The summary text should say "X of Y job skills matched" instead of "X of Y skills match"

3. **Side effect:** The `MatchBreakdown.matchedSkills` and `unmatchedSkills` fields will now contain **job skills** instead of **user skills**. This impacts the frontend display (see Impact Analysis).

**Pros:**
- Correct behavior — match percentage represents job coverage
- More intuitive for users: "how many of the job's requirements do I satisfy?"
- Aligns with common ATS (Applicant Tracking System) logic

**Cons:**
- Changes meaning of `matchedSkills`/`unmatchedSkills` in the API response — frontend consumers must adjust
- Tests need comprehensive updates

**Effort:** Medium
**Files touched:**
- `apps/backend/src/modules/matchmaking/services/similarity-engine.ts`
- `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts`
- `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.test.ts`
- `apps/backend/src/modules/matchmaking/services/similarity-engine.test.ts` (if exists)

### Approach B: Keep backend as-is, transform on frontend

**Description:** Keep backend logic unchanged. Frontend receives `matchedSkills` (user skills that matched) and `unmatchedSkills` (user skills that didn't match). The frontend could compute job coverage by comparing `userSkills` against `job.skills` array.

**Pros:**
- Zero backend changes
- No risk of breaking existing API consumers

**Cons:**
- Duplicates comparison logic on frontend (violates "frontend has zero business logic" constraint)
- Mismatch between backend score (Jaccard-based) and displayed percentage
- Inconsistent: backend says 1/30, frontend would show 1/3

**Effort:** Small (frontend only)
**Risk:** Violates architecture principle of zero business logic in frontend

### Recommendation

**Approach A** — Correct the backend logic. The Jaccard similarity dilutes scores and the matched/missing skills are misleading. This is a backend bug that should be fixed at the source.

---

## Change 2: Seniority Match Tooltip

### Current Behavior

`MatchExplanationModal.tsx` (lines 108-113) shows a badge:
- "No Match" (gray), "Close Match" (yellow), "Exact Match" (green)

No contextual information about which seniority levels are involved.

### Approach A: Extend MatchBreakdown + add tooltip (Recommended)

**Description:** Add two new fields to `MatchBreakdown` type — `userSeniority` and `jobSeniority`. Backend populates them. Frontend displays a tooltip on hover showing "(User Level / Job Level)".

**Backend changes (weighted-match-scoring.ts):**
- Extend `MatchBreakdown` with `userSeniority: string | undefined` and `jobSeniority: string | undefined`
- Populate these fields from the inputs in `computeMatchScoreWithBreakdown()`

**Frontend changes (MatchExplanationModal.tsx):**
- Add a tooltip component or `title` attribute to the seniority badge
- Display format: "(Junior / Senior)" — user level / job level
- Show the tooltip on all seniority match states (exact, close, none)

**Shared types changes (packages/types):**
- Extend the `MatchBreakdown` type in `match.types.ts`
- Add `userSeniority?: string` and `jobSeniority?: string`

**Pros:**
- Complete data flow: backend owns the data, frontend renders it
- Tooltip provides actionable insight: "I'm Junior but this job requires Senior"
- Reusable — could be displayed in other contexts

**Cons:**
- Requires updating shared types and rebuilding packages
- Slightly more files touched than a pure frontend hack

**Effort:** Small
**Files touched:**
- `packages/types/src/match.types.ts`
- `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts`
- `apps/frontend/src/types/index.ts`
- `apps/frontend/src/components/MatchExplanationModal.tsx`

### Approach B: Frontend-only (pass values through component props)

**Description:** Don't extend MatchBreakdown. Instead, pass `userSeniority` and `jobSeniority` as separate props to `MatchExplanationModal`.

**Pros:**
- No shared type changes
- Less coordination between packages

**Cons:**
- Fragile — relies on callers remembering to pass these props
- Duplicates data that logically belongs in the breakdown
- If used elsewhere, would need separate propagation

**Effort:** Tiny
**Files touched:**
- `apps/frontend/src/components/MatchExplanationModal.tsx`
- `apps/frontend/src/components/JobCard.tsx` (caller)

### Recommendation

**Approach A** — The seniority values logically belong in the `MatchBreakdown`. Extending the type is the architecturally correct approach.

---

## Change 3: Use Filter Panel Seniority for Matchmaking

### Current Behavior

In `aggregation-service.ts` (line 199):
```typescript
const matchResult = calculateWeightedMatchScoreWithBreakdown(
  userSkills.normalized,
  input.userSeniority,   // ← from User Skills modal
  job.skills,
  job.seniority,
)
```

The matchmaking uses `input.userSeniority` (from the User Skills modal). The `input.seniority` (from the filter panel) is only used for filtering jobs (line 163-167), not for matchmaking.

### Approach A: Change parameter from userSeniority to seniority

**Description:** Replace `input.userSeniority` with `input.seniority` on line 199. However, `input.seniority` is `SeniorityLevel[]` (array), while the function expects `string | undefined`.

**Handling the array:**
- If `input.seniority.length === 1`: use the single value
- If `input.seniority.length > 1`: use the first value (or none — since multiple selections dilute specificity)
- If `input.seniority.length === 0`: pass `undefined` (same as not set)

**Pros:**
- Simple change with clear intent
- Aligns matchmaking with what the user actually selected in the filter

**Cons:**
- `input.seniority` is an array; needs normalization before passing to matchmaking
- If user selects multiple seniority levels, picking one is arbitrary
- `userSeniority` may become partially unused (but still sent from frontend)

**Effort:** Small
**Files touched:**
- `apps/backend/src/modules/search/services/aggregation-service.ts`

### Approach B: Deprecate userSeniority entirely

**Description:** Same as Approach A, but also remove `userSeniority` from the search input, validation, and frontend API payload. The filter panel seniority becomes the sole source.

**Pros:**
- Cleaner — removes redundant field
- Eliminates confusion between the two seniority sources

**Cons:**
- Breaking change to the API contract
- Frontend must stop sending `userSeniority`
- If users want different filter seniority vs. matchmaking seniority (edge case), this prevents it

**Effort:** Medium
**Files touched:**
- `packages/types/src/search-dto.ts`
- `apps/backend/src/modules/search/validation/search-validation.ts`
- `apps/backend/src/modules/search/services/aggregation-service.ts`
- `apps/frontend/src/services/api.ts`
- `apps/frontend/src/types/index.ts`
- `apps/frontend/src/pages/HomePage.tsx`

### Recommendation

**Approach A** — Minimal change with clear semantics. Keep `userSeniority` in the API for now (backward compatibility with existing clients), but stop using it for matchmaking. The filter panel seniority is the more intentional user input.

---

## Change 4: Conditional Seniority Label in FiltersPanel

### Current Behavior

`FiltersPanel.tsx` (lines 100-104):
```tsx
<p className="mt-1 text-xs text-gray-500">
  {userSeniority
    ? `Seniority: ${SENIORITY_DISPLAY[userSeniority] ?? userSeniority}`
    : "Seniority: Not set"}
</p>
```

This always shows the modal seniority (`userSeniority`) below the filter seniority selector, even when they are the same.

### Approach A: Show only when different, with clear label (Recommended)

**Description:** Change the label to show only when `userSeniority` (modal) differs from `filters.seniority` (filter panel selector). Use wording like "Your Skill Seniority: Junior" to clearly indicate it comes from the modal.

**Logic:**
```tsx
// Only show when modal seniority differs from filter seniority
const showModalSeniority = userSeniority && userSeniority !== filters.seniority
// ...
{showModalSeniority && (
  <p className="mt-1 text-xs text-gray-500">
    Your Skill Seniority: {SENIORITY_DISPLAY[userSeniority] ?? userSeniority}
  </p>
)}
```

**Pros:**
- Clear, unambiguous UX — user sees why there are two seniority controls
- Reduces noise — hides redundant information
- Single file change

**Cons:**
- None identified

**Effort:** Tiny (single file, few lines)
**Files touched:**
- `apps/frontend/src/components/FiltersPanel.tsx`

### Recommendation

**Approach A** — Direct implementation with clear labeling.

---

## Change 5: Increase Skill Limit from 30 to 100

### Current Constraints

Three locations enforce a limit of 30:

1. **Backend validation:** `search-validation.ts` line 35-36 — `skills.length > 30` for required skills
2. **Backend validation:** `search-validation.ts` line 110-111 — `userSkills.length > 30` for user skills
3. **Anti-spam middleware:** `anti-spam.ts` line 34 — `maxSkillsCount: 30` for anti-spam check on `skills` query param

No frontend-side limit was found in `AutocompleteInput.tsx`, `UserSkillsModal.tsx`, or `SkillsTagsInput.tsx`. The frontend relies on the backend for validation.

### Approach A: Update all three limits to 100 (Recommended)

**Description:** Change `30` to `100` in all three locations.

**Files to change:**
1. `search-validation.ts` line 35: `if (skills.length > 100)`
2. `search-validation.ts` line 111: `if (userSkills.length > 100)`
3. `anti-spam.ts` line 34: `maxSkillsCount: 100`

**Test impact:**
- `search-validation.test.ts` line 34-36: Update the test that expects 30 — change `Array.from({ length: 31 })` to `Array.from({ length: 101 })`

**Pros:**
- Simple, mechanical change
- Backward-compatible (doesn't break existing clients sending <=30)

**Cons:**
- Slightly larger payload on the wire for users with many skills
- Performance: more skills means more comparisons in matchmaking (O(n*m) complexity)

**Effort:** Tiny
**Files touched:**
- `apps/backend/src/modules/search/validation/search-validation.ts`
- `apps/backend/src/modules/search/validation/search-validation.test.ts`
- `apps/backend/src/shared/middleware/anti-spam.ts`

### Performance Note

The matchmaking engine in `weighted-match-scoring.ts` calls `calculateSimilarity()` which does O(n*m) comparisons where n = user skills and m = job skills. With 100 user skills and ~10 job skills, that's ~1000 comparisons per job, which is still negligible (microseconds).

### Recommendation

**Approach A** — Mechanical change with no architectural concerns.

---

## Change 6: Job Title Suggestions

### Current Behavior

Backend `suggestions-controller.ts` returns:
```typescript
{ skills: SUGGESTED_SKILLS, companies: FALLBACK_COMPANIES }
```

Frontend `SearchBar.tsx` filters and displays suggestions of types `"skill"` and `"company"`, each with an icon and label ("Skill" / "Company").

### Desired Behavior

Search bar should also suggest job titles like "Architect Senior", "Developer Junior", "Engineer", "Product Manager", "Software Engineer", etc. These should appear alongside existing suggestions with a new type `"title"`.

### Approach A: Add job titles to backend and render in frontend (Recommended)

**Backend changes (suggestions-controller.ts):**
- Add a `SUGGESTED_TITLES` array of common job titles
- Include it in the response: `{ skills, companies, titles }`
- The titles array should be filtered by the frontend's query string (already done on frontend)

**Frontend changes (SearchBar.tsx):**
- Add `"title"` as a third type in the suggestion dropdown
- Add a briefcase icon for titles (or similar)
- Update the type badge to show "Title" for title suggestions
- Update filtering logic to include titles alongside skills and companies

**Shared type changes:**
- Extend `SuggestionsResponse` in `apps/frontend/src/services/api.ts` to include `titles: string[]`

**Sample title list:**
```typescript
const SUGGESTED_TITLES = [
  'Software Engineer', 'Senior Software Engineer', 'Full Stack Developer',
  'Frontend Developer', 'Backend Developer', 'DevOps Engineer',
  'Product Manager', 'Project Manager', 'Engineering Manager',
  'Data Scientist', 'Machine Learning Engineer', 'Data Engineer',
  'UX Designer', 'Product Designer', 'UI Designer',
  'Architect', 'Solutions Architect', 'Technical Lead',
  'QA Engineer', 'Test Engineer', 'Site Reliability Engineer',
  'Cloud Engineer', 'Security Engineer', 'Systems Administrator',
  'Scrum Master', 'Business Analyst', 'Tech Lead',
  'Junior Developer', 'Mid-Level Developer', 'Senior Developer',
  'Principal Engineer', 'Staff Engineer', 'CTO',
]
```

**Pros:**
- Significantly improves search UX — users often search by job title
- Reuses existing suggestion infrastructure
- Lightweight — no caching changes needed

**Cons:**
- Hardcoded list needs periodic maintenance
- More items in dropdown may increase cognitive load (mitigated by query filtering)

**Effort:** Medium
**Files touched:**
- `apps/backend/src/modules/suggestions/suggestions-controller.ts`
- `apps/frontend/src/services/api.ts` (type extension)
- `apps/frontend/src/components/SearchBar.tsx`

### Recommendation

**Approach A** — Straightforward extension of existing suggestion system.

---

## Change 7: Capitalize Seniority in Your Skills Section

### Current Behavior

`FiltersPanel.tsx` (lines 77-81):
```tsx
{filters.userSeniority && (
  <span className="ml-1">
    &middot; {filters.userSeniority}
  </span>
)}
```

The `filters.userSeniority` value is displayed as-is — e.g., "junior" in lowercase.

### Approach A: Capitalize and style (Recommended)

**Description:** Add a `SENIORITY_DISPLAY` map lookup (or capitalize inline) and apply bold/colored styling.

**Option A1: Use existing SENIORITY_DISPLAY map**
The file already has `SENIORITY_DISPLAY` (lines 10-16) mapping `junior` → `Junior`, `mid` → `Mid-Level`, etc. Reuse it:

```tsx
{filters.userSeniority && (
  <span className="ml-1 font-semibold text-indigo-700">
    &middot; {SENIORITY_DISPLAY[filters.userSeniority] ?? filters.userSeniority}
  </span>
)}
```

**Option A2: Simple capitalize and bold**
```tsx
{filters.userSeniority && (
  <span className="ml-1 font-semibold text-indigo-700">
    &middot; {filters.userSeniority.charAt(0).toUpperCase() + filters.userSeniority.slice(1)}
  </span>
)}
```

**Recommendation:** Option A1 — reuses existing `SENIORITY_DISPLAY` map which also handles "mid" → "Mid-Level" properly.

**Pros:**
- Single file change
- Reuses existing display logic
- Clear visual improvement

**Cons:**
- None identified

**Effort:** Tiny (single file, 2 lines change)
**Files touched:**
- `apps/frontend/src/components/FiltersPanel.tsx`

### Recommendation

**Approach A (Option A1)** — Use existing `SENIORITY_DISPLAY` map with bold indigo styling.
