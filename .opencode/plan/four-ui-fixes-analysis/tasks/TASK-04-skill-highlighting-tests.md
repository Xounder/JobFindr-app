# TASK-04 — Add Tests for Skill Highlighting in `JobCard.test.tsx`

**Layer:** frontend
**Depends on:** TASK-03
**Epic origin:** EPIC-02-job-card-skill-highlighting.md

## Description

Add tests to `JobCard.test.tsx` for the new skill highlighting behavior. These tests must verify that skills are correctly highlighted based on `useSearchStore.userSkills`, including case-insensitive matching and empty-state behavior.

## Test Setup

Since `JobCard` now reads from `useSearchStore`, tests need to set the store state before rendering. The existing tests mock child components (`MatchSummary`, `ExpandableDescription`, `ApplyCta`) with `vi.mock()`. Add a `beforeEach` or set the store state in each relevant test using `useSearchStore.setState()`.

## Import Pattern

```tsx
// Add to existing imports at top of file:
import { useSearchStore } from "@/store/searchStore";
```

## Tests to Add

### 1. Skills matching user skills render with indigo style

```tsx
it("highlights matching skills with indigo badge style", () => {
  useSearchStore.setState({ userSkills: ["TypeScript"] });
  render(<JobCard job={defaultJob} />);

  const typeScriptBadge = screen.getByText("TypeScript");
  expect(typeScriptBadge.className).toContain("bg-indigo-100");
  expect(typeScriptBadge.className).toContain("text-indigo-800");

  const reactBadge = screen.getByText("React");
  expect(reactBadge.className).toContain("bg-gray-100");
  expect(reactBadge.className).toContain("text-gray-700");
});
```

### 2. Case-insensitive matching works

```tsx
it("matches skills case-insensitively", () => {
  useSearchStore.setState({ userSkills: ["typescript", "REACT"] });
  render(<JobCard job={defaultJob} />);

  expect(screen.getByText("TypeScript").className).toContain("bg-indigo-100");
  expect(screen.getByText("React").className).toContain("bg-indigo-100");
});
```

### 3. Empty userSkills — all skills render gray

```tsx
it("shows all skills as gray when userSkills is empty", () => {
  useSearchStore.setState({ userSkills: [] });
  render(<JobCard job={defaultJob} />);

  const skills = ["TypeScript", "React"];
  for (const skill of skills) {
    const badge = screen.getByText(skill);
    expect(badge.className).toContain("bg-gray-100");
    expect(badge.className).toContain("text-gray-700");
    expect(badge.className).not.toContain("bg-indigo-100");
  }
});
```

### 4. No crash when userSkills has null/undefined-like state

The store initializes `userSkills` to `[]`, but test that it handles gracefully.

## Important: Cleanup Between Tests

The store state persists between tests. Either:
- Use `afterEach` to reset `useSearchStore.setState({ userSkills: [] })` — but be careful not to break existing tests
- Or set the store state explicitly in each test that needs it

The simplest approach: add to the existing `afterEach`:

```tsx
afterEach(() => {
  cleanup();
  useSearchStore.setState({ userSkills: [] }); // Reset store state
});
```

But check that this doesn't break existing tests that depend on the store state. Since existing tests don't read from the store, resetting `userSkills` should be safe.

## Acceptance Criteria

- [ ] Test: matching skills display indigo badge style
- [ ] Test: non-matching skills display gray badge style
- [ ] Test: case-insensitive matching works (e.g., `"typescript"` matches `"TypeScript"`)
- [ ] Test: empty `userSkills` — all skills render gray
- [ ] Store state properly reset between tests (no test pollution)
- [ ] All tests pass (`pnpm --filter frontend test`)
- [ ] No TypeScript errors

## Files to Modify

- `apps/frontend/src/components/JobCard.test.tsx` — add store import and new test cases
