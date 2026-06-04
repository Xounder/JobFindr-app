# TASK-02 — Update `SearchBar.test.tsx` — Fix Test That Validates Buggy Behavior

**Layer:** frontend
**Depends on:** TASK-01
**Epic origin:** EPIC-01-search-bar-bug-fix.md

## Description

The test at line 69 of `SearchBar.test.tsx` (`"clears input and calls onSearch with empty string on clear"`) currently validates the **buggy** behavior: it asserts that `onSearch` IS called when clearing. Now that TASK-01 removed the `onSearch("")` call, this test must be updated to expect that `onSearch` is NOT called when clearing.

## Current Test (line 69-77)

```tsx
it("clears input and calls onSearch with empty string on clear", () => {
  const handleSearch = vi.fn();
  render(<SearchBar initialQuery="React" onSearch={handleSearch} />);

  fireEvent.click(screen.getByLabelText("Clear search"));
  const input = screen.getByRole("combobox") as HTMLInputElement;
  expect(input.value).toBe("");
  expect(handleSearch).toHaveBeenCalledWith("");  // ← BUG: this expects the buggy behavior
});
```

## Deliverable

Rename and update the test to assert that `onSearch` is **not** called when the clear button is clicked. The input should still be cleared.

## Expected Updated Test

```tsx
it("clears input without triggering onSearch on clear", () => {
  const handleSearch = vi.fn();
  render(<SearchBar initialQuery="React" onSearch={handleSearch} />);

  fireEvent.click(screen.getByLabelText("Clear search"));
  const input = screen.getByRole("combobox") as HTMLInputElement;
  expect(input.value).toBe("");
  expect(handleSearch).not.toHaveBeenCalled();
});
```

## Acceptance Criteria

- [ ] Test name updated to reflect correct behavior (no `onSearch` on clear)
- [ ] Test verifies `handleSearch` was **not** called after clearing
- [ ] Test confirms input value is cleared (still `""`)
- [ ] All tests pass (`pnpm --filter frontend test`)
- [ ] No TypeScript errors

## Files to Modify

- `apps/frontend/src/components/SearchBar.test.tsx` — update the clear-button test
