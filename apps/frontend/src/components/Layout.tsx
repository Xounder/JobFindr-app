import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Header ────────────────────────────────────────── */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="text-xl font-bold tracking-tight text-indigo-600">
            JobFindr
          </a>
          <p className="hidden text-sm text-gray-500 sm:block">
            Search jobs across multiple platforms
          </p>
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
    </div>
  );
}
