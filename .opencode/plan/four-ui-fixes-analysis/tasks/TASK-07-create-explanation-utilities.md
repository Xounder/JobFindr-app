# TASK-07 — Create Explanation Utility Functions

**Layer:** frontend
**Depends on:** (none)
**Epic origin:** EPIC-04-trust-match-explanation-text.md

## Description

Create two utility functions that generate human-readable explanation text for trust scores and match scores. These functions will be imported by `TrustExplanationModal.tsx` and `MatchExplanationModal.tsx` (TASK-08 and TASK-09).

## Files to Create

**New file:** `apps/frontend/src/utils/explain.ts`

## Function Signatures

### `buildTrustExplanation(trustScore: number, trustBreakdown: TrustBreakdown | null): string | null`

Generates a human-readable explanation paragraph for the trust score.

```tsx
import type { TrustBreakdown } from "@/types";
import { trustLabel } from "@/utils";

export function buildTrustExplanation(
  trustScore: number,
  trustBreakdown: TrustBreakdown | null,
): string | null {
  if (!trustBreakdown) return null;

  const label = trustLabel(trustScore);
  const parts: string[] = [];

  // Core score
  parts.push(`Score ${trustScore.toFixed(1)}/10 — ${label}.`);

  // Freshness
  const days = trustBreakdown.signals.daysSincePosted;
  if (days === 0) {
    parts.push("Posted today (freshness: 10/10).");
  } else if (days === 1) {
    parts.push("Posted 1 day ago (freshness: 9.0/10).");
  } else {
    parts.push(
      `Posted ${days} days ago (freshness: ${trustBreakdown.freshnessScore.toFixed(1)}/10).`,
    );
  }

  // Provider reputation
  parts.push(
    `Provider reputation: ${trustBreakdown.signals.providerReputation.toFixed(1)}/10.`,
  );

  // Company adjustment
  if (trustBreakdown.companyAdjustment !== 0) {
    const sign = trustBreakdown.companyAdjustment >= 0 ? "+" : "";
    parts.push(`Company size bonus adds ${sign}${trustBreakdown.companyAdjustment.toFixed(1)}.`);
  }

  // Known employer
  if (trustBreakdown.signals.isKnownEmployer) {
    parts.push("This employer is known in our database.");
  }

  return parts.join(" ");
}
```

### `buildMatchExplanation(matchScore: number, matchBreakdown: MatchBreakdown | null): string | null`

Generates a human-readable explanation paragraph for the match score.

```tsx
import type { MatchBreakdown } from "@/types";

function matchThresholdLabel(score: number): string {
  if (score >= 85) return "Excellent match";
  if (score >= 70) return "Good match";
  if (score >= 50) return "Fair match";
  return "Low match";
}

export function buildMatchExplanation(
  matchScore: number,
  matchBreakdown: MatchBreakdown | null,
): string | null {
  if (!matchBreakdown) return null;

  const label = matchThresholdLabel(matchScore);
  const totalSkills =
    matchBreakdown.matchedSkills.length + matchBreakdown.unmatchedSkills.length;
  const parts: string[] = [];

  // Core score
  parts.push(`${matchScore}% match — ${label}!`);

  // Skills breakdown
  if (totalSkills > 0) {
    parts.push(
      `${matchBreakdown.matchedSkills.length} of ${totalSkills} skills matched${matchBreakdown.matchedSkills.length > 0 ? ` (${matchBreakdown.matchedSkills.join(", ")})` : ""}.`,
    );
  }

  // Seniority match
  const seniorityLabels: Record<string, string> = {
    exact: "Seniority level is an exact match.",
    close: "Seniority level is a close match.",
    none: "Seniority level does not match.",
  };
  parts.push(seniorityLabels[matchBreakdown.seniorityMatch] ?? "");

  return parts.join(" ");
}
```

## Testing

Add tests in a new file `apps/frontend/src/utils/explain.test.ts`:

- Test `buildTrustExplanation` returns `null` when breakdown is `null`
- Test `buildTrustExplanation` returns a non-empty string with valid breakdown
- Test `buildTrustExplanation` includes the score and label
- Test `buildMatchExplanation` returns `null` when breakdown is `null`
- Test `buildMatchExplanation` returns a non-empty string with valid breakdown
- Test `buildMatchExplanation` includes matched skills count
- Test `buildMatchExplanation` handles empty matchedSkills gracefully
- Test `buildMatchExplanation` handles different seniority match values

## Key Constraints

- Use the existing `trustLabel()` function from `@/utils` for trust labels
- Use `import type` for type-only imports (TrustBreakdown, MatchBreakdown)
- Functions return `string | null` — return `null` when breakdown is null (no "undefined" text)
- Use `useMemo` in consuming components (TASK-08, TASK-09) — the functions themselves are pure
- Keep explanations concise (2-3 sentences per function)
- Label thresholds match the existing backend constants:
  - Match: >=85 excellent, >=70 good, >=50 fair, <50 low

## Acceptance Criteria

- [ ] `buildTrustExplanation()` returns `null` when breakdown is null
- [ ] `buildTrustExplanation()` returns human-readable text with score, label, freshness, provider reputation, and company adjustment
- [ ] `buildMatchExplanation()` returns `null` when breakdown is null
- [ ] `buildMatchExplanation()` returns human-readable text with percentage, label, matched/unmatched skills, and seniority match
- [ ] No "undefined" or "null" text appears in output
- [ ] All tests pass (`pnpm --filter frontend test`)
- [ ] TypeScript compiles cleanly

## Files to Create / Modify

- `apps/frontend/src/utils/explain.ts` — create new utility file
- `apps/frontend/src/utils/explain.test.ts` — create new test file
