# Impact Analysis — Four UI Fixes

---

## Layer Impact Matrix

| Layer | Change 1 | Change 2 | Change 3 | Change 4 |
|-------|----------|----------|----------|----------|
| **Frontend (components)** | High — Modal.tsx base class changes ripple to 3 callers | Medium — Add explanation text + optional util | Low — JobCard.tsx only | Low — SearchBar.tsx only (1 line) |
| **Frontend (utils)** | None | Low — Optional: new explanation builders | None | None |
| **Frontend (types)** | None | None (all data already typed) | None | None |
| **Backend** | None | None (Approach A) | None | None |
| **Shared packages** | None | None | None | None |
| **Tests** | Low — update modal tests if present | Low — update explanation modal tests | Low — update JobCard tests | Medium — SearchBar test validates buggy behavior; must be updated |
| **Store (Zustand)** | None | None | None (read-only access via `useSearchStore`) | None |

---

## Change 1: Detailed File Impact

| File | Change Description |
|------|-------------------|
| `apps/frontend/src/components/Modal.tsx` | Remove `w-full max-w-md` from base className; add as defaults that callers can override |
| `apps/frontend/src/components/ExpandableDescription.tsx` | Update `MODAL_DIALOG_CLASS` — simplify (remove redundant width classes since base no longer conflicts) |
| `apps/frontend/src/components/TrustExplanationModal.tsx` | Add default sizing to modal invocation (currently uses all defaults) |
| `apps/frontend/src/components/MatchExplanationModal.tsx` | Add default sizing to modal invocation (currently uses all defaults) |
| Potential test files | Check if any test asserts against modal width classes |

### Side Effects

- All modals will need explicit sizing — both Trust and Match modals currently rely on Modal's default `w-full max-w-md`
- If we forget to update Trust/Match modals, they will have zero width (no width class at all)
- **Mitigation:** Provide sensible defaults in Modal.tsx via the `dialogClassName` default parameter or extract a constant

### Refined Approach to Minimize Impact

Instead of completely removing width from Modal, set a default that can be overridden:

```tsx
// Modal.tsx — default dialogClassName provides sensible sizing
const DEFAULT_DIALOG_CLASS = "w-full max-w-md";

export function Modal({ isOpen, onClose, title, children, dialogClassName = DEFAULT_DIALOG_CLASS }: ModalProps) {
  // ...
  className={`mx-auto rounded-lg bg-white shadow-xl ${dialogClassName}`.trim()}
  // Removed w-full max-w-md from here
}
```

This way:
- Existing callers that don't pass `dialogClassName` still get `w-full max-w-md`
- `ExpandableDescription` passes its own `dialogClassName` which fully overrides
- No need to touch Trust/Match modals

---

## Change 2: Detailed File Impact

| File | Change Description |
|------|-------------------|
| `apps/frontend/src/components/TrustExplanationModal.tsx` | Add a human-readable explanation paragraph above or below the score display |
| `apps/frontend/src/components/MatchExplanationModal.tsx` | Add a human-readable explanation paragraph above or below the score display |
| `apps/frontend/src/utils/index.ts` (or new file) | Optionally add `buildTrustExplanation()` and `buildMatchExplanation()` utility functions |

### Text Generation Logic (Frontend)

**Trust explanation (pseudo-code):**
```
classification = getTrustClassification(trustScore)
lines = [
  `Score: ${trustScore}/10 — ${classification}.`,
  `Posted ${daysSincePosted} days ago (freshness: ${freshnessScore}/10).`,
  `Provider (${providerName}) reputation: ${providerScore}/10.`,
  `Company size adjustment: ${companyAdjustment >= 0 ? '+' : ''}${companyAdjustment}.`,
  isKnownEmployer ? `${companyName} is a known employer.` : '',
]
```

**Match explanation (pseudo-code):**
```
label = getMatchThresholdLabel(matchScore)
lines = [
  `${matchScore}% — ${label} match.`,
  summary,  // e.g., "3 of 5 skills match"
  matchedSkills.length > 0 ? `Matched: ${matchedSkills.join(', ')}` : '',
  unmatchedSkills.length > 0 ? `Unmatched: ${unmatchedSkills.join(', ')}` : '',
  `Seniority: ${seniorityMatch} match.`,
]
```

---

## Change 3: Detailed File Impact

| File | Change Description |
|------|-------------------|
| `apps/frontend/src/components/JobCard.tsx` | Import `useSearchStore`, read `userSkills`, add conditional styling on skill badges |

### Implementation sketch

```tsx
// In JobCard.tsx
import { useSearchStore } from "@/store/searchStore";

export function JobCard({ job }: JobCardProps) {
  const userSkills = useSearchStore((s) => s.userSkills);
  // ...
  
  // Skills rendering (lines 110-121):
  {job.skills.map((skill) => {
    const isOwned = userSkills.some((us) => us.toLowerCase() === skill.toLowerCase());
    return (
      <span
        key={skill}
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isOwned
            ? "bg-indigo-100 text-indigo-800"  // highlighted style
            : "bg-gray-100 text-gray-700"       // default style
        }`}
      >
        {skill}
      </span>
    );
  })}
}
```

---

## Change 4: Detailed File Impact

| File | Change Description |
|------|-------------------|
| `apps/frontend/src/components/SearchBar.tsx` | Remove `onSearch("")` from `handleClear` (line 107) |
| `apps/frontend/src/components/SearchBar.test.tsx` | Update test "clears input and calls onSearch with empty string on clear" to verify onSearch is NOT called |

### Breaking Changes

- This changes the expected behavior of the clear button
- Any code relying on the clear button triggering a search will break
- The existing test explicitly validates the current (buggy) behavior — **the test must be updated**
