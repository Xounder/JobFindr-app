# TASK-008 — Convert "Show More" to Modal

**Layer:** Frontend
**Depends on:** TASK-001 (Reusable Modal component)
**Epic origin:** EPIC-04-show-more-modal (Phase 4 — Show More Modal)

## Description

Replace the inline expand/collapse toggle in `ExpandableDescription` with a "Show more" button that opens the reusable Modal component from TASK-001. The modal displays the full job description text. This provides a cleaner, more consistent experience — no more inline text expansion.

## Files to Modify

| File | Change |
|------|--------|
| `apps/frontend/src/components/ExpandableDescription.tsx` | Replace inline toggle with Modal trigger |
| `apps/frontend/src/components/ExpandableDescription.test.tsx` | **Create new** test file |

## Current State

```tsx
export function ExpandableDescription({ description, maxLength = 250 }: ExpandableDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > maxLength;
  const displayText = expanded || !isLong ? description : `${description.slice(0, maxLength).trimEnd()}…`;

  return (
    <div className="mb-3">
      <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{displayText}</p>
      {isLong && (
        <button type="button" onClick={toggle}>
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
```

## Specification

### 1. New State Management

Replace the single `expanded` boolean with a modal `isOpen` state:

```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
```

### 2. Truncated Preview

Keep the same truncation logic for the preview text:
```typescript
const isLong = description.length > maxLength;
const displayText = !isLong ? description : `${description.slice(0, maxLength).trimEnd()}…`;
```

### 3. Modal Integration

Replace the inline toggle button with a "Show more" button that opens the Modal:

```tsx
import { Modal } from "./Modal";

export function ExpandableDescription({ description, maxLength = 250 }: ExpandableDescriptionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isLong = description.length > maxLength;
  const displayText = !isLong ? description : `${description.slice(0, maxLength).trimEnd()}…`;

  return (
    <div className="mb-3">
      <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{displayText}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          Show more
        </button>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Job Description"
      >
        <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
          {description}
        </p>
      </Modal>
    </div>
  );
}
```

### 4. Edge Cases

- **Short descriptions** (< maxLength): Show full text without "Show more" button (no modal)
- **Empty descriptions** (""): Show nothing for text, no "Show more" button
- **Very long descriptions** (10000+ chars): Modal content should scroll; Modal should allow scrollable body
- **HTML in descriptions**: The `whitespace-pre-line` class respects line breaks; no HTML rendering needed (text is plain text)

### 5. Props Interface (No Change Needed)

```typescript
interface ExpandableDescriptionProps {
  description: string;
  maxLength?: number;
}
```

### Test File (`ExpandableDescription.test.tsx`)

Create tests covering:
- **Short description** (< maxLength): shows full text, no "Show more" button
- **Long description** (> maxLength): shows truncated text + "Show more" button
- **Empty description**: renders nothing (or empty div), no button
- **"Show more" click**: opens modal with full description text
- **Modal close**: via overlay click, Escape, X button
- **Modal title**: displays "Job Description"
- **Edge case: description exactly at maxLength**: behaves as short description (no truncation)
- **whitespace-pre-line**: line breaks are preserved in both preview and modal

## Acceptance Criteria

- [ ] "Show more" button appears only when description exceeds `maxLength`
- [ ] Clicking "Show more" opens the reusable Modal with full description text
- [ ] No inline expand/collapse — the description preview does NOT expand inline
- [ ] "Show less" button is completely removed
- [ ] Modal closes via overlay click, Escape key, or X button
- [ ] Short descriptions (< maxLength) show full text without "Show more" button
- [ ] Empty descriptions do not show "Show more" button
- [ ] Long descriptions display correctly inside the Modal (scrollable)
- [ ] Preview text still respects `maxLength` truncation with "…" suffix
- [ ] All existing tests pass
- [ ] No changes needed to `JobCard.tsx` — `ExpandableDescription` manages its own modal state
