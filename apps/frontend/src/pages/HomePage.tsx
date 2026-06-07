import { useCallback, useMemo, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { SortToggle } from "@/components/SortToggle";
import { FiltersPanel } from "@/components/FiltersPanel";
import { JobCard } from "@/components/JobCard";
import { Pagination } from "@/components/Pagination";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { LoadingStates } from "@/components/LoadingStates";
import { EmptyState } from "@/components/EmptyState";
import { useJobSearch } from "@/hooks";
import { useSearchStore } from "@/store/searchStore";
import type { SearchParams } from "@/types";

export default function HomePage() {
  const {
    query,
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
    setQuery,
    setSkills,
    setSeniority,
    setRemoteMode,
    setCountries,
    setCompanies,
    setExcludeCompanies,
    setTrustMin,
    setSort,
    setPage,
    resetFilters,
    commitSearch,
    isDirty,
  } = useSearchStore();

  // committedParams snapshots the store values to trigger actual search
  const [committedParams, setCommittedParams] = useState<SearchParams>(() => {
    return {
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
      page: 1,
      pageSize: 20,
    };
  });

  // Auto-search on mount (committedParams already initialized from store)
  const { data, isLoading, isFetching, isError, error } = useJobSearch(committedParams);

  // Commit store values to trigger a search
  const handleCommitSearch = useCallback(() => {
    const state = useSearchStore.getState();
    setCommittedParams({
      q: state.query,
      skills: state.skills,
      seniority: state.seniority,
      remoteMode: state.remoteMode,
      countries: state.countries,
      companies: state.companies,
      excludeCompanies: state.excludeCompanies,
      trustMin: state.trustMin,
      sort: state.sort,
      userSkills: state.userSkills,
      userSeniority: state.userSeniority,
      page: 1,
      pageSize: 20,
    });
    commitSearch();
  }, [commitSearch]);

  // Handle search bar submit — immediate search
  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      // Zustand updates are synchronous, so getState() reads updated value
      handleCommitSearch();
    },
    [setQuery, handleCommitSearch],
  );

  // Handle pagination — bypass dirty check, update committedParams directly
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    setCommittedParams((prev) => ({ ...prev, page: newPage }));
  }, [setPage]);

  // Handle sort — just update store, let Search button commit
  const handleSortChange = useCallback(
    (newSort: "trust" | "match") => {
      setSort(newSort);
    },
    [setSort],
  );

  // Filter changes only update the store (isDirty = true), Search button commits

  // Handle reset — reset filters and commit
  const handleReset = useCallback(() => {
    resetFilters();
    // Reset committedParams to initial empty state
    setCommittedParams({
      q: "",
      skills: [],
      seniority: "",
      remoteMode: [],
      countries: [],
      companies: [],
      excludeCompanies: [],
      trustMin: 0,
      sort: "trust",
      userSkills: [],
      userSeniority: "",
      page: 1,
      pageSize: 20,
    });
  }, [resetFilters]);

  const showLoading = isLoading && !data;
  const showFetching = isFetching && !isLoading;
  const showEmpty = !isLoading && !isFetching && data && data.jobs.length === 0;
  const showResults = !isLoading && !isFetching && data && data.jobs.length > 0;

  // Compute unique companies from search results
  const resultCompanies = useMemo(
    () => [...new Set((data?.jobs ?? []).map((j) => j.company).filter(Boolean))],
    [data]
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <SearchBar initialQuery={query} onSearch={handleSearch} isDirty={isDirty} />

      {/* Error banner */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          <p className="font-medium">Search failed</p>
          <p>{(error as Error)?.message ?? "An unexpected error occurred. Please try again."}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <FiltersPanel
            filters={{ query, skills, seniority, remoteMode, countries, companies, excludeCompanies, trustMin, sort, userSkills, userSeniority }}
            onSeniorityChange={(v) => setSeniority(v)}
            onRemoteModeChange={(v) => setRemoteMode(v)}
            onCountriesChange={(v) => setCountries(v)}
            onIncludeChange={(v) => setCompanies(v)}
            onExcludeChange={(v) => setExcludeCompanies(v)}
            onSkillsChange={(v) => setSkills(v)}
            onTrustMinChange={(v) => setTrustMin(v)}
            onReset={handleReset}
            resultCompanies={resultCompanies}
          />
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3">
          {/* Loading skeleton (initial load only) */}
          {showLoading && <LoadingSkeleton count={6} />}

          {/* Fetching indicator (background refetch) */}
          {showFetching && <LoadingStates isLoading={true} message="Refreshing results…" />}

          {/* Empty state */}
          {showEmpty && <EmptyState isSearching={false} />}

          {/* Sort toggle */}
          {showResults && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {data.jobs.length} of {data.total} result{data.total !== 1 ? "s" : ""}
              </p>
              <SortToggle value={sort} onChange={handleSortChange} />
            </div>
          )}

          {/* Results */}
          {showResults && (
            <div className="space-y-4">

              <div className="space-y-4">
                {data.jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              <Pagination
                currentPage={data.page}
                totalPages={data.totalPages}
                total={data.total}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
