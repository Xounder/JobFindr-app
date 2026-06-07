# Risks — 5 Match & Filters Changes

---

## Risk Register

### Change 1: Match Score Calculation Refinement

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Score regression — existing match scores change unexpectedly | High | Medium | Before deploying, run the existing test suite (`weighted-match-scoring.test.ts`, `match-explanation.test.ts`, `similarity-engine.test.ts`, `ranking-engine.test.ts`) to validate expected score ranges. Add new test cases for work type scenarios. |
| 100% clamp too aggressive — jobs incorrectly get 100% when some skills don't match | Medium | High | Implement strict conditions for the clamp: ALL job skills must be in user skills (no missing skills), seniority must be exact, AND work type must be exact. Only then override to 100%. |
| Work type scoring counterintuitive — hybrid remote mode selection confuses users | Medium | Low | Ensure the MatchExplanationModal clearly shows the work type match breakdown. Use clear labels like "Work Type Match: Remote (Exact)". |
| Weight redistribution reduces keyword score impact | Medium | Low | Keyword score was already a weak signal (partial word matching). Reducing from 15% to 10% is acceptable. Document the weight changes. |

### Change 2: "Your Skills" Filter Clickable

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Context provider not wrapping modal properly | Low | High | Verify that `SkillsModalProvider` wraps the entire app in `main.tsx`. `Layout` and `FiltersPanel` must both be children of the provider. |
| Duplicate modal instances (header + filter panel modals both open) | Low | Medium | The context ensures a single `isOpen` state — only one modal renders at a time. Verify in testing. |
| Existing tests break due to missing context provider | Medium | Medium | Wrap test components with `SkillsModalProvider` in test setup. Add the provider to `test-setup.ts` if available. |

### Change 3: Seniority Label with Sync

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| User clicks label but seniority value is empty | Low | Low | Guard against `userSeniority` being `undefined` or empty string — only render clickable when valid. |
| Label styling inconsistent with clickable elements | Low | Low | Use proper button styling (cursor: pointer, hover state, focus ring) to indicate interactivity. |

### Change 4: Required Skills Filter Exclusivity

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Required skills filter + user skills conflict — user has both set, jobs filtered by required skills but matchmaking uses user skills | Medium | Low | This is actually the desired behavior. Required Skills = filter (exclusive). User Skills = matchmaking (scoring). Keep them independent. |
| Empty results when too many required skills are set | Medium | Medium | This is expected behavior — the filter should be exclusive. Ensure EmptyState component handles this gracefully. Consider showing a message: "No jobs found matching all required skills. Try removing some skills." |
| Case sensitivity mismatch between input skills and job skills | Low | Medium | Both input skills and job skills are normalized to lowercase in the backend. The filter comparison should use `toLowerCase()`. |
| Performance on large result sets (hundreds of jobs) | Low | Low | The filter runs before ranking and caches. Even with 1000 jobs × 20 skills each, the operation is O(n*m) and completes in <1ms. |

### Change 5: Companies Filters Reflecting Actual Results

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Company suggestions empty on first page load | High | Medium | Fall back to `useSuggestions()` global companies when `resultCompanies` is empty or `data` is undefined. Show a hint: "Search first to see available companies." |
| Company suggestions don't update after filter change (stale) | Medium | Low | `useMemo` depends on `data`, so companies update reactively when search results change. After a new search commits, the new companies appear. |
| Company names with special characters not matching | Low | Low | Company names come directly from job data — no transformation needed. Comparison is exact string match. |
| Too many companies in suggestions (50+) causing UX issues | Low | Low | The `AutocompleteInput` component has filtering built-in. If needed, limit the suggestions list to top 20-30. |

---

## Regression Points

### Shared Infrastructure

| Area | Risk | Changes That Could Break It |
|------|------|---------------------------|
| `aggregation-service.ts` | Filter ordering matters — new filter (Required Skills) must be in correct position relative to other filters | Change 1 (adds params to scoring), Change 4 (adds filter step) |
| `searchStore.ts` | Persisted state migration — adding new store properties | Change 2 (if using Zustand approach instead of context) |
| `weighted-match-scoring.ts` | Score calculation is used by ranking engine — changing weights affects ranking | Change 1 (weight redistribution) |
| `MatchExplanationModal.tsx` | Breakdown display must handle new work type field | Change 1 (new breakdown field) |

### Test Coverage

Existing tests that must remain passing after changes:

| Test File | What It Covers | Relevant Change |
|-----------|---------------|-----------------|
| `weighted-match-scoring.test.ts` | Core scoring algorithm | Change 1 |
| `similarity-engine.test.ts` | Skill similarity computation | Change 1 |
| `match-explanation.test.ts` | Explanation generation | Change 1 |
| `ranking-engine.test.ts` | Job ranking with scores | Change 1 |
| `composite-score.test.ts` | Final score composition | Change 1 |
| `aggregation-service.test.ts` | Full search aggregation pipeline | Changes 1, 4 |
| `searchStore.test.ts` | Zustand store behavior | Change 2 (if store modified) |
| `FiltersPanel.test.tsx` | Filter panel rendering | Changes 2, 3, 5 |
| `CompanyFilters.test.tsx` | Company filter component | Change 5 |
| `HomePage.test.tsx` | Page integration | Changes 2, 5 |

---

## Dependency Graph

```
Change 1 (Match Score)
  └─ Needs: Types update for MatchBreakdown
  └─ Affects: Ranking (scores shift)
  
Change 2 (Skills Clickable)
  └─ Needs: New SkillsModalContext
  └─ Independent of other changes

Change 3 (Seniority Label)
  └─ Independent — single file change

Change 4 (Required Skills Filter)
  └─ Independent — single file change
  └─ Tests should verify filter ordering

Change 5 (Companies from Results)
  └─ Needs: HomePage data flows through FiltersPanel
  └─ Slightly coupled with Change 2 (both modify FiltersPanel)
```

**Implementation order recommendation:**
1. Change 3 (trivial, independent)
2. Change 4 (small, independent backend)
3. Change 2 + 5 (can be done together — both modify FiltersPanel)
4. Change 1 (most complex, requires careful testing)

This avoids merge conflicts on `FiltersPanel.tsx` (Changes 2, 3, and 5 all touch it).
