import type { SearchParams, SearchResponse } from "@/types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.error?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function searchJobs(params: SearchParams): Promise<SearchResponse> {
  const queryParams: Record<string, string> = {
    q: params.q,
    page: String(params.page),
    pageSize: String(params.pageSize),
  };

  if (params.skills.length > 0) {
    queryParams.skills = params.skills.join(",");
  }

  if (params.seniority) {
    queryParams.seniority = params.seniority;
  }

  if (params.remoteMode.length > 0) {
    queryParams.remoteMode = params.remoteMode.join(",");
  }

  if (params.countries.length > 0) {
    queryParams.countries = params.countries.join(",");
  }

  if (params.companies.length > 0) {
    queryParams.companies = params.companies.join(",");
  }

  if (params.excludeCompanies.length > 0) {
    queryParams.excludedCompanies = params.excludeCompanies.join(",");
  }

  if (params.trustMin > 0) {
    queryParams.minTrustScore = String(params.trustMin);
  }

  if (params.sort) {
    queryParams.sort = params.sort;
  }

  if (params.userSkills.length > 0) {
    queryParams.userSkills = params.userSkills.join(",");
  }

  if (params.userSeniority) {
    queryParams.userSeniority = params.userSeniority;
  }

  return request<SearchResponse>("/jobs/search", queryParams);
}

export interface SuggestionsResponse {
  skills: string[];
  companies: string[];
  titles: string[];
}

export function fetchSuggestions(): Promise<SuggestionsResponse> {
  return request<SuggestionsResponse>("/jobs/suggestions");
}
