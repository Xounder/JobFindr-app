import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FiltersState } from "@/types";

interface SearchStore extends FiltersState {
  page: number;
  pageSize: number;
  setQuery: (query: string) => void;
  setSkills: (skills: string[]) => void;
  setSeniority: (seniority: string) => void;
  setRemoteMode: (remoteMode: string[]) => void;
  setCountries: (countries: string[]) => void;
  setCompanies: (companies: string[]) => void;
  setExcludeCompanies: (companies: string[]) => void;
  setTrustMin: (trustMin: number) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
}

const initialState: FiltersState = {
  query: "",
  skills: [],
  seniority: "",
  remoteMode: [],
  countries: [],
  companies: [],
  excludeCompanies: [],
  trustMin: 0,
};

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      ...initialState,
      page: 1,
      pageSize: 20,

      setQuery: (query) => set({ query, page: 1 }),
      setSkills: (skills) => set({ skills, page: 1 }),
      setSeniority: (seniority) => set({ seniority, page: 1 }),
      setRemoteMode: (remoteMode) => set({ remoteMode, page: 1 }),
      setCountries: (countries) => set({ countries, page: 1 }),
      setCompanies: (companies) => set({ companies, page: 1 }),
      setExcludeCompanies: (excludeCompanies) => set({ excludeCompanies, page: 1 }),
      setTrustMin: (trustMin) => set({ trustMin, page: 1 }),
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      resetFilters: () => set({ ...initialState, page: 1 }),
    }),
    {
      name: "jobfindr-filters",
      partialize: (state) => ({
        query: state.query,
        skills: state.skills,
        seniority: state.seniority,
        remoteMode: state.remoteMode,
        countries: state.countries,
        companies: state.companies,
        excludeCompanies: state.excludeCompanies,
        trustMin: state.trustMin,
      }),
      version: 1,
    },
  ),
);
