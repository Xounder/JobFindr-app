# Impact Analysis — Seven Changes

---

## Layer Impact Matrix

| Layer | Change 1 | Change 2 | Change 3 | Change 4 | Change 5 | Change 6 | Change 7 |
|-------|----------|----------|----------|----------|----------|----------|----------|
| **Backend** | High | Low | Low | None | Low | Medium | None |
| **Frontend** | Medium | Low | None | Low | None | Medium | Low |
| **Types (shared)** | None | Low | None | None | None | None | None |
| **Frontend types** | Medium | Low | None | None | None | Low | None |
| **Configs** | None | None | None | None | None | None | None |
| **Tests** | High | Low | None | None | Medium | Low | None |
| **API contract** | Medium | Low | None | None | None | Low | None |

---

## Change 1: Match Score Job-Centric

### Detailed File Impact

| File | Change Description |
|------|-------------------|
| `apps/backend/src/modules/matchmaking/services/similarity-engine.ts` | Refactor `calculateSimilarity()`: change `matchedSkills` and `missingSkills` to be based on `jobSkills` instead of `userSkills`. The matched loop should iterate over `jobSet` and check membership in `userSet`. The `jaccardSimilarity` function (intersection/union) can remain unchanged. |
| `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts` | Update `matchedSkillsDisplay` fallback (line 79-80) to fall back to `jobSkills.filter(...)` instead of `userSkills.filter(...)`. Update `buildSummary()` to accept `jobSkills.length` as denominator. Change summary text format from "X/Y skills match" to "X of Y job skills matched". |
| `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.test.ts` | Update all assertions on summary text. Verify that matchedSkills contain job skills, not user skills. Verify scores remain consistent (Jaccard score is symmetric). |
| `apps/frontend/src/utils/explain.ts` | The `buildMatchExplanation()` function computes `totalSkills = matchedSkills.length + unmatchedSkills.length`. After Change 1, this will be the number of job skills (not user skills). The explanation text "X of Y skills matched" will now correctly reflect job skill coverage. Verify the text reads naturally. |
| `apps/frontend/src/components/MatchExplanationModal.tsx` | The "Matched Skills" and "Unmatched Skills" sections now display **job skills** instead of **user skills**. Previously: matchedSkills showed which of the USER's skills intersected with job skills. After change: matchedSkills shows which of the JOB's skills the user possesses. The visual rendering (badges) remains the same; only the content changes. |
| `apps/frontend/src/types/index.ts` | No type changes needed. The semantics of `MatchBreakdown.matchedSkills` and `unmatchedSkills` change (now job-centric), but the TypeScript type remains `string[]`. |

### Breaking Changes

- **API response semantics change:** `job.matchBreakdown.matchedSkills` will now contain job skills the user possesses, not user skills that matched the job
- **Summary text format changes:** From "1/30 skills match" to "1 of 3 job skills matched"
- **Frontend display changes:** The "Matched Skills" section in `MatchExplanationModal` will show job skills instead of user skills
- Any existing client parsing summary text for the "X/Y" pattern will break

### Side Effects

- The `explain.ts` `buildMatchExplanation()` formats the count correctly — the `totalSkills` will now be the job skills count, which is the correct denominator
- Seniority match is unaffected

---

## Change 2: Seniority Match Tooltip

### Detailed File Impact

| File | Change Description |
|------|-------------------|
| `packages/types/src/match.types.ts` | Add `userSeniority?: string` and `jobSeniority?: string` fields to `MatchBreakdown` type |
| `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts` | In `computeMatchScoreWithBreakdown()`, populate `userSeniority` and `jobSeniority` from function parameters into the breakdown object |
| `apps/frontend/src/types/index.ts` | Add matching `userSeniority?: string` and `jobSeniority?: string` to the frontend `MatchBreakdown` interface |
| `apps/frontend/src/components/MatchExplanationModal.tsx` | Add tooltip on the seniority badge (lines 108-113). Show "(userJuniority / jobSeniority)" format. Handle undefined values gracefully. |

### Implementation Sketch (MatchExplanationModal.tsx)

```tsx
// Seniority Match (lines 108-113)
<div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
  <span className="font-medium text-gray-700">Seniority Match</span>
  <span
    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${seniorityBadgeColor(matchBreakdown.seniorityMatch)}`}
    title={
      matchBreakdown.userSeniority || matchBreakdown.jobSeniority
        ? `${matchBreakdown.userSeniority ?? "Not specified"} / ${matchBreakdown.jobSeniority ?? "Not specified"}`
        : undefined
    }
  >
    {seniorityBadgeLabel(matchBreakdown.seniorityMatch)}
  </span>
</div>
```

### Breaking Changes

- None (adding optional fields to MatchBreakdown is backward-compatible)

---

## Change 3: Filter Seniority for Matchmaking

### Detailed File Impact

| File | Change Description |
|------|-------------------|
| `apps/backend/src/modules/search/services/aggregation-service.ts` | Line 199: replace `input.userSeniority` with normalized `input.seniority` value. Add normalization logic: if array has 1 element use it; if empty use undefined; if multiple use first. |

### Implementation Sketch (aggregation-service.ts, around line 194-206)

```typescript
// Determine seniority for matchmaking from filter panel
const matchmakingSeniority: string | undefined =
  input.seniority.length === 1
    ? input.seniority[0]
    : input.seniority.length > 1
      ? input.seniority[0]  // use first when multiple selected
      : undefined

// Apply matchmaking (if user skills provided)
if (userSkills && userSkills.normalized.length > 0) {
  for (const job of allJobs) {
    const matchResult = calculateWeightedMatchScoreWithBreakdown(
      userSkills.normalized,
      matchmakingSeniority,     // ← was: input.userSeniority
      job.skills,
      job.seniority,
    )
    job.matchScore = matchResult.score.overall
    job.matchBreakdown = matchResult.breakdown
  }
}
```

### Breaking Changes

- Match scores may change for users who have different filter seniority and modal seniority values
- This is intentional — scores now reflect the filter panel choice

---

## Change 4: Conditional Seniority Label

### Detailed File Impact

| File | Change Description |
|------|-------------------|
| `apps/frontend/src/components/FiltersPanel.tsx` | Lines 100-104: change condition to only show when `userSeniority !== filters.seniority`. Change label prefix to "Your Skill Seniority:". |

### Implementation Sketch (FiltersPanel.tsx)

```tsx
<SenioritySelector value={filters.seniority} onChange={onSeniorityChange} />

{/* Only show modal seniority label when it differs from filter seniority */}
{userSeniority && userSeniority !== filters.seniority && (
  <p className="mt-1 text-xs text-gray-500">
    Your Skill Seniority: {SENIORITY_DISPLAY[userSeniority] ?? userSeniority}
  </p>
)}
```

Note: This change also removes the "Seniority: Not set" fallback since the label only appears when there IS a meaningful difference.

---

## Change 5: Skill Limit 30 → 100

### Detailed File Impact

| File | Line | Change |
|------|------|--------|
| `apps/backend/src/modules/search/validation/search-validation.ts` | 35 | `if (skills.length > 30)` → `if (skills.length > 100)` |
| `apps/backend/src/modules/search/validation/search-validation.ts` | 110 | `if (userSkills.length > 30)` → `if (userSkills.length > 100)` |
| `apps/backend/src/modules/search/validation/search-validation.test.ts` | 34-36 | Change test: `Array.from({ length: 31 }, ...)` → `Array.from({ length: 101 }, ...)` and update error message assertion |
| `apps/backend/src/shared/middleware/anti-spam.ts` | 34 | `maxSkillsCount: 30` → `maxSkillsCount: 100` |

---

## Change 6: Job Title Suggestions

### Detailed File Impact

| File | Change Description |
|------|-------------------|
| `apps/backend/src/modules/suggestions/suggestions-controller.ts` | Add `SUGGESTED_TITLES` array with ~30 common job titles. Add `titles` field to the response object. |
| `apps/frontend/src/services/api.ts` | Extend `SuggestionsResponse` interface: add `titles: string[]` |
| `apps/frontend/src/components/SearchBar.tsx` | Add title filtering logic alongside skills and companies. Add title type to suggestions with appropriate icon and badge. Update `MAX_SUGGESTIONS` or add per-category limits. |

### Implementation Sketch (SearchBar.tsx)

```tsx
// Additional filtering for titles (alongside existing skills/companies)
const titles = suggestions.titles
  .filter((t) => t.toLowerCase().includes(lower))
  .slice(0, MAX_SUGGESTIONS);

// Adjust per-category limits to accommodate 3 categories
const TITLES_PER_CATEGORY = 4;  // 4 skills + 2 companies + 2 titles = 8 total

// In allSuggestions, add title items:
{ type: "title", label: title }

// Rendering: briefcase icon for titles
// Badge: "Title"
```

### Example Title List

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

---

## Change 7: Capitalize Seniority in Your Skills Section

### Detailed File Impact

| File | Lines | Change |
|------|-------|--------|
| `apps/frontend/src/components/FiltersPanel.tsx` | 77-81 | Use `SENIORITY_DISPLAY[filters.userSeniority]` instead of raw `filters.userSeniority`. Add `font-semibold text-indigo-700` classes. |

### Implementation Sketch

```tsx
// Before (lines 77-81):
{filters.userSeniority && (
  <span className="ml-1">
    &middot; {filters.userSeniority}
  </span>
)}

// After:
{filters.userSeniority && (
  <span className="ml-1 font-semibold text-indigo-700">
    &middot; {SENIORITY_DISPLAY[filters.userSeniority] ?? filters.userSeniority}
  </span>
)}
```

### Breaking Changes

- None (visual-only change)
