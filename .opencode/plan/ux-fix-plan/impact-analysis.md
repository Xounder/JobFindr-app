# Impact Analysis — UX Fix Plan

## Layer Impact Matrix

| Layer | Impact | Changes |
|-------|--------|---------|
| Frontend — Components | **High** | SearchBar (glow), SortToggle (dirty), JobCard (3 new buttons + modals), FiltersPanel (dirty), ExpandableDescription (modal), TrustFilters (labels), UserSkillsModal (local state) |
| Frontend — Pages | **High** | HomePage (committed params, Search handler, dirty state coordination) |
| Frontend — Store | **Medium** | Add `isDirty` to SearchStore; sort/filter setters set dirty flag |
| Frontend — Hooks | **Medium** | useJobSearch (remove debounce, accept committed params) |
| Frontend — Types | **Low** | Add matchBreakdown and trustBreakdown interfaces |
| Frontend — Services | **None** | api.ts unchanged (unless new endpoints needed) |
| Backend — Search | **Low** | Pass breakdown data through aggregation pipeline |
| Backend — Matchmaking | **Medium** | Compute and attach matchBreakdown to each job in response |
| Backend — Trust | **Medium** | Compute and attach trustBreakdown to each job in response |
| Backend — Ranking | **None** | No ranking changes needed |
| Types (shared) | **None** | Breakdown types can live in frontend since they're display-only |
| Utils (shared) | **None** | No util changes needed |
| Configs | **None** | No config changes |

## Detailed file impact

### Files to modify (frontend)

| File | Change | Risk |
|------|--------|------|
| `apps/frontend/src/store/searchStore.ts` | Add `isDirty: boolean`, `dirtyTimeout` or auto-set in setters | Low — additive change |
| `apps/frontend/src/pages/HomePage.tsx` | Add `committedParams` ref/state, wire to SearchBar, pass to useJobSearch, remove query debounce sync | **High** — core search flow changes |
| `apps/frontend/src/hooks/useJobSearch.ts` | Remove debounce, accept committed params as argument instead of reading store | Medium |
| `apps/frontend/src/components/SearchBar.tsx` | Add `isDirty` prop, glow effect on button, `onSearch` callback triggers commit | Low |
| `apps/frontend/src/components/SortToggle.tsx` | Add `onChange` that sets dirty flag | Low |
| `apps/frontend/src/components/FiltersPanel.tsx` | Add dirty flag propagation on all filter changes | Low |
| `apps/frontend/src/components/TrustFilters.tsx` | Add trust labels as tick marks + live label next to value | Low |
| `apps/frontend/src/components/UserSkillsModal.tsx` | Local state, sync on close | Medium — move-to-required logic must work locally |
| `apps/frontend/src/components/ExpandableDescription.tsx` | Replace inline expand with modal trigger | Low |
| `apps/frontend/src/components/JobCard.tsx` | Add info buttons on match% and trust badges, show modals | Low |
| `apps/frontend/src/types/index.ts` | Add `MatchBreakdown`, `TrustBreakdown`, `Job` may need new fields | Low |

### Files to create (frontend)

| File | Purpose |
|------|---------|
| `apps/frontend/src/components/Modal.tsx` | Reusable modal component |
| `apps/frontend/src/components/MatchExplanation.tsx` | Content for match% explanation modal |
| `apps/frontend/src/components/TrustExplanation.tsx` | Content for trust explanation modal |

### Files to modify (backend)

| File | Change | Risk |
|------|--------|------|
| `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts` | Return breakdown (matchedSkills, unmatchedSkills, seniorityMatch) | Low |
| `apps/backend/src/modules/trust/services/trust-engine.ts` | Return breakdown (providerScore, companyAdjustment, signals) | Low |
| `apps/backend/src/modules/search/services/aggregation-service.ts` | Pass breakdown data through to response | Low |

### Files to modify (types)

No changes to `@jobfindr/types` needed — breakdown types can be frontend-only interfaces since they are display-only concerns.

## Breaking Changes

- **Search flow inversion**: Any code/tests that assume reactive search (filters changes auto-trigger API) will break. All tests in `useJobSearch.test.ts`, `HomePage.test.ts`, and search-related tests must be updated.
- **UserSkillsModal test**: Must be updated to reflect local-state behavior (sync on close, not on every change).
- **ExpandableDescription test**: Must be updated to handle modal instead of inline toggle.

## Performance Impact

- **Positive**: Fewer API calls (only on explicit Search button click instead of debounced auto-search)
- **Negative**: Three new modals (negligible — they render conditionally)
- **Neutral**: Backend breakdown computation adds minimal overhead (already computed internally, just need to serialize it)

## Test Impact

| Test suite | Type of change |
|------------|----------------|
| `useJobSearch.test.ts` | Must rewrite: no debounce, committed params |
| `HomePage.test.ts` | Must update: new search flow, dirty state |
| `SearchBar.test.ts` | Must update: glow behavior, dirty prop |
| `SortToggle.test.ts` | Update: dirty flag callback |
| `UserSkillsModal.test.ts` | Update: local state, sync on close |
| `ExpandableDescription.test.ts` | Update: modal instead of toggle |
| `JobCard.test.ts` | Update: new buttons on badges |
| `TrustFilters.test.ts` | Update: new labels |
