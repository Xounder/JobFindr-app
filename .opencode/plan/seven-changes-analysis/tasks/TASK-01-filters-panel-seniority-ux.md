# Task: FiltersPanel Seniority UX Polish (Changes 4 + 7)

## Description
Combine two related frontend changes in `FiltersPanel.tsx`:
- Change 4: Conditional seniority label — show "Your Skill Seniority" label only when modal seniority differs from filter panel seniority
- Change 7: Capitalize and style seniority in "Your Skills" section — use `SENIORITY_DISPLAY` map with bold indigo styling

Both changes touch adjacent lines in the same file and should be implemented together to avoid conflicts.

## Technical Details
- **Files to modify:**
  - `apps/frontend/src/components/FiltersPanel.tsx`
- **Dependencies:** None (independent frontend task)
- **Acceptance criteria:**
  1. Seniority in "Your Skills" section displays capitalized (e.g., "Junior" not "junior", "Mid-Level" not "mid")
  2. Seniority text is bold and indigo (`font-semibold text-indigo-700`)
  3. "Your Skill Seniority:" label appears ONLY when `userSeniority !== filters.seniority`
  4. Label uses `SENIORITY_DISPLAY` map for proper formatting
  5. No "Seniority: Not set" fallback text when no modal seniority is set

## Implementation Approach
1. Open `apps/frontend/src/components/FiltersPanel.tsx`
2. Locate lines 77-81 (Change 7 area) — update to use `SENIORITY_DISPLAY` map and add styling classes
3. Locate lines 100-104 (Change 4 area) — change condition to `userSeniority && userSeniority !== filters.seniority`, update label text to "Your Skill Seniority:"
4. Verify the `SENIORITY_DISPLAY` constant is already imported/available (defined lines 10-16 in same file)
5. Test both changes together

## Testing
- Start frontend dev server
- Open filters panel
- Set a modal seniority (via User Skills modal)
- Set a different filter panel seniority
- Verify: "Your Skill Seniority: Junior" label appears with capitalized value
- Set filter seniority to match modal seniority
- Verify: label disappears
- Verify: "Your Skills" section shows capitalized, bold indigo seniority
- Run frontend tests: `pnpm --filter frontend test`

## Epic Origin
Epic 1: Seniority UX Polish (Changes 4 + 7)