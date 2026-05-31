import { useQuery } from "@tanstack/react-query";
import { searchJobs } from "@/services/api";
import { useSearchStore } from "@/store/searchStore";
import type { SearchResponse } from "@/types";

/**
 * Hook that reads filters from Zustand store and triggers a TanStack Query
 * for job search results. Returns the query result with jobs, loading, error states.
 * Always enabled — fetches results even on initial load (empty query).
 */
export function useJobSearch() {
  const { query, skills, seniority, companies, excludeCompanies, trustMin, page, pageSize } =
    useSearchStore();

  const searchParams = {
    q: query,
    skills,
    seniority,
    companies,
    excludeCompanies,
    trustMin,
    page,
    pageSize,
  };

  const result = useQuery<SearchResponse>({
    queryKey: ["jobs", "search", searchParams],
    queryFn: () => searchJobs(searchParams),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  return result;
}
