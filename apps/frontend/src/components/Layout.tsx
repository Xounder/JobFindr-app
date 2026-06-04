import { useState, useCallback } from "react";
import type { ReactNode } from "react";
import { useSearchStore } from "@/store/searchStore";
import { UserSkillsModal } from "./UserSkillsModal";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);

  const {
    userSkills,
    userSeniority,
    skills,
    setUserSkills,
    setUserSeniority,
    setSkills,
  } = useSearchStore();

  const handleMoveToRequired = useCallback(
    (skillsToMove: string[]) => {
      const currentUserSkills = useSearchStore.getState().userSkills;
      const merged = [...new Set([...skills, ...skillsToMove])];
      setSkills(merged);
      setUserSkills(currentUserSkills.filter((s) => !skillsToMove.includes(s)));
    },
    [skills, setSkills, setUserSkills],
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Header ────────────────────────────────────────── */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="text-xl font-bold tracking-tight text-indigo-600">
            JobFindr
          </a>
          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-gray-500 sm:block">
              Search jobs across multiple platforms
            </p>
            <button
              type="button"
              onClick={() => setIsSkillsModalOpen(true)}
              className="relative inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            >
              <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Your Skills
              {userSkills.length > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-bold text-white">
                  {userSkills.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ──────────────────────────────────── */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* ─── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-sm text-gray-400 sm:px-6 lg:px-8">
          JobFindr — Search engine for job listings
        </div>
      </footer>

      {/* ─── User Skills Modal ─────────────────────────────── */}
      <UserSkillsModal
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        userSkills={userSkills}
        userSeniority={userSeniority}
        onUserSkillsChange={setUserSkills}
        onUserSeniorityChange={setUserSeniority}
        skills={skills}
        onMoveToRequired={handleMoveToRequired}
      />
    </div>
  );
}
