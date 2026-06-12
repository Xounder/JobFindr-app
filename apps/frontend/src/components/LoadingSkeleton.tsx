import { memo } from "react";

interface LoadingSkeletonProps {
  count?: number;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="mb-2 h-5 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-1/3 rounded bg-gray-200" />
        </div>
        <div className="flex shrink-0 gap-2">
          <div className="h-5 w-20 rounded-full bg-gray-200" />
          <div className="h-5 w-16 rounded-full bg-gray-200" />
        </div>
      </div>
      <div className="mb-3 flex flex-wrap gap-4">
        <div className="h-3.5 w-24 rounded bg-gray-200" />
        <div className="h-3.5 w-20 rounded bg-gray-200" />
        <div className="h-3.5 w-16 rounded bg-gray-200" />
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-16 rounded-full bg-gray-200" />
        <div className="h-6 w-20 rounded-full bg-gray-200" />
        <div className="h-6 w-14 rounded-full bg-gray-200" />
        <div className="h-6 w-20 rounded-full bg-gray-200" />
      </div>
      <div className="mt-3 h-4 w-full rounded bg-gray-200" />
      <div className="mt-1 h-4 w-5/6 rounded bg-gray-200" />
    </div>
  );
}

function LoadingSkeletonComponent({ count = 6 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading results">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export const LoadingSkeleton = memo(LoadingSkeletonComponent);
