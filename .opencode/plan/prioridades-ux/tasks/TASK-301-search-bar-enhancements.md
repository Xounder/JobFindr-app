# TASK-301 — Enhance SearchBar with Visual Indicator and Suggestions

**Layer:** frontend
**Depends on:** None
**Epic origin:** `epics/epic-3-search-bar-improvements.md`

## Description

Enhance the SearchBar component with two improvements:

**A — Visual indicator when search value is present:** The search icon and border change color (from gray to indigo) when the user has typed something, providing immediate visual feedback.

**B — Suggestions dropdown / autocomplete:** Reuse the existing `useSuggestions` hook (which fetches from the `/jobs/suggestions` endpoint) to show a dropdown of matching skills and companies as the user types. The dropdown supports keyboard navigation (ArrowUp/ArrowDown/Escape/Enter) and is capped at 8 items.

## Technical Approach

### Files to modify/create

1. **`apps/frontend/src/components/SearchBar.tsx`** (MODIFY)

   **Part A — Visual Indicator:**
   - Import `clsx` or use template literals for conditional classes
   - Apply dynamic classes to the search icon `<svg>`:
     - `text-gray-400` when `value.length === 0`
     - `text-indigo-500` when `value.length > 0`
   - Apply dynamic classes to the `<input>`:
     - Default: `border-gray-300`
     - When value present: `border-indigo-400 ring-1 ring-indigo-400`
     - Keep `focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500` always
   - States to handle: empty+idle, empty+focused, with value+focused, with value+blur

   **Part B — Suggestions Dropdown:**
   - Import `useSuggestions` hook, `useMemo`, `useRef`, `useEffect`, `useCallback`
   - Import `useFloating` or use absolute positioning (the input container already has `relative`)
   - Add a state for: `showSuggestions: boolean`, `highlightedIndex: number`
   - Use `useMemo` to filter suggestions based on current input value (max 8 items):
     - Filter skills that include the current value (case-insensitive)
     - Filter companies that include the current value (case-insensitive)
   - Render a dropdown `<ul>` below the input when `showSuggestions && value.length > 0`:
     - Positioned absolutely with `z-50`, below the input
     - Two sections: "Skills" and "Companies" with section headers
     - Each item has `aria-selected` based on highlight state
     - Capped at 8 items total
   - Keyboard navigation:
     - `ArrowDown`: increment `highlightedIndex` (wrap to 0 at end)
     - `ArrowUp`: decrement `highlightedIndex` (wrap to last at start)
     - `Escape`: close dropdown, keep input value
     - `Enter`: if highlighted suggestion exists, fill input and trigger `onSearch`; otherwise submit current value
   - Click on suggestion: fill input value and call `onSearch`
   - Close dropdown on blur (with a small delay to allow click registration)
   - Performance: use `useMemo` for filtered suggestions; no noticeable lag

2. **`apps/frontend/src/components/SearchBar.test.tsx`** (CREATE)
   - Test visual indicator: verify icon and border classes change when value is entered
   - Test visual indicator: verify default classes when empty
   - Test suggestions: mock `useSuggestions` hook to return sample skills and companies
   - Test suggestions dropdown appears when input has value and is focused
   - Test suggestions filtered by input value
   - Test keyboard navigation (ArrowDown, ArrowUp, Escape, Enter)
   - Test clicking a suggestion fills input and triggers search
   - Test dropdown capped at 8 items
   - Test dropdown closes on Escape key

### What NOT to change

- Do NOT modify the `useSuggestions` hook (it already works)
- Do NOT modify any backend files (the `/jobs/suggestions` endpoint already exists)
- Do NOT modify the `onSearch` callback interface or `SearchBarProps` type
- Do NOT add new store fields or modify existing filters

## Deliverables

- [ ] Search icon changes from `text-gray-400` to `text-indigo-500` when `value.length > 0`
- [ ] Border changes from `border-gray-300` to `border-indigo-400` with `ring-1 ring-indigo-400` when `value.length > 0`
- [ ] All four visual states styled correctly: empty+idle, empty+focused, with value+focused, with value+blur
- [ ] Suggestions dropdown appears when input has value and is focused
- [ ] Suggestions come from the existing `useSuggestions` hook (skills + companies)
- [ ] Filtered suggestions show max 8 items, with skill and company sections
- [ ] Keyboard navigation: ArrowUp/ArrowDown cycle through items, Escape closes dropdown, Enter selects the highlighted suggestion
- [ ] Clicking a suggestion fills the input and triggers a search
- [ ] Dropdown is positioned correctly with `z-50` to avoid overlap issues
- [ ] No backend changes — the `/jobs/suggestions` endpoint already exists
- [ ] `SearchBar.test.tsx` covers visual states, suggestion rendering, and keyboard navigation
- [ ] Performance: `useMemo` filters suggestions; no noticeable lag
- [ ] All frontend tests pass
