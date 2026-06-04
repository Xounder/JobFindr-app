# TASK-03 — Add Conditional Skill Highlighting in `JobCard.tsx`

**Layer:** frontend
**Depends on:** (none)
**Epic origin:** EPIC-02-job-card-skill-highlighting.md

## Description

Highlight skills displayed in `JobCard` that match the user's saved skills (from `useSearchStore.state.userSkills`). Matching skills should use indigo badge styling (`bg-indigo-100 text-indigo-800`), while non-matching skills remain in the default gray style (`bg-gray-100 text-gray-700`).

## Current State

- User skills are stored in `useSearchStore.state.userSkills` (Zustand with `persist` middleware → localStorage)
- Job skills come from `job.skills[]` in the API response
- Currently all skills render as identical gray badges
- Store accessor: `useSearchStore`

## Current Code (lines 112-119 of `JobCard.tsx`)

```tsx
{job.skills.length > 0 && (
  <div className="mb-3 flex flex-wrap gap-1.5">
    {job.skills.map((skill) => (
      <span
        key={skill}
        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700"
      >
        {skill}
      </span>
    ))}
  </div>
)}
```

## Deliverable

1. Import `useSearchStore` from `@/store/searchStore`
2. Read `userSkills` using a Zustand selector: `const userSkills = useSearchStore((s) => s.userSkills);`
3. Create a helper function or inline logic to check if a skill matches any user skill (case-insensitive)
4. Apply conditional className: `bg-indigo-100 text-indigo-800` for matched skills, `bg-gray-100 text-gray-700` for unmatched

## Expected Implementation Pattern

```tsx
// At top of file — add import:
import { useSearchStore } from "@/store/searchStore";

// Inside component function — add after hasBreakdown:
const userSkills = useSearchStore((s) => s.userSkills);

// Helper (in component body or as a stable callback):
const isUserSkill = (skill: string) =>
  userSkills.some((us) => us.toLowerCase() === skill.toLowerCase());

// In the JSX skills loop, update the className:
{job.skills.map((skill) => (
  <span
    key={skill}
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${
      isUserSkill(skill)
        ? "bg-indigo-100 text-indigo-800"
        : "bg-gray-100 text-gray-700"
    }`}
  >
    {skill}
  </span>
))}
```

## Key Constraints

- **TypeScript conventions**: Use `import` (not `import type`) for the store hook since it's a value import
- **No unnecessary re-renders**: Use a Zustand selector (`(s) => s.userSkills`) to only re-render when `userSkills` changes
- **Case-insensitive comparison**: `"typescript"` should match `"TypeScript"`, `"TYPESCRIPT"`, etc.
- **Empty `userSkills`**: All skills should render as default gray (no visual change)
- **NoUnusedLocals**: Make sure no unused variables
- **verbatimModuleSyntax**: Use `import type` for type-only imports, plain `import` for value imports

## Acceptance Criteria

- [ ] Skills matching user skills display with indigo badge style (`bg-indigo-100 text-indigo-800`)
- [ ] Non-matching skills display with default gray badge style (`bg-gray-100 text-gray-700`)
- [ ] Comparison is case-insensitive (e.g., `"react"` matches `"React"`, `"REACT"`)
- [ ] No skills highlighted when `userSkills` is empty
- [ ] No unnecessary re-renders — Zustand selector only triggers on `userSkills` changes
- [ ] All tests pass (`pnpm --filter frontend test`)
- [ ] TypeScript compiles cleanly (`pnpm --filter frontend build`)

## Files to Modify

- `apps/frontend/src/components/JobCard.tsx` — add import + conditional styling
