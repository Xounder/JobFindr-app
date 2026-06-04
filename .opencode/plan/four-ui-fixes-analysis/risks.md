# Risks — Four UI Fixes

---

## Risk Matrix

### Change 1: Modal Size

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Trust/Match modals lose styling if defaults aren't applied | Medium | Medium | Use `DEFAULT_DIALOG_CLASS` constant approach — existing modals keep default sizing automatically |
| CSS cascade still doesn't produce 70% width | Low | Medium | Test in multiple viewport sizes; use `min(70vw, 100%)` which gracefully handles small screens |
| `mx-4` gutter interferes with width math | Low | Low | Keep `mx-4` — it adds 16px left/right margin which is fine; `70vw - 32px` is negligible difference |

### Change 2: Explanation Text

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Generated explanation is too verbose or confusing | Low | Low | Keep it to 2-3 concise sentences; use bullet points if needed |
| Data missing (null breakdown) produces incomplete explanation | Medium | Low | Handle null/fallback gracefully — show "Detailed breakdown unavailable" as currently |
| Internationalization issues | Low (MVP) | Low | MVP is English-only per project convention |
| Performance — computing explanations on every render | Low | Low | Use `useMemo` to cache computed text |

### Change 3: Skill Highlighting

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Case mismatch between user skills and job skills | Medium | Low | Use case-insensitive comparison: `userSkills.some(us => us.toLowerCase() === skill.toLowerCase())` |
| Empty userSkills highlights nothing (wasted effort) | Low | None | No negative impact — all skills appear as default gray |
| Store subscription causes unnecessary re-renders | Low | Low | Use selector `useSearchStore((s) => s.userSkills)` which only re-renders when userSkills change |
| Color conflict with existing badge colors | Low | Medium | Use the same indigo style as UserSkillsModal — already established design pattern |

### Change 4: X Button Bug

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Users expect clear to trigger search | Low | Low | If a user clears and then types a new query, the "Search" button handles it; the `isDirty` indicator shows green glow to encourage explicit search |
| Tests fail after fix (expected) | High | Low | The existing test validates the buggy behavior — it must be updated. Document this in the test change. |
| Other code depends on onSearch("") behavior | Very Low | Medium | Search the codebase for any test or component that expects this. No callers found in current analysis. |

---

## Regression Points

### What could break if all 4 changes are deployed together

1. **Modal rendering (Change 1):** If `DEFAULT_DIALOG_CLASS` is not properly set, modals for Trust/Match explanation may appear without correct width. **Test:** Open both Trust and Match explanation modals and verify they render at the standard `max-w-md` width.

2. **Skill display (Change 3):** If the store selector or comparison logic has a bug, all skills might be highlighted (false positives) or none highlighted (false negatives). **Test:** Set user skills to ["TypeScript", "React"], search for jobs, verify that matching skills have indigo style and non-matching skills have gray style.

3. **Search behavior (Change 4):** If the clear button no longer clears properly (e.g., regression where `setValue("")` is removed), the input state could get out of sync. **Test:** Clear input, verify input value is empty, type new query, click Search — should work normally.

4. **Explanation modals (Change 2):** If explanation text rendering has a bug, the modals could show garbled text or crash. **Test:** Open both modals with data that has complete and incomplete (null) breakdowns.

---

## Performance Impact

| Change | Impact | Reasoning |
|--------|--------|-----------|
| 1 — Modal size | None | CSS-only change |
| 2 — Explanation text | Negligible | Small text computation on modal open; use `useMemo` |
| 3 — Skill highlighting | Negligible | O(n) comparison per job card where n = user skills length (usually < 20) |
| 4 — X button fix | None | Removes a network request, actually improves performance |
