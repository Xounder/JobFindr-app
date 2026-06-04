# TASK-006 — Frontend Trust & Match Explanation Modals

**Layer:** Frontend
**Depends on:** TASK-005 (backend must provide `matchBreakdown` and `trustBreakdown` in API response)
**Epic origin:** EPIC-04-interactive-trust-match-explanations.md (Item 5: Frontend part)
**Agent:** Senior Frontend

## Description

Convert the static trust and match badges in `JobCard` into interactive buttons that open explanation modals. Create two new modal components: `TrustExplanationModal` (shows why a job is trustworthy) and `MatchExplanationModal` (shows which skills matched, which didn't, and seniority alignment). Wire them into `JobCard` to consume the breakdown data provided by TASK-005.

## Files to Create

- `apps/frontend/src/components/TrustExplanationModal.tsx` — New component
- `apps/frontend/src/components/MatchExplanationModal.tsx` — New component

## Files to Modify

- `apps/frontend/src/types/index.ts` — Add `MatchBreakdown` and `TrustBreakdown` interfaces; update `Job` interface
- `apps/frontend/src/components/JobCard.tsx` — Convert badges to buttons, wire modals
- `apps/frontend/src/components/MatchSummary.tsx` — May need minor adjustments for breakdown awareness

## Files for Tests

- `apps/frontend/src/components/TrustExplanationModal.test.tsx` — New tests
- `apps/frontend/src/components/MatchExplanationModal.test.tsx` — New tests
- `apps/frontend/src/components/JobCard.test.tsx` — Update tests

## Deliverables

### 1. Add types (`apps/frontend/src/types/index.ts`)

```typescript
export interface MatchBreakdown {
  matchedSkills: string[];
  unmatchedSkills: string[];
  seniorityMatch: "exact" | "close" | "none";
  weightedScore: number;
  skillScoreContribution: number;
  seniorityScoreContribution: number;
}

export interface TrustBreakdown {
  providerScore: number;
  companyAdjustment: number;
  freshnessScore: number;
  signals: {
    providerReputation: string;
    companySizeBonus: number;
    isKnownEmployer: boolean;
    daysSincePosted: number;
  };
}
```

Update `Job` interface to add optional fields:
```typescript
matchBreakdown?: MatchBreakdown | null;
trustBreakdown?: TrustBreakdown | null;
```

### 2. Create `TrustExplanationModal.tsx`

Props:
```typescript
interface TrustExplanationModalProps {
  trustScore: number;
  trustLabel: string;
  trustBreakdown: TrustBreakdown | null;
  isOpen: boolean;
  onClose: () => void;
}
```

Features:
- Display overall trust score prominently with color coding (reuse the same color scheme from `JobCard`)
- Show breakdown sections when `trustBreakdown` is provided:
  - **Provider Score** — numeric value with label
  - **Company Adjustment** — show as +/- value
  - **Freshness Score** — show days since posted impact
  - **Signals** — display provider reputation, company size bonus, known employer status
- When `trustBreakdown` is null, show a fallback message: "Detailed breakdown unavailable for this job."
- Close via X button, overlay click, and Escape key (use existing `Modal` component)

### 3. Create `MatchExplanationModal.tsx`

Props:
```typescript
interface MatchExplanationModalProps {
  matchScore: number;
  matchSummary: string | null;
  matchBreakdown: MatchBreakdown | null;
  isOpen: boolean;
  onClose: () => void;
}
```

Features:
- Display match percentage prominently (large number + "% match")
- Show breakdown sections when `matchBreakdown` is provided:
  - **Matched Skills** — list in green/highlighted style
  - **Unmatched Skills** — list in gray/dimmed style
  - **Seniority Match** — badge showing "Exact", "Close", or "No match" with appropriate coloring
- When `matchBreakdown` is null, show the `matchSummary` text as fallback
- Close via X button, overlay click, and Escape key (use existing `Modal` component)

### 4. Update `JobCard.tsx`

- Convert trust badge from `<span>` to `<button>` with:
  - `onClick` handler that sets `showTrustModal = true`
  - `hover:ring-2` and `cursor-pointer` classes
  - `aria-label` describing the action
- Convert match badge from `<span>` to `<button>` with:
  - `onClick` handler that sets `showMatchModal = true`
  - `hover:ring-2` and `cursor-pointer` classes
  - `aria-label` describing the action
- Add local state: `const [showTrustModal, setShowTrustModal] = useState(false)` and similar for match
- Render `TrustExplanationModal` and `MatchExplanationModal` components
- Pass the breakdown data from `job` prop to the modals
- Import the `trustLabel` utility from `@/utils`

### 5. Update `MatchSummary.tsx`

- If `matchBreakdown` is available, consider adding a subtle visual indicator that the match badge is clickable (the `JobCard` handles the click behavior, but `MatchSummary` may need minor adjustments)

### 6. Tests

- **`TrustExplanationModal.test.tsx`**:
  - Renders with breakdown data
  - Renders fallback when breakdown is null
  - Displays correct score and label
  - Close button fires onClose
  - Overlay click fires onClose
  - Visual elements present (provider score, company adjustment, etc.)
  
- **`MatchExplanationModal.test.tsx`**:
  - Renders with breakdown data
  - Renders fallback with matchSummary when breakdown is null
  - Displays correct match percentage
  - Shows matched/unmatched skills lists
  - Shows seniority match indicator
  - Close button fires onClose
  
- **`JobCard.test.tsx`**:
  - Trust badge is a `<button>` when breakdown available
  - Match badge is a `<button>` when breakdown available
  - Clicking trust badge opens TrustExplanationModal
  - Clicking match badge opens MatchExplanationModal
  - Badges remain as `<span>` when no breakdown data (backward compatibility)

## Implementation Notes

- Use the existing `Modal` component from `@/components/Modal` for wrapping modals
- Use `import type` for type-only imports (project uses `verbatimModuleSyntax: true`)
- Use the existing color scheme from `JobCard` for trust badge colors
- For mobile responsiveness, modals should use `mx-4` and `max-w-md` like existing modals
- Graceful fallback is critical: old API responses without breakdown data must not break

## Acceptance Criteria

- [ ] Backend search response includes `matchBreakdown` and `trustBreakdown` fields for each job
- [ ] When breakdown data is available, trust badge is a clickable button
- [ ] When breakdown data is available, match badge is a clickable button
- [ ] Clicking trust badge opens `TrustExplanationModal` with detailed breakdown
- [ ] Clicking match badge opens `MatchExplanationModal` with detailed breakdown
- [ ] `TrustExplanationModal` shows: overall trust score (color-coded), provider reputation, company adjustment, freshness signals
- [ ] `MatchExplanationModal` shows: match percentage, matched skills list, unmatched skills list, seniority match level
- [ ] When breakdown data is null (old API), modals show graceful fallback with score and summary text
- [ ] All modals can be closed via X button, overlay click, or Escape key
- [ ] All existing frontend tests pass (no regressions)
- [ ] New components have dedicated test coverage
- [ ] Backward compatible: old API responses without breakdown data do not break the UI
