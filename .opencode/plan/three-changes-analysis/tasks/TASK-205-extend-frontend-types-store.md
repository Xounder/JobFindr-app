# TASK-205 — Extend Frontend Types & Store for User Skills

**Layer:** frontend
**Depends on:** TASK-201 (types must define the shape first)
**Epic origin:** EPIC-02-user-skills-matchmaking (`.opencode/plan/three-changes-analysis/epics/EPIC-02-user-skills-matchmaking.md`)

## Description

Add `userSkills` and `userSeniority` fields to the frontend `FiltersState` type and `searchStore`, with Zustand persist middleware to save values across sessions.

### Step 1: Update `FiltersState` in `apps/frontend/src/types/index.ts`

```typescript
export interface FiltersState {
  query: string;
  skills: string[];
  userSkills: string[];      // NEW: user's personal skill profile
  userSeniority: string;     // NEW: user's seniority level
  seniority: string;
  remoteMode: string[];
  countries: string[];
  companies: string[];
  excludeCompanies: string[];
  trustMin: number;
}
```

Also update `SearchParams` to include the new fields:

```typescript
export interface SearchParams {
  q: string;
  skills: string[];
  userSkills: string[];      // NEW
  userSeniority: string;     // NEW
  seniority: string;
  // ... rest unchanged
}
```

### Step 2: Update `searchStore.ts`

Add to store interface:

```typescript
interface SearchStore extends FiltersState {
  page: number;
  pageSize: number;
  setQuery: (query: string) => void;
  setSkills: (skills: string[]) => void;
  setUserSkills: (userSkills: string[]) => void;       // NEW
  setUserSeniority: (userSeniority: string) => void;   // NEW
  setSeniority: (seniority: string) => void;
  // ... rest unchanged
}
```

Add to initial state:

```typescript
const initialState: FiltersState = {
  query: "",
  skills: [],
  userSkills: [],          // NEW
  userSeniority: "",       // NEW
  seniority: "",
  // ... rest unchanged
};
```

Add setters in store creation:

```typescript
setUserSkills: (userSkills) => set({ userSkills, page: 1 }),
setUserSeniority: (userSeniority) => set({ userSeniority, page: 1 }),
```

Add to `partialize` (persist config):

```typescript
partialize: (state) => ({
  query: state.query,
  skills: state.skills,
  userSkills: state.userSkills,           // NEW
  userSeniority: state.userSeniority,     // NEW
  seniority: state.seniority,
  // ... rest unchanged
}),
```

> **Note:** Persisting user skills in localStorage is consistent with the **stateless** constraint — no server-side storage occurs.

## Files to Modify

| File | Action |
|------|--------|
| `apps/frontend/src/types/index.ts` | Modify (add `userSkills`, `userSeniority` to `FiltersState` and `SearchParams`) |
| `apps/frontend/src/store/searchStore.ts` | Modify (add fields, setters, persist middleware config) |

## Complexity

**Small** (~15-20 lines added)

## Agent Allocation

**Frontend only**

## Test Requirements

- Unit test: store initializes with empty `userSkills` and empty `userSeniority`
- Unit test: `setUserSkills(["react", "typescript"])` updates store and resets page to 1
- Unit test: `setUserSeniority("senior")` updates store and resets page to 1
- Unit test: persisted values survive store re-creation (localStorage round-trip)
