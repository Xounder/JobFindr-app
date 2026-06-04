# Recommendations — Homepage Fixes

## For Product Manager

### What to build
All three issues should be fixed as a single frontend-only sprint:
1. Fix skill move stale closure in `Layout.tsx`
2. Add seniority label below SenioritySelector in `FiltersPanel.tsx`
3. Add Zustand persist migration + null guards for filter arrays

### What NOT to build
No scope beyond these three fixes. No new components or modals.

### Dependencies
All three fixes are independent and can be done in any order or in parallel.

### Suggested Phasing
Single phase — all three are quick wins (< 30 min each).

### Technical Constraints
- The persist migration uses Zustand's built-in `migrate` function — no external libraries needed
- The closure fix must read from `getState()` rather than reordering calls (more robust)
