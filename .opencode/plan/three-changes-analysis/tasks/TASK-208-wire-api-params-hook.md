# TASK-208 — Wire API Params & Hook Dependencies

**Layer:** frontend
**Depends on:** TASK-205 (store state), TASK-207 (component integration complete)
**Epic origin:** EPIC-02-user-skills-matchmaking (`.opencode/plan/three-changes-analysis/epics/EPIC-02-user-skills-matchmaking.md`)

## Description

Wire `userSkills` and `userSeniority` through the API client and search hook so they are sent as query parameters in job search requests.

### Step 1: Update `api.ts` — Send new params

In `apps/frontend/src/services/api.ts`, update the `searchJobs()` function to include the new fields:

```typescript
export function searchJobs(params: SearchParams): Promise<SearchResponse> {
  const queryParams: Record<string, string> = {
    q: params.q,
    page: String(params.page),
    pageSize: String(params.pageSize),
  };

  if (params.skills.length > 0) {
    queryParams.skills = params.skills.join(",");
  }

  // NEW: Send user skills (separate from required skills)
  if (params.userSkills.length > 0) {
    queryParams.userSkills = params.userSkills.join(",");
  }

  // NEW: Send user seniority
  if (params.userSeniority) {
    queryParams.userSeniority = params.userSeniority;
  }

  // ... rest unchanged
}
```

### Step 2: Update `useJobSearch.ts` — Add to dependency array

In `apps/frontend/src/hooks/useJobSearch.ts`, read the new fields from the store and include them in the search params and dependency array:

```typescript
export function useJobSearch() {
  const {
    query, skills, userSkills, userSeniority,  // ADD userSkills, userSeniority
    seniority, remoteMode, countries, companies,
    excludeCompanies, trustMin, page, pageSize
  } = useSearchStore();

  const searchParams = useMemo(
    () => ({
      q: query,
      skills,
      userSkills,          // ADD
      userSeniority,       // ADD
      seniority,
      remoteMode,
      countries,
      companies,
      excludeCompanies,
      trustMin,
      page,
      pageSize,
    }),
    [
      query, skills, userSkills, userSeniority,   // ADD
      seniority, remoteMode, countries, companies,
      excludeCompanies, trustMin, page, pageSize,
    ],
  );

  // ... rest unchanged
}
```

### Parameter Naming Convention

The API query params must match what the backend expects:

| Frontend sends as | Backend expects |
|-------------------|-----------------|
| `userSkills`      | `userSkills`    |
| `userSeniority`   | `userSeniority` |

These are already the canonical names per the backend DTO (TASK-202).

## Files to Modify

| File | Action |
|------|--------|
| `apps/frontend/src/services/api.ts` | Modify (send userSkills and userSeniority query params) |
| `apps/frontend/src/hooks/useJobSearch.ts` | Modify (add to destructured store + dependency array) |

## Complexity

**Small** (~15-20 lines added)

## Agent Allocation

**Frontend only**

## Test Requirements

- Unit test: `api.searchJobs` includes `userSkills` and `userSeniority` in query string when values are present
- Unit test: `api.searchJobs` omits `userSkills` and `userSeniority` when arrays are empty/undefined
- Unit test: `useJobSearch` debounce triggers on `userSkills` and `userSeniority` changes
