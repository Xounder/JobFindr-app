import { useCallback, useEffect, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { FiltersPanel } from "@/components/FiltersPanel";
import { JobCard } from "@/components/JobCard";
import { Pagination } from "@/components/Pagination";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { LoadingStates } from "@/components/LoadingStates";
import { EmptyState } from "@/components/EmptyState";
import { useJobSearch, useDebounce } from "@/hooks";
import { useSearchStore } from "@/store/searchStore";

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
    setQuery,
    setSkills,
    setSeniority,
    setRemoteMode,
    setCountries,
    setCompanies,
    setExcludeCompanies,
    setTrustMin,
    setPage,
    resetFilters,
  } = useSearchStore();

  const { data, isLoading, isFetching, isError, error } = useJobSearch();

  const [localQuery, setLocalQuery] = useState(query);

  const debouncedQuery = useDebounce(localQuery, 400);

  // Sync debounced query to store (TASK-087: Debounce Search)
  useEffect(() => {
    setQuery(debouncedQuery);
  }, [debouncedQuery, setQuery]);

  const handleSearch = useCallback(
    (q: string) => {
      setLocalQuery(q);
    },
    [],
  );

  const showLoading = isLoading;
  const showFetching = isFetching && !isLoading;
  const showEmpty = !isLoading && !isFetching && data && data.jobs.length === 0;
  const showResults = !isLoading && !isFetching && data && data.jobs.length > 0;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <SearchBar initialQuery={localQuery} onSearch={handleSearch} />

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
            filters={{ query, skills, seniority, remoteMode, countries, companies, excludeCompanies, trustMin }}
            onSeniorityChange={setSeniority}
            onRemoteModeChange={setRemoteMode}
            onCountriesChange={setCountries}
            onIncludeChange={setCompanies}
            onExcludeChange={setExcludeCompanies}
            onSkillsChange={setSkills}
            onTrustMinChange={setTrustMin}
            onReset={resetFilters}
          />
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3">
          {/* Loading skeleton */}
          {showLoading && <LoadingSkeleton count={6} />}

          {/* Fetching indicator */}
          {showFetching && <LoadingStates isLoading={true} message="Refreshing results…" />}

          {/* Empty state */}
          {showEmpty && <EmptyState isSearching={false} />}

          {/* Results */}
          {showResults && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Showing {data.jobs.length} of {data.total} result{data.total !== 1 ? "s" : ""}
              </p>

              <div className="space-y-4">
                {data.jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              <Pagination
                currentPage={data.page}
                totalPages={data.totalPages}
                total={data.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
