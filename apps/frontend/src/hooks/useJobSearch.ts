import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchJobs } from "@/services/api";
import { useSearchStore } from "@/store/searchStore";
import { useDebounce } from "./useDebounce";
import type { SearchResponse } from "@/types";

const DEBOUNCE_MS = 300;

/**
 * Hook that reads filters from Zustand store and triggers a debounced TanStack Query
 * for job search results. Returns the query result with jobs, loading, error states.
 * All filter changes are debounced by 300ms to avoid excessive API calls.
 * UI remains responsive — selected values show immediately in filter controls.
 */
export function useJobSearch() {
  const { query, skills, seniority, remoteMode, countries, companies, excludeCompanies, trustMin, sort, userSkills, userSeniority, page, pageSize } =
    useSearchStore();

  const searchParams = useMemo(
    () => ({
      q: query,
      skills,
      seniority,
      remoteMode,
      countries,
      companies,
      excludeCompanies,
      trustMin,
      sort,
      userSkills,
      userSeniority,
      page,
      pageSize,
    }),
    [query, skills, seniority, remoteMode, countries, companies, excludeCompanies, trustMin, sort, userSkills, userSeniority, page, pageSize],
  );

  const debouncedParams = useDebounce(searchParams, DEBOUNCE_MS);

  const result = useQuery<SearchResponse>({
    queryKey: ["jobs", "search", debouncedParams],
    queryFn: () => searchJobs(debouncedParams),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  return result;
}
