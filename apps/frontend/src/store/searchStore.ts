import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FiltersState } from "@/types";

interface SearchStore extends FiltersState {
  page: number;
  pageSize: number;
  isDirty: boolean;
  setQuery: (query: string) => void;
  setSkills: (skills: string[]) => void;
  setSeniority: (seniority: string) => void;
  setRemoteMode: (remoteMode: string[]) => void;
  setCountries: (countries: string[]) => void;
  setCompanies: (companies: string[]) => void;
  setExcludeCompanies: (companies: string[]) => void;
  setTrustMin: (trustMin: number) => void;
  setSort: (sort: "trust" | "match") => void;
  setUserSkills: (skills: string[]) => void;
  setUserSeniority: (seniority: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
  commitSearch: () => void;
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
  sort: "trust",
  userSkills: [],
  userSeniority: "",
};

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      ...initialState,
      page: 1,
      pageSize: 20,
      isDirty: false,

      setQuery: (query) => set({ query, page: 1, isDirty: true }),
      setSkills: (skills) => set({ skills, page: 1, isDirty: true }),
      setSeniority: (seniority) => set({ seniority, page: 1, isDirty: true }),
      setRemoteMode: (remoteMode) => set({ remoteMode, page: 1, isDirty: true }),
      setCountries: (countries) => set({ countries, page: 1, isDirty: true }),
      setCompanies: (companies) => set({ companies, page: 1, isDirty: true }),
      setExcludeCompanies: (excludeCompanies) => set({ excludeCompanies, page: 1, isDirty: true }),
      setTrustMin: (trustMin) => set({ trustMin, page: 1, isDirty: true }),
      setSort: (sort) => set({ sort, page: 1, isDirty: true }),
      setUserSkills: (userSkills) => set({ userSkills, page: 1, isDirty: true }),
      setUserSeniority: (userSeniority) => set({ userSeniority, page: 1, isDirty: true }),
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      resetFilters: () => set({ ...initialState, page: 1, isDirty: false }),
      commitSearch: () => set({ isDirty: false }),
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
        sort: state.sort,
        userSkills: state.userSkills,
        userSeniority: state.userSeniority,
      }),
      version: 1,
      migrate: (persistedState: unknown) => {
        // Handle completely null or undefined persisted state
        if (!persistedState || typeof persistedState !== "object") {
          return {
            query: "",
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
          };
        }
        const state = persistedState as Record<string, unknown>;
        // Convert any null array fields to empty arrays
        const arrayFields = ["skills", "remoteMode", "countries", "companies", "excludeCompanies", "userSkills"] as const;
        for (const field of arrayFields) {
          if (state[field] === null) {
            state[field] = [];
          }
        }
        return state;
      },
    },
  ),
);
