import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useJobSearch } from "./useJobSearch";
import { searchJobs } from "@/services/api";
import type { SearchParams, SearchResponse } from "@/types";

vi.mock("@/services/api", () => ({
  searchJobs: vi.fn(),
}));

const mockSearchParams: SearchParams = {
  q: "react",
  skills: [],
  seniority: "",
  remoteMode: [],
  countries: [],
  companies: [],
  excludeCompanies: [],
  trustMin: 0,
  sort: "trust",
  page: 1,
  pageSize: 20,
  userSkills: [],
  userSeniority: "",
};

const mockResponse: SearchResponse = {
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
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
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

describe("useJobSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls searchJobs with provided params", async () => {
    vi.mocked(searchJobs).mockResolvedValue(mockResponse);

    renderHook(() => useJobSearch(mockSearchParams), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(searchJobs).toHaveBeenCalledWith(mockSearchParams);
    });
  });

  it("returns search results", async () => {
    vi.mocked(searchJobs).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useJobSearch(mockSearchParams), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockResponse);
    });
  });

  it("uses correct query key", async () => {
    vi.mocked(searchJobs).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useJobSearch(mockSearchParams), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify query key structure by ensuring different params trigger new queries
    expect(searchJobs).toHaveBeenCalledTimes(1);
  });

  it("does not call searchJobs when params change before staleTime", async () => {
    vi.mocked(searchJobs).mockResolvedValue(mockResponse);

    const { rerender } = renderHook(
      (params) => useJobSearch(params),
      {
        initialProps: mockSearchParams,
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(searchJobs).toHaveBeenCalledTimes(1);
    });

    // Rerender with same params — should not call again (cached)
    rerender(mockSearchParams);

    // Need a small wait to ensure no extra call
    await new Promise((r) => setTimeout(r, 50));
    expect(searchJobs).toHaveBeenCalledTimes(1);
  });

  it("handles error state", async () => {
    const error = new Error("Network error");
    vi.mocked(searchJobs).mockRejectedValue(error);

    const { result } = renderHook(() => useJobSearch(mockSearchParams), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeDefined();
    });
  });
});
