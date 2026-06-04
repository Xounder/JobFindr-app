# Item 1: Filter "Add" → "Clean" Button

## Current Implementation

`AutocompleteInput.tsx` is a generic component with a `buttonLabel` prop (default `"Add"`). It renders a button that adds the current text input value to `selectedItems`. The button currently serves as an "Add" action: it takes whatever the user typed and appends it to the selection.

The component is used by these filters that are in scope:

| Usage | ID | Label | Current buttonLabel |
|-------|-----|-------|-------------------|
| Required Skills | `skills-input` | "Required Skills" | default "Add" |
| Include Companies | `include-companies` | "Include Companies" | default "Add" |
| Exclude Companies | `exclude-companies` | "Exclude Companies" | `"Add"` (explicit) |
| Add your skills (modal) | `modal-user-skills-input` | "Add your skills" | default "Add" |

**Also relevant (out of scope?):**
- `UserSkillsInput.tsx` header "Add your skills" — also uses default "Add"

## Request

For all filters that have a text field showing all possible values and an "Add" button:
- Change "Add" → "Clean"
- Clean button is **disabled** when nothing is selected
- Clicking "Clean" **clears all selected items**
- Valid for: Required Skills, Include Companies, Exclude Companies, Add your skills (Your Skills modal)

## Feasibility: ✅ Feasible — Small Effort

### Approach

Add a new `onClear?: () => void` callback prop to `AutocompleteInputProps`. When provided:
- Render "Clean" button instead of "Add"
- Disable when `selectedItems.length === 0`
- On click, call `onClear()`

- `onClear` is provided by the parent each time `selectedItems` changes
- Backward compatible: existing callers that don't pass `onClear` keep the "Add" button

### Alternative Approach

Add a `buttonMode: "add" | "clean"` prop that controls both the label and behavior. Requires changes to how the button's onClick works — either a new callback or conditional logic.

**Recommended: `onClear` callback approach** — cleaner separation of concerns.

## Files to Modify

| File | Change |
|------|--------|
| `apps/frontend/src/components/AutocompleteInput.tsx` | Add `onClear?: () => void` prop; render Clean button when provided |
| `apps/frontend/src/components/CompanyFilters.tsx` | Pass `onClear` for both Include and Exclude inputs |
| `apps/frontend/src/components/SkillsTagsInput.tsx` | Pass `onClear` for Required Skills |
| `apps/frontend/src/components/UserSkillsModal.tsx` | Pass `onClear` for "Add your skills" |

**Total: 4 files modified, 0 new files**

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| No way to add custom text from input if Clean replaces Add | Medium | Medium | User can still press Enter to add, or select from dropdown. If both are needed, show both buttons. |
| Breaking existing tests for AutocompleteInput | Low | Low | No existing tests for AutocompleteInput |
| "Clean" label may confuse users vs "Clear" | Low | Low | Use "Clear" if preferred — the pattern is well-known |
