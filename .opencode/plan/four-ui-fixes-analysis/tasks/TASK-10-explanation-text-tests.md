# TASK-10 — Add Tests for Explanation Text Rendering in Both Modals

**Layer:** frontend
**Depends on:** TASK-08, TASK-09
**Epic origin:** EPIC-04-trust-match-explanation-text.md

## Description

Add tests to `TrustExplanationModal.test.tsx` and `MatchExplanationModal.test.tsx` to verify that the new explanation text renders correctly with complete breakdown data, and handles null/missing breakdown data gracefully.

## Files to Modify

### `TrustExplanationModal.test.tsx`

The existing `defaultBreakdown` and `baseProps` should produce an explanation. Add these tests:

### Tests for `TrustExplanationModal.test.tsx`

```tsx
it("renders explanation text when trustBreakdown is provided", () => {
  render(<TrustExplanationModal {...baseProps} />);
  // Explanation should contain the score and label
  expect(screen.getByText(/Score 8\.2\/10/)).toBeDefined();
});

it("does not render explanation text when trustBreakdown is null", () => {
  render(
    <TrustExplanationModal
      {...baseProps}
      trustBreakdown={null}
    />,
  );
  // Should not show any explanation-like text (no "Score X/10")
  expect(screen.queryByText(/Score/)).toBeNull();
});

it("explanation contains freshness information", () => {
  render(<TrustExplanationModal {...baseProps} />);
  expect(screen.getByText(/Posted 5 days ago/)).toBeDefined();
});

it("explanation contains provider reputation", () => {
  render(<TrustExplanationModal {...baseProps} />);
  expect(screen.getByText(/Provider reputation: 8\.0\/10/)).toBeDefined();
});

it("explanation mentions known employer when applicable", () => {
  render(<TrustExplanationModal {...baseProps} />);
  expect(screen.getByText(/known in our database/)).toBeDefined();
});

it("explanation does not mention unknown employer when isKnownEmployer is false", () => {
  render(
    <TrustExplanationModal
      {...baseProps}
      trustBreakdown={{
        ...defaultBreakdown,
        signals: { ...defaultBreakdown.signals, isKnownEmployer: false },
      }}
    />,
  );
  expect(screen.queryByText(/known in our database/)).toBeNull();
});
```

### Tests for `MatchExplanationModal.test.tsx`

```tsx
it("renders explanation text when matchBreakdown is provided", () => {
  render(<MatchExplanationModal {...baseProps} />);
  // Explanation should contain the percentage
  expect(screen.getByText(/85% match/)).toBeDefined();
});

it("does not render explanation text when matchBreakdown is null", () => {
  render(
    <MatchExplanationModal
      {...baseProps}
      matchBreakdown={null}
    />,
  );
  // Should not show any explanation-like text (no "X% match —")
  expect(screen.queryByText(/% match/)).toBeNull();
});

it("explanation contains matched skills count", () => {
  render(<MatchExplanationModal {...baseProps} />);
  expect(screen.getByText(/3 of 5 skills matched/)).toBeDefined();
});

it("explanation shows seniority match as exact", () => {
  render(<MatchExplanationModal {...baseProps} />);
  expect(screen.getByText(/Seniority level is an exact match/)).toBeDefined();
});

it("explanation shows seniority close match", () => {
  render(
    <MatchExplanationModal
      {...baseProps}
      matchBreakdown={{
        ...defaultBreakdown,
        seniorityMatch: "close",
      }}
    />,
  );
  expect(screen.getByText(/Seniority level is a close match/)).toBeDefined();
});

it("explanation shows no seniority match", () => {
  render(
    <MatchExplanationModal
      {...baseProps}
      matchBreakdown={{
        ...defaultBreakdown,
        seniorityMatch: "none",
      }}
    />,
  );
  expect(screen.getByText(/Seniority level does not match/)).toBeDefined();
});
```

## Important: Import `defaultBreakdown`

The `defaultBreakdown` variable is defined inside `describe("MatchExplanationModal", ...)` scope. If the new tests are added inside the same `describe` block, they'll have access to it. If you need to reference it outside, extract it to module scope.

## Acceptance Criteria

- [ ] Trust modal test: explanation renders with complete breakdown data
- [ ] Trust modal test: no explanation when breakdown is null
- [ ] Trust modal test: explanation contains freshness info
- [ ] Trust modal test: explanation contains provider reputation
- [ ] Trust modal test: known employer mention conditionally shows
- [ ] Match modal test: explanation renders with complete breakdown data
- [ ] Match modal test: no explanation when breakdown is null
- [ ] Match modal test: explanation contains matched skills count
- [ ] Match modal test: seniority match text matches each variant (exact, close, none)
- [ ] All tests pass (`pnpm --filter frontend test`)
- [ ] No TypeScript errors

## Files to Modify

- `apps/frontend/src/components/TrustExplanationModal.test.tsx` — add explanation tests
- `apps/frontend/src/components/MatchExplanationModal.test.tsx` — add explanation tests
