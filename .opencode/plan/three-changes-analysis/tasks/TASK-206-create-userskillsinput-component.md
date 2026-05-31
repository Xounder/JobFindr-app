# TASK-206 — Create UserSkillsInput Component

**Layer:** frontend
**Depends on:** TASK-205 (store state must exist for component to read/write)
**Epic origin:** EPIC-02-user-skills-matchmaking (`.opencode/plan/three-changes-analysis/epics/EPIC-02-user-skills-matchmaking.md`)

## Description

Create a new `UserSkillsInput.tsx` component in `apps/frontend/src/components/` that provides a dedicated "Your Skills" input section with:

1. **Autocomplete + free-text input** for adding skills (reuse existing `AutocompleteInput` pattern)
2. **Skill tags display** showing added skills as removable badges
3. **Seniority selector** (radio group or dropdown) for the user's experience level
4. **"Move all to Required Skills"** button that transfers user skills to the skills filter

### Component API

```typescript
interface UserSkillsInputProps {
  userSkills: string[];
  userSeniority: string;
  onUserSkillsChange: (skills: string[]) => void;
  onUserSeniorityChange: (seniority: string) => void;
  onMoveToRequired: () => void;
}
```

### Behavior Details

- **Autocomplete**: Fetch suggestions via `useSuggestions()` hook (same as `SkillsTagsInput`)
- **Free-text**: Allow typing skill names not in the suggestion list
- **Tags**: Display skills as removable badge tags (same pattern as `SkillsTagsInput`)
- **Seniority selector**: Options: `['intern', 'junior', 'mid', 'senior', 'lead', 'principal', 'executive']`
  - Can use a dropdown or radio group — consistent with the existing `SenioritySelector` component
- **"Move all to Required Skills" button**:
  - Visible only when `userSkills.length > 0`
  - Calls `onMoveToRequired()` — the parent handles moving logic (keeping component stateless)
  - Should include a confirmation or just immediately move (keep it simple — immediate)

### Layout Position

This component will be placed **above** the `SkillsTagsInput` (Required Skills) in `FiltersPanel.tsx` (implemented in TASK-207). Visual hierarchy:

```
┌─ Filters Panel ─────────────────────┐
│ ┌─ Your Skills (NEW) ─────────────┐ │
│ │ [Autocomplete input]            │ │
│ │ [react] [typescript] [×]        │ │
│ │ Seniority: ○ Junior ○ Mid ● Sr │ │
│ │ [Move all to Required Skills]   │ │
│ └──────────────────────────────────┘ │
│ ┌─ Required Skills (existing) ────┐ │
│ │ [input] ...                     │ │
│ └──────────────────────────────────┘ │
│ ... other filters                   │
└──────────────────────────────────────┘
```

### Reuse Existing Patterns

- `AutocompleteInput.tsx` — for the skill autocomplete
- `useSuggestions()` — for fetching skill suggestions
- `SenioritySelector.tsx` — reuse (or create consistent sub-component)
- `SkillsTagsInput.tsx` — tag display pattern (but UserSkillsInput manages its own tag list)

## Files to Create/Modify

| File | Action |
|------|--------|
| `apps/frontend/src/components/UserSkillsInput.tsx` | **Create** (new component) |

## Complexity

**Medium** (~80-120 lines — new component with autocomplete, tags, seniority, move button)

## Agent Allocation

**Frontend only**

## Test Requirements

- Component test: renders autocomplete input
- Component test: typing a skill and adding it to the tag list
- Component test: removing a skill tag (clicking ×)
- Component test: "Move all" button is visible when skills exist, hidden when empty
- Component test: seniority selector renders all valid options
- Component test: "Move all" triggers `onMoveToRequired` callback
- Consider: test with `@testing-library/user-event` for realistic interaction
