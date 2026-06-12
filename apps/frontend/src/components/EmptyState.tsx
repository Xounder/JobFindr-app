import { memo } from "react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  isSearching?: boolean;
}

function EmptyStateComponent({
  title = "No jobs found",
  description = "Try adjusting your search terms or filters to find more results.",
  isSearching = false,
}: EmptyStateProps) {
  if (isSearching) return null;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
        <svg
          className="h-8 w-8 text-indigo-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>
    </div>
  );
}

export const EmptyState = memo(EmptyStateComponent);
