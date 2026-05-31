import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchJobs } from "./api.ts";
import type { SearchParams } from "@/types";

const BASE_URL = "http://localhost:3001";

function makeDefaultParams(overrides?: Partial<SearchParams>): SearchParams {
  return {
    q: "",
    skills: [],
    seniority: "",
    remoteMode: [],
    countries: [],
    companies: [],
    excludeCompanies: [],
    trustMin: 0,
    page: 1,
    pageSize: 20,
    userSkills: [],
    userSeniority: "",
    ...overrides,
  };
}

describe("searchJobs — userSkills / userSeniority query params", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            jobs: [],
            total: 0,
            page: 1,
            pageSize: 20,
            totalPages: 0,
          }),
      }),
    );
  });

  it("sends userSkills as comma-separated query param", async () => {
    const params = makeDefaultParams({
      userSkills: ["TypeScript", "React"],
    });

    await searchJobs(params);

    const fetchMock = vi.mocked(fetch);
    const url = new URL(fetchMock.mock.calls[0]![0] as string, BASE_URL);
    expect(url.searchParams.get("userSkills")).toBe("TypeScript,React");
  });

  it("sends userSeniority as query param", async () => {
    const params = makeDefaultParams({
      userSeniority: "senior",
    });

    await searchJobs(params);

    const fetchMock = vi.mocked(fetch);
    const url = new URL(fetchMock.mock.calls[0]![0] as string, BASE_URL);
    expect(url.searchParams.get("userSeniority")).toBe("senior");
  });

  it("omits userSkills when empty", async () => {
    const params = makeDefaultParams({
      userSkills: [],
    });

    await searchJobs(params);

    const fetchMock = vi.mocked(fetch);
    const url = new URL(fetchMock.mock.calls[0]![0] as string, BASE_URL);
    expect(url.searchParams.has("userSkills")).toBe(false);
  });

  it("omits userSeniority when empty", async () => {
    const params = makeDefaultParams({
      userSeniority: "",
    });

    await searchJobs(params);

    const fetchMock = vi.mocked(fetch);
    const url = new URL(fetchMock.mock.calls[0]![0] as string, BASE_URL);
    expect(url.searchParams.has("userSeniority")).toBe(false);
  });

  it("sends both userSkills and userSeniority together", async () => {
    const params = makeDefaultParams({
      userSkills: ["Python", "Go"],
      userSeniority: "lead",
    });

    await searchJobs(params);

    const fetchMock = vi.mocked(fetch);
    const url = new URL(fetchMock.mock.calls[0]![0] as string, BASE_URL);
    expect(url.searchParams.get("userSkills")).toBe("Python,Go");
    expect(url.searchParams.get("userSeniority")).toBe("lead");
  });
});
