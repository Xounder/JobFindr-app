# TASK-03-frontend: "Your Skills" Filter Clickable — SkillsModalContext

## Depends on
None

## Description
Make the "Your Skills" section in the sidebar filter panel clickable. When clicked, it should open the same `UserSkillsModal` that is currently accessible only from the header button in `Layout.tsx`.

To avoid prop drilling, create a React Context (`SkillsModalContext`) that manages modal open/close state. The `Layout` component renders the modal based on context state, and `FiltersPanel` calls `openSkillsModal()` from context on click. This enables any component to trigger the modal without prop drilling.

## Technical Details

### Files to modify
- `apps/frontend/src/contexts/SkillsModalContext.tsx` — **New file**: Create context + provider with `openSkillsModal()` / `closeSkillsModal()` methods
- `apps/frontend/src/main.tsx` — Wrap `<App>` with `<SkillsModalProvider>`
- `apps/frontend/src/components/Layout.tsx` — Replace local `isSkillsModalOpen` state with context; pass `filters` props to modal from store
- `apps/frontend/src/components/FiltersPanel.tsx` — Add `onClick` handler on "Your Skills" section calling `openSkillsModal()` from context

### Acceptance criteria
- `SkillsModalContext` provides `openSkillsModal()` and `closeSkillsModal()` functions via React context
- `SkillsModalProvider` wraps the entire app in `main.tsx`
- `Layout.tsx` renders `UserSkillsModal` based on context `isOpen` state (not local state)
- Clicking the "Your Skills" section in `FiltersPanel` opens the modal
- The header "Your Skills" button in `Layout.tsx` continues to open the modal (existing behavior preserved)
- Only one modal instance exists at a time
- All existing tests pass (`Layout.test.tsx`, `FiltersPanel.test.tsx`, `UserSkillsModal.test.tsx`)
- Test components wrapped with `SkillsModalProvider` where needed

## Implementation Approach

1. **Create `SkillsModalContext.tsx`**:
   ```typescript
   import { createContext, useContext, useState, type ReactNode } from "react";

   interface SkillsModalContextValue {
     isOpen: boolean;
     openSkillsModal: () => void;
     closeSkillsModal: () => void;
   }

   const SkillsModalContext = createContext<SkillsModalContextValue | null>(null);

   export function SkillsModalProvider({ children }: { children: ReactNode }) {
     const [isOpen, setIsOpen] = useState(false);
     const openSkillsModal = () => setIsOpen(true);
     const closeSkillsModal = () => setIsOpen(false);
     return (
       <SkillsModalContext.Provider value={{ isOpen, openSkillsModal, closeSkillsModal }}>
         {children}
       </SkillsModalContext.Provider>
     );
   }

   export function useSkillsModal(): SkillsModalContextValue {
     const ctx = useContext(SkillsModalContext);
     if (!ctx) throw new Error("useSkillsModal must be used within SkillsModalProvider");
     return ctx;
   }
   ```

2. **Wire provider in `main.tsx`**:
   - Wrap `<App>` with `<SkillsModalProvider>` inside `BrowserRouter`, `QueryClientProvider` chain
   - Ensure order: `StrictMode > BrowserRouter > QueryClientProvider > SkillsModalProvider > App`

3. **Update `Layout.tsx`**:
   - Remove `useState(false)` for `isSkillsModalOpen`
   - Import and use `useSkillsModal()` hook
   - Read `isOpen` from context
   - Header button's `onClick` calls `openSkillsModal()` from context
   - Remove all props from `<UserSkillsModal>` that come from local state — modal is now controlled by context + store data directly

4. **Update `FiltersPanel.tsx`**:
   - Import `useSkillsModal()` hook
   - Find the "Your Skills" section (reads `filters.userSkills` and `filters.userSeniority`)
   - Wrap the section or add an `onClick` handler that calls `openSkillsModal()`
   - Add cursor pointer styling to indicate it's clickable
   - Keep the current display content unchanged

5. **Test updates**:
   - Wrap test components that use `useSkillsModal()` with `SkillsModalProvider`
   - Add the provider in test setup if it affects multiple test files

## Testing

### Unit tests
- `SkillsModalContext.test.tsx`: Verify open/close state management
- `Layout.test.tsx`: Verify modal opens/closes from header button using context
- `FiltersPanel.test.tsx`: Verify clicking "Your Skills" section opens modal

### Manual verification
- Run `pnpm --filter frontend test` and confirm all tests pass
- Manual: Click "Your Skills" in sidebar → modal opens
- Manual: Click header "Your Skills" button → modal opens
- Manual: Close modal → both sources work again

## References
- `.opencode/plan/match-filters-analysis/feasibility.md` — Change 2: "Your Skills" Filter Clickable
- `.opencode/plan/match-filters-analysis/impact-analysis.md` — Layer impact details
- `.opencode/plan/match-filters-analysis/risks.md` — Risk register for Change 2
- `apps/frontend/src/components/Layout.tsx` — Current modal state management
- `apps/frontend/src/components/FiltersPanel.tsx` — Current "Your Skills" display section
- `apps/frontend/src/components/UserSkillsModal.tsx` — The modal component
- `apps/frontend/src/main.tsx` — App entry point
