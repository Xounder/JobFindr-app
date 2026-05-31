# TASK-207 — Integrate UserSkillsInput into FiltersPanel

**Layer:** frontend
**Depends on:** TASK-205 (store state), TASK-206 (component to integrate)
**Epic origin:** EPIC-02-user-skills-matchmaking (`.opencode/plan/three-changes-analysis/epics/EPIC-02-user-skills-matchmaking.md`)

## Description

Integrate the `UserSkillsInput` component into the existing `FiltersPanel.tsx`, placing it above the `SkillsTagsInput` (Required Skills). Wire the new props through the component interface and handle the "Move all to Required Skills" logic.

### Changes to `FiltersPanel.tsx`

#### 1. Add new props to `FiltersPanelProps`

```typescript
interface FiltersPanelProps {
  filters: FiltersState;
  onUserSkillsChange: (skills: string[]) => void;      // NEW
  onUserSeniorityChange: (value: string) => void;       // NEW
  onMoveSkillsToRequired: () => void;                   // NEW
  // ... existing props unchanged
}
```

#### 2. Add `UserSkillsInput` in the render

```tsx
<UserSkillsInput
  userSkills={filters.userSkills}
  userSeniority={filters.userSeniority}
  onUserSkillsChange={onUserSkillsChange}
  onUserSeniorityChange={onUserSeniorityChange}
  onMoveToRequired={onMoveSkillsToRequired}
/>
```

Place it **above** the `SkillsTagsInput` section.

#### 3. Update `hasActiveFilters` check

Optionally consider whether `userSkills` or `userSeniority` count as "active filters" (for the "Reset all" button). These are user profile settings, not filters, so likely they should **not** be included.

### "Move all to Required Skills" Logic

The parent component/consumer handles the actual state transfer:

```typescript
const handleMoveSkillsToRequired = () => {
  // Combine existing skills with user skills (no duplicates)
  const combined = [...new Set([...filters.skills, ...filters.userSkills])]
  onUserSkillsChange([])     // Clear user skills
  onSkillsChange(combined)   // Update required skills
}
```

This logic should be in the parent component that uses `FiltersPanel` (likely the search page), not inside `FiltersPanel` itself, keeping `FiltersPanel` stateless.

### Update Parent Component (SearchPage or equivalent)

Find where `FiltersPanel` is used and wire the new handlers:

```typescript
// In the parent component
const userSkills = useSearchStore((s) => s.userSkills)
const userSeniority = useSearchStore((s) => s.userSeniority)
const setUserSkills = useSearchStore((s) => s.setUserSkills)
const setUserSeniority = useSearchStore((s) => s.setUserSeniority)

<FiltersPanel
  filters={{ ...filters, userSkills, userSeniority }}
  onUserSkillsChange={setUserSkills}
  onUserSeniorityChange={setUserSeniority}
  onMoveSkillsToRequired={() => {
    const combined = [...new Set([...skills, ...userSkills])]
    setUserSkills([])
    setSkills(combined)
  }}
  // ... existing props
/>
```

## Files to Modify

| File | Action |
|------|--------|
| `apps/frontend/src/components/FiltersPanel.tsx` | Modify (add UserSkillsInput + new props) |
| Parent component using FiltersPanel (e.g., search page) | Modify (wire new handlers) |

## Complexity

**Small** (~30-40 lines)

## Agent Allocation

**Frontend only**

## Test Requirements

- Component test: `UserSkillsInput` renders inside `FiltersPanel`
- Component test: "Move all" button triggers skill transfer
- Component test: no duplicate skills after moving
- Integration test: state flows correctly from store → component → API
