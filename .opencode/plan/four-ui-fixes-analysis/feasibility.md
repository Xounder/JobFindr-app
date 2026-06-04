# Feasibility — Four UI Fixes

---

## Change 1: "Show More" Modal Size (70% screen)

### Root Cause Analysis

**Observed behavior:** The "Show More" modal in `ExpandableDescription.tsx` does not occupy 70% of the screen. It remains small (~448px max-width from `max-w-md`).

**Root cause found in two files:**

1. **`apps/frontend/src/components/Modal.tsx` (line 89):**
   ```tsx
   className={`mx-4 w-full max-w-md rounded-lg bg-white shadow-xl ${dialogClassName}`.trim()}
   ```
   The base Modal dialog div has hardcoded `w-full` and `max-w-md` classes.

2. **`apps/frontend/src/components/ExpandableDescription.tsx` (line 10):**
   ```tsx
   const MODAL_DIALOG_CLASS = "w-[min(70vw,100%)] max-w-[min(70vw,100%)] max-h-[70vh] overflow-y-auto";
   ```
   This passes `dialogClassName` to Modal with overrides.

**Why it doesn't work:** Both `w-full` (from base) and `w-[min(70vw,100%)]` (from override) set the `width` CSS property with equal specificity (0,1,0). In Tailwind CSS, when two utility classes set the same property, the one that appears later in the generated stylesheet wins. However, Tailwind v4 processes classes via CSS cascade layers, and the order of conflicting width utilities can be unpredictable. The `w-full` may win the cascade, forcing the dialog to 100% width, which is then capped by `max-w-md` (28rem/448px), not by the intended `max-w-[min(70vw,100%)]`.

Additionally, even if width overrides work, `max-w-md` may still limit the width to 28rem depending on CSS layer ordering.

### Approach A: Remove width/max-width from Modal base (Recommended)

**Description:** Remove `w-full` and `max-w-md` from the Modal's base className. Each caller provides their own sizing via `dialogClassName`.

**Pros:**
- Clean separation of concerns — Modal is a layout shell, callers control sizing
- No CSS cascade conflicts
- All current callers can be updated to pass their own sizing

**Cons:**
- Requires updating all existing Modal usages with appropriate defaults
- Slightly more verbose per-modal usage

**Effort:** Small (3 files: Modal.tsx + 3 callers)
**Files touched:**
- `apps/frontend/src/components/Modal.tsx`
- `apps/frontend/src/components/ExpandableDescription.tsx`
- `apps/frontend/src/components/TrustExplanationModal.tsx`
- `apps/frontend/src/components/MatchExplanationModal.tsx`

### Approach B: Use `!important` overrides in ExpandableDescription

**Description:** Change the `MODAL_DIALOG_CLASS` to use Tailwind's `!` prefix to force overrides.

**Pros:**
- Minimal changes (only ExpandableDescription.tsx)
- No ripple effect on other modals

**Cons:**
- `!important` is brittle; future changes to Modal could break it again
- Arbitrary values with `!` prefix in Tailwind v4 may not work as expected (syntax: `!w-[min(70vw,100%)]`)
- Doesn't fix the architectural issue

**Effort:** Tiny
**Files touched:**
- `apps/frontend/src/components/ExpandableDescription.tsx`

### Recommendation

**Approach A** (clean architecture change). The Modal component should not impose width/max-width constraints on its callers. This is the correct fix and prevents similar issues with any future modal.

---

## Change 2: Trust & Match Explanation Modals (Readable Text)

### Data Availability Analysis

**Existing data in TrustBreakdown (already in frontend types):**
| Field | Example value |
|-------|--------------|
| `providerScore` | 7.5 |
| `companyAdjustment` | +1.2 |
| `freshnessScore` | 9.0 |
| `signals.providerReputation` | 7.5 |
| `signals.companySizeBonus` | 2.0 |
| `signals.isKnownEmployer` | true |
| `signals.daysSincePosted` | 3 |

**Existing data in MatchBreakdown (already in frontend types):**
| Field | Example value |
|-------|--------------|
| `matchedSkills` | ["TypeScript", "React"] |
| `unmatchedSkills` | ["Python"] |
| `seniorityMatch` | "exact" |
| `weightedScore` | 85 |
| `skillScoreContribution` | 60.0 |
| `seniorityScoreContribution` | 25.0 |

**Backend already computes:**
- `MatchScore.explanation.summary` — e.g., "Strong match! 3/5 skills match (60% skill coverage)."
- `MatchScore.explanation.seniorityMatch` — e.g., "Exact seniority match"

**Gap:** Neither `MatchScore.explanation` data is currently included in the API response. The `MatchBreakdown` type in both shared types and frontend types doesn't carry the explanation text.

### Approach A: Generate explanations on frontend using existing breakdown data (Recommended)

**Description:** Add a utility function (e.g., `buildTrustExplanation()`, `buildMatchExplanation()`) in the frontend that takes the breakdown objects and generates human-readable text. No backend changes needed.

**Example output:**
- Trust: *"Score 8.2/10 — Good Trust. Posted 3 days ago (freshness: 9.0/10). Provider reputation: 7.5/10. Company size bonus adds +2.0. Acme Corp is a known employer."*
- Match: *"85% match — Excellent match! 3 of your 5 skills matched (TypeScript, React, Node.js). Seniority level is an exact match."*

**Pros:**
- Zero backend changes
- All data already available in frontend store
- Can use `matchMatchThresholdLabel()` and `getTrustClassification()` for text labels

**Cons:**
- Slightly more frontend code
- Explanation text is not authoritative (generated client-side)

**Effort:** Small
**Files touched:**
- `apps/frontend/src/components/TrustExplanationModal.tsx` — add explanation paragraph
- `apps/frontend/src/components/MatchExplanationModal.tsx` — add explanation paragraph
- Optionally: `apps/frontend/src/utils/` — new utility file for explanation builders

### Approach B: Add explanation to backend response

**Description:** Extend the `MatchBreakdown` type to include `explanationSummary` and `explanationText`, compute on backend, and expose in API response.

**Pros:**
- Single source of truth for explanation
- Backend can provide richer, deterministic explanation

**Cons:**
- Requires changes in shared types (`packages/types`), backend serialization, frontend types
- More files touched, higher coordination cost

**Effort:** Medium
**Files touched:** Shared types, backend aggregation service, frontend types, both modals

### Recommendation

**Approach A** — The data already exists; we just need to format it nicely. The frontend has all the information it needs in the breakdown objects. Backend changes would add unnecessary complexity.

---

## Change 3: Skill Highlighting in Job Cards

### Current Implementation

- **User skills** stored in `useSearchStore.state.userSkills` (persisted in localStorage via Zustand `persist` middleware)
- **Job skills** come from `job.skills[]` in the API response
- **Rendering** in `JobCard.tsx` lines 110-121: simple gray badge for each skill

### Approach A: Compare and highlight in JobCard (Recommended)

**Description:** Import `useSearchStore` in `JobCard.tsx`, get `userSkills`, and for each `job.skill`, check if it exists in `userSkills`. Apply a distinct highlight style (e.g., indigo background with indigo text, matching the style used in `UserSkillsModal` for user-owned skills badges).

**Style reference from UserSkillsModal.tsx line 172:**
```tsx
className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800"
```

**Pros:**
- Only 1 file changed
- Reuses existing store pattern
- User skills already loaded from localStorage (no extra fetch)
- Clear visual feedback aligning user skills with job requirements

**Cons:**
- None identified

**Effort:** Small (1 file, ~5-10 lines changed)
**Files touched:**
- `apps/frontend/src/components/JobCard.tsx`

### Approach B: Add helper prop from parent

**Description:** Pass `userSkills` as a prop from `HomePage` → `JobCard` instead of reading from store directly.

**Pros:**
- Explicit props (some teams prefer this over store access in leaf components)

**Cons:**
- Requires prop drilling through the component tree
- More files changed
- No real benefit since `JobCard` already accesses job data from API

**Effort:** Small
**Files touched:** HomePage.tsx, JobCard.tsx

### Recommendation

**Approach A** — Direct store access in `JobCard.tsx` is the simplest approach. The component already uses data from the API response, and the store is the standard pattern for global state (Zustand).

---

## Change 4: Search Bar "X" Button Bug

### Root Cause Analysis

**Bug:** The clear button ("x") on the search bar triggers a search request immediately.

**Root cause in `apps/frontend/src/components/SearchBar.tsx` (lines 105-111):**
```tsx
const handleClear = useCallback(() => {
  setValue("");
  onSearch("");   // ← THIS LINE triggers an unwanted search
  setShowSuggestions(false);
  setHighlightedIndex(-1);
  inputRef.current?.focus();
}, [onSearch]);
```

The `onSearch("")` call immediately triggers `handleSearch` in `HomePage.tsx`, which calls `setQuery("")` and then `handleCommitSearch()`, which fires the API request.

**Why it's a bug:** The clear button should only clear the input field. The user has not pressed the "Search" button or Enter. Triggering a search on clear is unexpected behavior — the user may want to type a different query without incurring a network request.

### The Fix

**Description:** Remove `onSearch("")` from `handleClear`. The search should only be triggered when:
- User clicks the "Search" button (form submit)
- User presses Enter in the input
- User clicks a suggestion

**Effort:** Tiny (1 line removed)
**Files touched:**
- `apps/frontend/src/components/SearchBar.tsx`

**Test impact:** The test at line 69 (`"clears input and calls onSearch with empty string on clear"`) currently validates the buggy behavior. This test must be updated to expect that `onSearch` is NOT called when clearing.

### Recommendation

This is a clear bug with a one-line fix. Implement immediately.
