import { useCallback } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, total, onPageChange }: PaginationProps) {
  const handlePrev = useCallback(() => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  }, [currentPage, totalPages, onPageChange]);

  if (totalPages <= 1) return null;

  // Generate visible page numbers (max 5 around current)
  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 pt-4" aria-label="Pagination">
      <p className="text-sm text-gray-500">
        {total} job{total !== 1 ? "s" : ""}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          className="rounded-md px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          Previous
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              page === currentPage
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className="rounded-md px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
