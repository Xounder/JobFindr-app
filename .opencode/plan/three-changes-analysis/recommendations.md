# Recommendations — Three Changes Analysis

## For Product Manager

### Prioritization Order

**Recommended order of implementation:**

1. **Change 2 (Trust Score Display Fix)** — High priority, low effort, immediate UX improvement
2. **Change 3 (Trust Redefinition)** — Medium priority, medium effort, foundational for trust model
3. **Change 1 (User Skills Tab)** — Medium priority, medium effort, new feature

### Rationale

**Phase 1: Fix the bug (Change 2)**
- This is a clear bug: displayed trust labels are wrong for any score below 80
- 3 files, ~10 lines of code, zero risk
- Quick win that improves trust in the product
- Can be combined with Change 3 since both modify `trustLabel()` and `JobCard.tsx` colors

**Phase 2: Redefine trust model (Change 3)**
- Lays the foundation: new thresholds affect how all jobs are classified and displayed
- Adds ranking boosts which make the ranking more useful (trustworthy jobs get promoted)
- Changes are self-contained in the types package, one ranking file, and frontend display
- Should be done before Change 1 to avoid rework

**Phase 3: User Skills (Change 1)**
- Most complex change: touches frontend UX, store, API, and backend aggregation
- Dependent on seniority already being handled correctly (Change 3 doesn't affect this)
- Can be developed independently from Changes 2/3
- Gets the biggest UX improvement (personalized matchmaking)

---

### Suggested Implementation Grouping

Option A: **Combine Change 2 + Change 3** into one epic (recommended)
- Both touch `trustLabel()` and `JobCard.tsx` color thresholds
- Doing them together avoids merge conflicts and duplicate work
- New trust classification makes the old bug fix obsolete anyway

**Epic 1: "Trust Model Rework"** = Change 2 + Change 3
- Files: 8-9 files, ~90-110 lines
- Effort: Medium
- Risk: Low-Medium (threshold changes affect visibility of some jobs)

**Epic 2: "User Skills & Personalized Matchmaking"** = Change 1
- Files: 12-13 files (~1 new), ~250-350 lines
- Effort: Medium
- Risk: Medium (new query params, validation changes)

---

### What to Build (Scope)

#### Change 1 (User Skills Tab) — MVP Scope:
- ✅ Separate "Your Skills" input with autocomplete + manual entry
- ✅ Seniority selector for user's own seniority
- ✅ "Move all to Required Skills" button
- ✅ Backend uses `userSkills` + `userSeniority` for matchmaking
- ❌ NOT in MVP: multiple skill profiles, saving skills between sessions (beyond Zustand persist)
- ❌ NOT in MVP: skill level/proficiency in matchmaking

#### Change 2 (Trust Display Fix) — MVP Scope:
- ✅ Fix `trustLabel()` thresholds to match backend 0-10 scale
- ✅ Fix `JobCard.tsx` color thresholds
- ✅ Add JSDoc to `NormalizedJob.trustScore` documenting scale

#### Change 3 (Trust Redefinition) — MVP Scope:
- ✅ New 6-level classification in types package
- ✅ Updated visibility thresholds (blocked at <5, hidden at <6, visible at >=6)
- ✅ Ranking boost at 8.0+ (1.25x) and 9.0+ (1.5x)
- ✅ Frontend displays new classifications with appropriate colors
- ❌ NOT in MVP: UI for users to see detailed trust breakdown (current trustScore is enough)
- ❌ NOT in MVP: custom user-defined trust thresholds

---

### Technical Constraints

1. **No server-side persistence**: User skills in Change 1 are stored only in Zustand (localStorage via persist middleware). Do NOT add user profiles or accounts.

2. **Scale consistency**: After Changes 2+3, ALL trust scores are 0-10 everywhere (backend types, frontend types, API responses, cache). The `NormalizedJob.trustScore` type should be documented as "0-10 scale".

3. **Backward compatibility**: 
   - If `userSkills` param is absent in Change 1, the backend falls back to `skills` (no breaking change)
   - Change 3 threshold changes are self-healing (cached entries will be re-evaluated on cache miss)

4. **Ranking score ≠ match score**: The frontend displays `matchScore` (0-100 %match), not `rankingScore`. This is correct. The `rankingScore` is only for sort order. Do not conflate them.

5. **Impact on existing tests**: 
   - Backend has 199 tests — `computeTrustScoreWeight` tests will need updating
   - Frontend has 22 tests — `trustLabel` tests will need updating
   - `getTrustVisibility` tests in types package will need updating
   - Search integration tests may need new params

---

### Dependencies Between Changes

```
Change 2 ─────────────────────────────────┐
                                          ├──> Can combine into same PR
Change 3 (trust types, trustLabel, colors)┘
      │
      │  No dependency (orthogonal features)
      ▼
Change 1 (user skills, new params, UI)
```

Changes 2 and 3 both modify `trustLabel()` and `JobCard.tsx` — they MUST be done together or in sequence (not in parallel by different agents) to avoid merge conflicts.

Change 1 is fully independent — it doesn't touch any trust-related code.

---

### Risk Summary

| Risk | Affects | Likelihood | Impact | Mitigation |
|------|---------|-----------|--------|------------|
| Trust threshold change breaks visibility expectations | Change 3 | Medium | Medium | Test with real data; document change in release notes |
| `userSkills` param ignored by older frontend versions | Change 1 | Low | Low | Backward-compatible fallback to `skills` |
| Seniority negative factor reduces match accuracy | Change 1 | Medium | Medium | Validate with sample queries; tune threshold |
| Cache stale entries after trust threshold change | Change 3 | Low | Low | Cache TTL handles eventual consistency |
| Merge conflict on `trustLabel` / `JobCard.tsx` | Changes 2+3 | High | Low | Combine into single implementation task |

---

## Suggested Epic Breakdown

### Epic 1: "Trust Model Rework" (Changes 2 + 3)

**Tasks:**
1. Update `TRUST_THRESHOLDS` and `getTrustVisibility()` in `trust.types.ts`
2. Add `TrustClassification` type and `getTrustClassification()` function
3. Export new types from `packages/types/src/index.ts`
4. Add ranking boost logic in `trust-score-weight.ts`
5. Update `trustLabel()` in frontend `utils/index.ts`
6. Update `JobCard.tsx` color thresholds
7. Update `TrustFilters.tsx` labels (optional)
8. Update architecture doc `12-trust-engine.md`
9. Update existing tests; add tests for new classification function

### Epic 2: "User Skills & Personalized Matchmaking" (Change 1)

**Tasks:**
1. Add `userSkills` and `userSeniority` to `ValidatedSearchInput` in `search-dto.ts`
2. Add query param parsing in `search-validation.ts`
3. Update `aggregation-service.ts` to use `userSkills` and pass `userSeniority`
4. Change default seniority score from 0.5 to 0 when undefined
5. Add `userSkills` / `userSeniority` to frontend `FiltersState` and `SearchParams`
6. Add to `searchStore.ts` (Zustand + persist)
7. Create `UserSkillsInput.tsx` component (reuses `AutocompleteInput`)
8. Add component to `FiltersPanel.tsx`
9. Wire API params in `api.ts` and hook deps in `useJobSearch.ts`
10. Add tests for new backend parsing and frontend component
