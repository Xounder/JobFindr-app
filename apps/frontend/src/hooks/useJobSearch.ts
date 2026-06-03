import { useQuery } from "@tanstack/react-query";
import { searchJobs } from "@/services/api";
import type { SearchParams, SearchResponse } from "@/types";

/**
 * Hook that accepts search params and triggers a TanStack Query
 * for job search results. Returns the query result with jobs, loading, error states.
 * Does NOT debounce — that responsibility is in the caller (HomePage).
 */
export function useJobSearch(params: SearchParams) {
  const result = useQuery<SearchResponse>({
    queryKey: ["jobs", "search", params],
    queryFn: () => searchJobs(params),
    staleTime: 30_000,
  });

  return result;
}
