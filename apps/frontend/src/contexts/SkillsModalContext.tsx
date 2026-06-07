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