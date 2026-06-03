# EPIC-04: Show More as Modal

**Phase:** 4 — Show More Modal
**Changes:** Change 7 ("Show more" opens modal)
**Effort:** Small
**Dependencies:** EPIC-01 (Reusable Modal component)

---

## Objective

Replace the inline expand/collapse toggle in `ExpandableDescription` with a "Show more" button that opens the reusable Modal component. This provides a cleaner, more consistent experience for viewing full job descriptions.

---

## Deliverables

### 1. Convert ExpandableDescription to Use Modal

**File:** `apps/frontend/src/components/ExpandableDescription.tsx` (MODIFY)

- Replace the existing inline expand/collapse toggle with a "Show more" button
- Clicking "Show more" opens the Modal component with the full description text
- No "Show less" button needed — users close the modal instead
- Keep the `maxLength` trimming logic for the truncated view
- Modal shows the full `description` text as-is (no additional formatting)
- Handle edge cases: empty descriptions, short descriptions (< maxLength), very long descriptions

### 2. Modal Integration

- `ExpandableDescription` imports and uses the reusable `Modal` from EPIC-01
- Manages its own `isOpen` state for the modal
- No changes needed to `JobCard` unless prop passing is required for the modal open state

---

## Tasks

- [ ] Modify `ExpandableDescription.tsx` to replace inline toggle with "Show more" button
- [ ] Import and wire the reusable Modal component
- [ ] Add local `isOpen` state management for the modal
- [ ] Pass full description text as Modal children
- [ ] Keep `maxLength` truncation for the visible preview text
- [ ] Handle edge cases: empty description (hide "Show more"), short description (no truncation), very long description (scrollable modal)
- [ ] Update `ExpandableDescription.test.tsx` — test modal open/close, edge cases
- [ ] Update `JobCard.test.tsx` if affected by the change

---

## Acceptance Criteria

- [ ] **"Show more" button** appears for descriptions exceeding the `maxLength` threshold
- [ ] **Clicking "Show more"** opens the reusable Modal with the full description
- [ ] **No inline toggle** — the description preview does not expand inline
- [ ] **Modal closes** via overlay click, Escape key, or X button
- [ ] **Short descriptions** (< maxLength) show the full text without "Show more" button
- [ ] **Empty descriptions** do not show "Show more" button
- [ ] **Long descriptions** display correctly inside the Modal (scrollable if needed)
- [ ] All existing tests pass after changes
