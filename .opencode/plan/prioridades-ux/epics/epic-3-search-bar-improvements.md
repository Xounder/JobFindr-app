# Epic 3: Search Bar Visual Indicator & Suggestions

**Priority:** 3 (UX)
**Effort:** Small-Medium
**Layer:** Frontend only
**Dependencies:** None

## Description

Enhance the SearchBar component with two improvements:

**A — Visual indicator when a search value is present:**  
The search icon and border change color (from gray to indigo) when the user has typed something, providing immediate visual feedback.

**B — Suggestions dropdown / autocomplete:**  
Reuse the existing `useSuggestions` hook (which fetches from the `/jobs/suggestions` endpoint) to show a dropdown of matching skills and companies as the user types. The dropdown supports keyboard navigation (ArrowUp/ArrowDown/Escape/Enter) and is capped at 8 items.

## Acceptance Criteria

### Visual Indicator
- [ ] Search icon changes from `text-gray-400` to `text-indigo-500` when `value.length > 0`
- [ ] Border changes from `border-gray-300` to `border-indigo-400` with `ring-1 ring-indigo-400` when `value.length > 0`
- [ ] States: empty+idle, empty+focused, with value+focused, with value+blur — all styled correctly

### Suggestions Dropdown
- [ ] Dropdown appears when input has value and is focused
- [ ] Suggestions come from the existing `useSuggestions` hook (skills + companies)
- [ ] Filtered suggestions show max 8 items, with skill and company sections
- [ ] Keyboard navigation: ArrowUp/ArrowDown cycle through items, Escape closes dropdown, Enter selects the highlighted suggestion
- [ ] Clicking a suggestion fills the input and triggers a search
- [ ] Dropdown is positioned correctly with `z-50` to avoid overlap issues
- [ ] No backend changes — the `/jobs/suggestions` endpoint already exists
- [ ] `SearchBar.test.tsx` covers visual states, suggestion rendering, and keyboard navigation
- [ ] Performance: `useMemo` filters suggestions; no noticeable lag

## Affected Files

| Action | File |
|--------|------|
| MODIFY | `apps/frontend/src/components/SearchBar.tsx` |
| CREATE | `apps/frontend/src/components/SearchBar.test.tsx` |
