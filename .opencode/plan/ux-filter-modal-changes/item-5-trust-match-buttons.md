# Item 5: Trust & Match Labels as Buttons

## Current Implementation

In `JobCard.tsx`, trust and match badges are non-interactive `<span>` elements:

```tsx
{job.trustScore !== null && (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
    job.trustScore >= 9 ? "bg-green-100 text-green-800" :
    // ... color logic
  }`}>
    {trustLabel(job.trustScore)}
  </span>
)}
{job.matchScore !== null && (
  <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
    {job.matchScore}% match
  </span>
)}
```

The `Job` type contains only aggregate data:
```tsx
matchScore: number | null;
matchSummary: string | null;
trustScore: number | null;
```

No structured breakdown data exists in the API response.

## Request

- **Trust badge** (e.g., "Good Trust") → becomes a button that shows an explanation of WHY the job is or isn't trustworthy
- **Match badge** (e.g., "50% match") → becomes a button that shows an explanation of WHY the job matches the user

## Feasibility: ⚠️ Requires Backend Changes — Large Effort

### Why Backend Changes Are Needed

To show a meaningful explanation, the frontend needs structured data:

**Match breakdown:**
- Which skills matched (`matchedSkills: string[]`)
- Which skills didn't match (`unmatchedSkills: string[]`)
- Seniority match level
- Weight contributions per skill

**Trust breakdown:**
- Provider reputation score
- Company adjustments (company size, known employer)
- Freshness signals (recently posted, multiple listings)
- Individual signal breakdown

Currently this data is computed internally by `weighted-match-scoring.ts` and `trust-engine.ts` but **not returned in the search response**. The backend needs to:
1. Define breakdown types
2. Compute and include breakdown data in the response
3. Frontend reads and displays it

### Approach A: Embed Breakdown in Search Response (Recommended)

**Pros:**
- No extra API calls
- Instant modal open (no loading state)
- Data available for all jobs simultaneously

**Cons:**
- Increased response payload size
- Slightly more complex backend changes

### Approach B: Separate API Endpoint

**Pros:**
- Backend computes breakdown on-demand (lazy)
- Smaller initial search response

**Cons:**
- Extra HTTP request per modal open
- Loading state needed in modal
- More complex frontend state management

**Recommended: Approach A** — consistent with EPIC-05 design, better UX.

## Backend Changes

### New Types

```typescript
interface MatchBreakdown {
  matchedSkills: string[];
  unmatchedSkills: string[];
  seniorityMatch: "exact" | "close" | "none";
  weightedScore: number;
  skillScoreContribution: number;
  seniorityScoreContribution: number;
}

interface TrustBreakdown {
  providerScore: number;
  companyAdjustment: number;
  freshnessScore: number;
  signals: {
    providerReputation: number;
    companySizeBonus: number;
    isKnownEmployer: boolean;
    daysSincePosted: number;
  };
}
```

### Files to Modify (Backend)

| File | Change |
|------|--------|
| `packages/types/src/index.ts` (or backend types) | Add `MatchBreakdown` and `TrustBreakdown` types |
| `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts` | Return `matchBreakdown` object alongside score |
| `apps/backend/src/modules/trust/services/trust-engine.ts` | Return `trustBreakdown` object alongside score |
| `apps/backend/src/modules/search/services/aggregation-service.ts` | Pass breakdown data through to response DTO |
| Backend types/DTOs | Update job response type to include breakdown fields |

## Frontend Changes

### New Types

Add to `apps/frontend/src/types/index.ts`:
```typescript
interface MatchBreakdown {
  matchedSkills: string[];
  unmatchedSkills: string[];
  seniorityMatch: "exact" | "close" | "none";
}

interface TrustBreakdown {
  providerScore: number;
  companyAdjustment: number;
  freshnessScore: number;
}

// Update Job interface
interface Job {
  // ... existing fields
  matchBreakdown?: MatchBreakdown | null;
  trustBreakdown?: TrustBreakdown | null;
}
```

### New Components

**TrustExplanationModal.tsx:**
- Props: `trustScore`, `trustLabel`, `trustBreakdown`, `isOpen`, `onClose`
- Shows overall score with color
- Breakdown details: provider score, company adjustment, freshness
- Graceful fallback if `trustBreakdown` is null

**MatchExplanationModal.tsx:**
- Props: `matchScore`, `matchSummary`, `matchBreakdown`, `isOpen`, `onClose`
- Shows match percentage prominently
- Matched skills in green, unmatched in gray
- Seniority match indicator
- Fallback to `matchSummary` if breakdown unavailable

### JobCard Changes

Convert `<span>` to `<button>` with click handler:

```tsx
// Trust badge
{job.trustScore !== null && (
  <button
    type="button"
    onClick={() => setShowTrustModal(true)}
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer hover:ring-2 hover:ring-offset-1 ${
      /* color logic */
    }`}
  >
    {trustLabel(job.trustScore)}
  </button>
)}
```

Add local state and modals in `JobCard`:
```tsx
const [showTrustModal, setShowTrustModal] = useState(false);
const [showMatchModal, setShowMatchModal] = useState(false);
```

### Files to Modify (Frontend)

| File | Change |
|------|--------|
| `apps/frontend/src/types/index.ts` | Add breakdown types, update Job interface |
| `apps/frontend/src/components/JobCard.tsx` | Convert badges to buttons; wire modals |
| `apps/frontend/src/components/JobCard.test.tsx` | Update tests |

### Files to Create (Frontend)

| File | Description |
|------|-------------|
| `apps/frontend/src/components/TrustExplanationModal.tsx` | Trust breakdown display |
| `apps/frontend/src/components/MatchExplanationModal.tsx` | Match breakdown display |

### Tests to Create/Update

| File | Action |
|------|--------|
| `apps/frontend/src/components/JobCard.test.tsx` | Update: test buttons exist, modals open/close |
| `apps/frontend/src/components/TrustExplanationModal.test.tsx` | New: test display with/without breakdown |
| `apps/frontend/src/components/MatchExplanationModal.test.tsx` | New: test display with/without breakdown |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Backend breakdown data increases response payload significantly | Medium | Medium | Keep breakdown compact — arrays of skill names, not full objects. Monitor with logging. |
| Backend decomposition is complex — match/trust engines need refactoring | Medium | Medium | The data is already computed internally; just returning it in a structured format. |
| Frontend shows empty state if breakdown is null (old API version) | Low | Medium | Design graceful fallback: "Detailed breakdown unavailable" + show score + summary text |
| Button styling may confuse users (badge doesn't look clickable) | Low | Medium | Add hover effect (`hover:ring-2`), cursor style, small info icon |
| MatchSummary component overlaps with new MatchExplanationModal | Low | Low | `MatchSummary` shows text summary inline; modal shows visual breakdown. They complement each other. |
| EPIC-05 was previously deferred — this brings it back into scope | — | — | Confirm with user that this is intended |
