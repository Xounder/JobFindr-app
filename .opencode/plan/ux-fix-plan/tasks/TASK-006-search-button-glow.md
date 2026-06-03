# TASK-006 — Add Search Button Glow Animation

**Layer:** Frontend
**Depends on:** TASK-005 (HomePage draft/commit — passes isDirty prop)
**Epic origin:** EPIC-02-search-flow-rework (Phase 2 — Search Flow)

## Description

Add a visual glow/pulse animation to the Search button in `SearchBar` when the `isDirty` prop is `true`. This signals to users that their filter changes haven't been applied yet and that they need to click Search.

## Files to Modify

| File | Change |
|------|--------|
| `apps/frontend/src/components/SearchBar.tsx` | Add `isDirty` prop and glow effect |
| `apps/frontend/src/components/SearchBar.test.tsx` | Update tests for glow behavior |
| `apps/frontend/src/pages/HomePage.tsx` | Pass `isDirty` prop to SearchBar |

## Current State

```tsx
interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}
```

The Search button currently has static styling:
```tsx
<button
  type="submit"
  className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white
    transition-colors hover:bg-indigo-700
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
>
  Search
</button>
```

## Specification

### 1. Add isDirty Prop

```tsx
interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  isDirty?: boolean;  // NEW
}
```

Default to `false` for backward compatibility.

### 2. Glow Animation When isDirty

When `isDirty === true`, the Search button should have:

- **Pulse animation:** `animate-pulse` (Tailwind built-in)
- **Accent glow:** Add a subtle ring/shadow effect, e.g.:
  - `ring-2 ring-amber-400 ring-offset-1`
  - Background could shift slightly: `bg-indigo-500` → `bg-indigo-500` (keep same, the ring provides the glow)
  - Or use a box-shadow: `shadow-[0_0_8px_rgba(251,191,36,0.5)]` (amber glow)

- **Transition:** The change should be smooth (the existing `transition-colors` class helps)
- **Tooltip (optional):** Add `title="Apply changes"` when dirty for extra UX hint

### 3. Static State (isDirty=false)

When `isDirty === false`, the button returns to its normal appearance:
```tsx
"rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white
 transition-all hover:bg-indigo-700
 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
```

### 4. Dynamic Classes

Use a conditional class:
```tsx
<button
  type="submit"
  className={`
    rounded-lg px-5 py-2.5 text-sm font-medium text-white
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
    ${isDirty
      ? "bg-indigo-500 animate-pulse ring-2 ring-amber-400 ring-offset-1 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
      : "bg-indigo-600 hover:bg-indigo-700"
    }
  `}
>
  Search
</button>
```

### 5. HomePage Integration

The `isDirty` value is read from the store in HomePage (TASK-005) and passed to SearchBar:
```tsx
<SearchBar
  initialQuery={query}
  onSearch={handleSearch}
  isDirty={isDirty}
/>
```

### Test Updates (`SearchBar.test.tsx`)

Add tests for:
- `isDirty=false`: button has normal styling (no pulse/animation classes)
- `isDirty=true`: button has `animate-pulse` class
- `isDirty=true`: button has the ring/glow class
- `isDirty` defaults to `false` when not provided (backward compatible)
- Clicking Search triggers `onSearch` regardless of `isDirty` state
- The SearchBar mock for `useSuggestions` should remain unchanged

## Acceptance Criteria

- [ ] Search button glows with pulse animation when `isDirty={true}`
- [ ] Search button has normal styling when `isDirty={false}` (or not provided)
- [ ] Glow disappears when Search is clicked (isDirty resets to false in HomePage)
- [ ] Pulse animation is subtle and not distracting
- [ ] All existing SearchBar functionality (search, clear, suggestions, keyboard nav) is preserved
- [ ] All existing SearchBar tests pass after updates
- [ ] New tests verify glow classes are applied/removed based on `isDirty` prop
