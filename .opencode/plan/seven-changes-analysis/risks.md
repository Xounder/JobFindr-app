# Risks — Seven Changes

---

## Risk Matrix

### Change 1: Match Score Job-Centric

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Breaking change to matchedSkills/unmatchedSkills semantics** | High | Medium | API consumers (frontend `MatchExplanationModal`, `explain.ts`) expect `matchedSkills` to contain **user skills**. After the change, it contains **job skills**. This will break badge rendering and explanation text. All frontend consumers must be audited and updated. |
| **Jaccard score changes unexpectedly** | Medium | Medium | Changing matched/missing arrays does not change the Jaccard score itself (which is based on intersection/union). But the `synonymScore` and `keywordScore` use userSet as denominator — these remain user-centric. The combined score may shift slightly. Run existing tests and compare outputs. |
| **Summary text shows wrong counts** | High | Low | The `buildSummary()` function takes explicit `matchedCount` and `totalUserSkills` parameters. After refactoring, pass `jobSkills.length` instead. Easy to miss — review the call site carefully. |
| **Tests fail after changes** | High | Medium | `weighted-match-scoring.test.ts` has extensive tests for scores and breakpoints. Summary text containing "X/Y skills match" will change to "X of Y job skills matched". All assertions on summary text must be updated. |

### Change 2: Seniority Match Tooltip

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **MatchBreakdown type change breaks frontend type alignment** | Medium | Low | The frontend has its own `MatchBreakdown` type in `apps/frontend/src/types/index.ts`. It must be updated in sync with the shared types. Use the exact same field names. |
| **Tooltip not visible on mobile** | Medium | Low | Use `title` attribute for basic tooltip or add a small info icon that shows on tap for mobile. The `title` attribute provides native browser tooltip that works on desktop and shows on long-press on mobile. |
| **Seniority values undefined producing "(undefined / undefined)"** | Low | Low | Handle `undefined` gracefully: show "Not specified" for missing values. |

### Change 3: Filter Seniority for Matchmaking

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **input.seniority is an array, not a string** | Certain | Medium | `calculateWeightedMatchScoreWithBreakdown` expects `string | undefined`. Must normalize the array: use first value if single, undefined if empty. If multiple selected, decide on strategy (use first or skip). |
| **User expects modal seniority to affect match scores** | Medium | Low | Clear visual indication: the label change in Change 4 will show "Your Skill Seniority: Junior" when different, making it clear which seniority is used for what. Additionally, update any UI text that says "match based on your seniority" to clarify the source. |
| **userSeniority becomes unused but still sent** | Low | Low | Harmless — the backend will still receive it via API but ignore it for matchmaking. Could be removed in a future cleanup. |
| **Regression: match scores change for existing users** | Medium | Medium | If a user had different values in filter seniority and modal seniority, match scores will change after this fix. This is expected and correct behavior. Document in release notes. |

### Change 4: Conditional Seniority Label

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **User can't find modal seniority setting** | Low | Low | The "Your Skill Seniority" label clearly indicates it comes from the modal. The link to the modal is in the header. |

### Change 5: Skill Limit 30 → 100

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Increased payload size for API requests** | Low | Low | 100 skills at ~10 chars each = ~1KB URL-encoded, well within limits. |
| **Anti-spam middleware only checks skills, not userSkills** | Medium | Low | The anti-spam `maxSkillsCount` only applies to `query.skills`, not `query.userSkills`. This is an existing gap — the validation in `search-validation.ts` covers both. Not a new issue. |
| **Performance impact on matchmaking** | Low | Low | O(n*m) comparison with n=100, m=~10 = ~1000 operations per job. Negligible even with 500 jobs. |

### Change 6: Job Title Suggestions

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Dropdown becomes too long with 3 categories** | Medium | Low | Increase `MAX_SUGGESTIONS` or implement category-based limiting. Currently set to 8 total. Can add a per-category limit (e.g., 4 skills, 2 companies, 2 titles). |
| **Title suggestions don't match user query well** | Medium | Low | Add fuzzy matching or substring matching (already implemented for skills/companies). The existing `.includes(lower)` logic works for titles too. |
| **Hardcoded title list goes stale** | Low | Low | Periodic updates as part of maintenance. Could be extracted from job cache in the future (derive popular titles from aggregated jobs). |
| **Type extension breaks older frontend clients** | Low | Low | Adding a new field (`titles`) to the API response is backward-compatible. Old clients simply ignore the new field. |

### Change 7: Capitalize Seniority

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Mid-Level capitalization mismatch** | Low | Low | The `SENIORITY_DISPLAY` map already handles `mid` → `Mid-Level` correctly. Using the map instead of simple capitalization avoids this. |

---

## Regression Points

### Cross-change regression risks

1. **MatchExplanationModal (Changes 1 + 2):** Both changes touch or affect `MatchExplanationModal.tsx`. Change 1 changes `matchedSkills`/`unmatchedSkills` semantics (now job skills, not user skills). Change 2 adds tooltip. The modal must be updated for both changes. **Test:** Open match explanation modal, verify matched skills show job skills that match, not user skills. Verify tooltip shows correct seniority levels.

2. **MatchBreakdown type (Changes 1 + 2):** Both changes interact with the `MatchBreakdown` type. Change 1 may alter the contents of `matchedSkills`/`unmatchedSkills`. Change 2 adds `userSeniority`/`jobSeniority`. **Test:** Verify type alignment between backend, shared types, and frontend types.

3. **aggregation-service.ts (Changes 1 + 3):** Both changes touch the matchmaking block (lines 195-206). Coordinate to avoid merge conflicts. **Approach:** Implement Change 3 first (simple parameter swap), then Change 1 (refactor the scoring functions).

4. **Seniority UX (Changes 3 + 4 + 7):** Changes 3, 4, and 7 all affect seniority UX. Change 3 changes which seniority drives matchmaking. Change 4 changes when the label appears. Change 7 changes how it's styled. **Test:** Set different filter seniority and modal seniority values. Verify: match scores use filter seniority, label shows correctly only when different, label is capitalized and styled.

5. **FiltersPanel.tsx (Changes 4 + 7):** Both touch adjacent lines in FiltersPanel. Implement together in one pass to avoid conflicts.

---

## Performance Impact

| Change | Impact | Reasoning |
|--------|--------|-----------|
| 1 — Match score job-centric | None | Same O(n*m) complexity, same number of comparisons |
| 2 — Seniority tooltip | Negligible | Single `title` attribute addition; no computation |
| 3 — Filter seniority for matchmaking | None | Same function call, same parameters |
| 4 — Conditional seniority label | None | Simple conditional render |
| 5 — Skill limit 100 | Negligible | O(n*m) with n=100 vs n=30 — still microseconds per job |
| 6 — Job title suggestions | Negligible | Title list is small (~30 items), filtered on frontend |
| 7 — Capitalize seniority | None | Simple string lookup |
