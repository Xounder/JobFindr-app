import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomePage from "./HomePage";

// Mock hooks
vi.mock("@/hooks", () => ({
  useJobSearch: vi.fn(),
  useSuggestions: () => ({
    data: { skills: ["TypeScript", "React"], companies: ["Google"] },
    isLoading: false,
  }),
}));

// Shared mutable reference to store state (for test manipulation)
const sharedStoreRef = vi.hoisted(() => ({ current: { isDirty: false } as Record<string, unknown> }));

vi.mock("@/store/searchStore", () => {
  const state = {
    query: "",
    skills: [] as string[],
    seniority: "",
    remoteMode: [] as string[],
    countries: [] as string[],
    companies: [] as string[],
    excludeCompanies: [] as string[],
    trustMin: 0,
    sort: "trust" as const,
    userSkills: [] as string[],
    userSeniority: "",
    page: 1,
    pageSize: 20,
    isDirty: false,
    setQuery: vi.fn(),
    setSkills: vi.fn(),
    setSeniority: vi.fn(),
    setRemoteMode: vi.fn(),
    setCountries: vi.fn(),
    setCompanies: vi.fn(),
    setExcludeCompanies: vi.fn(),
    setTrustMin: vi.fn(),
    setSort: vi.fn(),
    setUserSkills: vi.fn(),
    setUserSeniority: vi.fn(),
    setPage: vi.fn(),
    setPageSize: vi.fn(),
    resetFilters: vi.fn(),
    commitSearch: vi.fn(),
  };

  // Link the shared ref for test manipulation
  sharedStoreRef.current = state as unknown as Record<string, unknown>;

  const useSearchStore = Object.assign(
    (selector?: (s: typeof state) => unknown) => {
      if (selector) return selector(state);
      return state;
    },
    { getState: () => state },
  );

  return { useSearchStore };
});

import { useJobSearch } from "@/hooks";

const mockUseJobSearch = vi.mocked(useJobSearch);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

function createMockQueryResult(overrides: Record<string, unknown>) {
  return {
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    isFetched: false,
    isFetchedAfterMount: false,
    isPaused: false,
    isPending: false,
    isRefetching: false,
    isLoadingError: false,
    isRefetchError: false,
    isSuccess: false,
    isStale: false,
    isInitialLoading: false,
    promise: Promise.resolve(undefined),
    refetch: vi.fn(),
    fetchStatus: "idle",
    status: "pending",
    ...overrides,
  } as unknown as ReturnType<typeof useJobSearch>;
}

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (sharedStoreRef.current as Record<string, unknown>).isDirty = false;
    mockUseJobSearch.mockReturnValue(createMockQueryResult({}));
  });

  afterEach(() => {
    cleanup();
  });

  it("renders search bar", () => {
    render(<HomePage />, { wrapper: createWrapper() });
    expect(screen.getByPlaceholderText("Search jobs by title, company, or keyword…")).toBeDefined();
  });

  it("renders filters panel", () => {
    render(<HomePage />, { wrapper: createWrapper() });
    expect(screen.getByText("Filters")).toBeDefined();
  });

  it("shows fetching indicator when refetching", () => {
    mockUseJobSearch.mockReturnValue(
      createMockQueryResult({
        isLoading: false,
        isFetching: true,
        status: "success",
        data: {
          jobs: [
            {
              id: "1",
              title: "React Developer",
              company: "Test Corp",
              location: "Remote",
              description: "A great job",
              url: "https://example.com",
              skills: ["React"],
              seniority: "senior",
              salary: null,
              matchScore: 90,
              matchSummary: null,
              trustScore: 8,
              postedAt: "2024-01-01",
              source: "test",
            },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        },
        isSuccess: true,
        isFetched: true,
        isFetchedAfterMount: true,
      }),
    );

    render(<HomePage />, { wrapper: createWrapper() });
    expect(screen.getByText("Refreshing results…")).toBeDefined();
  });

  it("shows results when data is available", () => {
    mockUseJobSearch.mockReturnValue(
      createMockQueryResult({
        data: {
          jobs: [
            {
              id: "1",
              title: "React Developer",
              company: "Test Corp",
              location: "Remote",
              description: "A great job",
              url: "https://example.com",
              skills: ["React"],
              seniority: "senior",
              salary: null,
              matchScore: 90,
              matchSummary: null,
              trustScore: 8,
              postedAt: "2024-01-01",
              source: "test",
            },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        },
        isSuccess: true,
        isFetched: true,
        status: "success",
      }),
    );

    render(<HomePage />, { wrapper: createWrapper() });
    expect(screen.getByText("React Developer")).toBeDefined();
    expect(screen.getByText("Showing 1 of 1 result")).toBeDefined();
  });

  it("shows empty state when no results", () => {
    mockUseJobSearch.mockReturnValue(
      createMockQueryResult({
        data: {
          jobs: [],
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 0,
        },
        isSuccess: true,
        isFetched: true,
        status: "success",
      }),
    );

    render(<HomePage />, { wrapper: createWrapper() });
    expect(screen.getByText(/No jobs found/i)).toBeDefined();
  });

  it("shows error banner on error", () => {
    mockUseJobSearch.mockReturnValue(
      createMockQueryResult({
        isError: true,
        error: new Error("API Error"),
        status: "error",
      }),
    );

    render(<HomePage />, { wrapper: createWrapper() });
    expect(screen.getByText("Search failed")).toBeDefined();
    expect(screen.getByText("API Error")).toBeDefined();
  });

  it("passes isDirty to SearchBar", () => {
    (sharedStoreRef.current as Record<string, unknown>).isDirty = true;
    render(<HomePage />, { wrapper: createWrapper() });
    const button = screen.getByRole("button", { name: /search/i });

    expect(button.className).toContain("animate-pulse");
  });
});
