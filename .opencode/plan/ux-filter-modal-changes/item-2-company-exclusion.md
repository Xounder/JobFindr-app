# Item 2: Company Mutual Exclusion

## Current Implementation

`CompanyFilters.tsx` renders two independent `AutocompleteInput` components:

```tsx
<AutocompleteInput
  id="include-companies"
  label="Include Companies"
  suggestions={companySuggestions}
  selectedItems={included}
  onAdd={(company) => onIncludeChange([...included, company])}
  onRemove={(company) => onIncludeChange(included.filter((c) => c !== company))}
/>

<AutocompleteInput
  id="exclude-companies"
  label="Exclude Companies"
  suggestions={companySuggestions}
  selectedItems={excluded}
  onAdd={(company) => onExcludeChange([...excluded, company])}
  onRemove={(company) => onExcludeChange(excluded.filter((c) => c !== company))}
  buttonLabel="Add"
/>
```

The two inputs operate completely independently. Companies can appear in both lists simultaneously. The suggestion filtering inside `AutocompleteInput` only filters out items that are already in `selectedItems` for that instance — it doesn't cross-reference the other list.

## Request

If a company is in "Include Companies", it should NOT be accessible (selectable) in "Exclude Companies", and vice versa.

## Feasibility: ✅ Feasible — Small Effort

### Approach

Add an optional `excludeItems?: string[]` prop to `AutocompleteInput`:

1. **Suggestion filtering:** Filter out items present in `excludeItems` from the suggestions dropdown
2. **Direct typing protection:** In the `addItem` function, reject items that are in `excludeItems` (silently ignore or show a brief disabled state)
3. **In `CompanyFilters`:** Pass `excludeItems={excluded}` to the Include input and `excludeItems={included}` to the Exclude input

### Implementation Details

**AutocompleteInput change:**
```tsx
interface AutocompleteInputProps {
  // ... existing props
  excludeItems?: string[];
}
```

**Suggestion filtering (update existing `filtered` computation):**
```tsx
const filtered = suggestions.filter(
  (s) =>
    s.toLowerCase().includes(input.toLowerCase()) &&
    !selectedItems.includes(s) &&
    !(excludeItems ?? []).includes(s),  // NEW
);
```

**addItem protection (update existing `addItem`):**
```tsx
const addItem = useCallback(
  (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !selectedItems.includes(trimmed) && !(excludeItems ?? []).includes(trimmed)) {
      onAdd(trimmed);
    }
    setInput("");
    setHighlightIndex(-1);
  },
  [selectedItems, excludeItems, onAdd],
);
```

**CompanyFilters change:**
```tsx
<AutocompleteInput
  id="include-companies"
  label="Include Companies"
  suggestions={companySuggestions}
  selectedItems={included}
  excludeItems={excluded}         // NEW
  onAdd={(company) => onIncludeChange([...included, company])}
  onRemove={(company) => onIncludeChange(included.filter((c) => c !== company))}
/>

<AutocompleteInput
  id="exclude-companies"
  label="Exclude Companies"
  suggestions={companySuggestions}
  selectedItems={excluded}
  excludeItems={included}         // NEW
  onAdd={(company) => onExcludeChange([...excluded, company])}
  onRemove={(company) => onExcludeChange(excluded.filter((c) => c !== company))}
/>
```

## Files to Modify

| File | Change |
|------|--------|
| `apps/frontend/src/components/AutocompleteInput.tsx` | Add `excludeItems` prop, update filtering and addItem logic |
| `apps/frontend/src/components/CompanyFilters.tsx` | Pass cross-list as `excludeItems` |

**Total: 2 files modified, 0 new files**

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| User types a company name directly (bypassing suggestions) and it's in the other list | Medium | Low | addItem logic already rejects items in excludeItems — silently blocked |
| User can't figure out why a company isn't in suggestions | Low | Low | Clear indication: the company is already in the other list. Could add a tooltip on the input. |
| Mutual exclusion creates confusion when reordering (user wants to move from Include → Exclude) | Medium | Low | User must remove from Include first, then add to Exclude. This is expected behavior. |
