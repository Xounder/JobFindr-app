# Impact Analysis — 5 Match & Filters Changes

---

## Layer Impact Matrix

### Change 1: Match Score Calculation Refinement

| Layer | Impact | Changes |
|-------|--------|---------|
| Backend | Medium | `weighted-match-scoring.ts`: Add `workTypeWeight` (0.15), redistribute weights (skill 0.45, seniority 0.30, keyword 0.10), implement `calculateWorkTypeScore()`, add 100% clamp condition<br>`aggregation-service.ts`: Pass `remoteMode` + `countries` from `ValidatedSearchInput` into `calculateWeightedMatchScoreWithBreakdown()` call |
| Types (shared) | Low | `match.types.ts`: Add optional `workTypeMatch: 'exact' \| 'partial' \| 'none'` to `MatchBreakdown` for explanation modals |
| Frontend | Low | `MatchExplanationModal.tsx`: May need a minor update to display work type match in breakdown |
| API | None | No new endpoints or response fields |
| Configs | None | — |

### Change 2: "Your Skills" Filter Clickable

| Layer | Impact | Changes |
|-------|--------|---------|
| Frontend | Medium | **New** `contexts/SkillsModalContext.tsx` — create context + provider<br>`main.tsx` — wrap `<App>` with `<SkillsModalProvider>`<br>`Layout.tsx` — replace local `isSkillsModalOpen` state with context; remove prop threading<br>`FiltersPanel.tsx` — add `onClick` handler on "Your Skills" section calling `openSkillsModal()` from context |
| Backend | None | — |
| Types | None | — |
| Configs | None | — |

### Change 3: Seniority Label with Sync

| Layer | Impact | Changes |
|-------|--------|---------|
| Frontend | Low | `FiltersPanel.tsx`: Change `<p>` to `<button>`; update label text to `"Use your Seniority: <value>"`; add `onClick` calling `onSeniorityChange(userSeniority)` |
| Backend | None | — |
| Types | None | — |
| Configs | None | — |

### Change 4: Required Skills Filter Exclusivity

| Layer | Impact | Changes |
|-------|--------|---------|
| Backend | Low | `aggregation-service.ts`: Add filter step (after country filter) that keeps only jobs containing ALL `input.skills` |
| Frontend | None | — |
| Types | None | — |
| Configs | None | — |

### Change 5: Companies Filters Reflecting Actual Results

| Layer | Impact | Changes |
|-------|--------|---------|
| Frontend | Medium | `HomePage.tsx`: Compute `resultCompanies` from `data?.jobs` using `useMemo`; pass to `FiltersPanel`<br>`FiltersPanel.tsx`: Accept `resultCompanies` prop, forward to `CompanyFilters`<br>`CompanyFilters.tsx`: Accept optional `resultSuggestions` prop; use as suggestions when provided, fall back to `useSuggestions()` default |
| Backend | None | — |
| Types | None | — |
| Configs | None | — |

---

## Combined Layer Impact

| Layer | Overall Impact | Files Changed |
|-------|---------------|---------------|
| Frontend | Medium | 7-8 files (context, main, Layout, FiltersPanel, CompanyFilters, HomePage, potentially MatchExplanationModal) |
| Backend | Medium | 3-4 files (weighted-match-scoring, aggregation-service, match.types, potentially search-dto) |
| Types (shared) | Low | 1 file (match.types.ts) |
| Configs | None | 0 |

**Total estimated files changed:** 10-13 files

---

## Breaking Changes

| Change | Breaking? | Details |
|--------|-----------|---------|
| 1. Match score | **Yes — behavioral** | Match scores will shift for all jobs. The new work type factor means scores now depend on remote mode filter + countries filter. Existing 66% match may become higher/lower. 100% clamp changes the maximum achievable score. |
| 2. Skills clickable | No | Existing behavior preserved; modal opens from more places |
| 3. Seniority label | No | Existing label replaced with clickable sync action |
| 4. Required skills | **Yes — behavioral** | Previously, Required Skills only influenced match scoring. Now jobs missing required skills will be EXCLUDED entirely. This is a breaking change in search behavior. |
| 5. Companies | **Yes — minor** | Company suggestions will now show only companies from current results rather than all cached companies. Users may see fewer suggestions initially. |

### Mitigation for Breaking Changes

1. **Change 1**: Communicate score formula change. User-facing match % values will shift. Ensure the MatchExplanationModal accurately reflects the new formula.
2. **Change 4**: This is the most impactful breaking change. Users who set Required Skills will now see fewer results (potentially zero if no jobs have all skills). Consider adding a notice in the UI: "Only showing jobs with all required skills."
3. **Change 5**: The company filter suggestions may be empty on first page load. Fall back gracefully to global suggestions or show empty state.

---

## Performance Impact

| Change | Impact | Details |
|--------|--------|---------|
| 1. Match score | Negligible | `calculateWorkTypeScore()` is a simple string comparison — O(n) on result set |
| 2. Skills clickable | None | No performance impact |
| 3. Seniority label | None | No performance impact |
| 4. Required skills | Low | `Array.every()` + `Array.some()` for each job. O(n*m) where n = jobs, m = required skills. Filters BEFORE ranking, so fewer jobs flow through trust/ranking. Net effect may be neutral or positive. |
| 5. Companies | Low | `[...new Set()]` computed from `data.jobs` via `useMemo` — negligible |
