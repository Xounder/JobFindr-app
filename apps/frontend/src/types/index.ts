// ─── Job Types ───────────────────────────────────────────────────────────────

export type SalaryInfo = {
  min: number;
  max: number;
  currency: string;
  period: "yearly" | "monthly" | "hourly";
};

export interface MatchBreakdown {
  matchedSkills: string[];
  unmatchedSkills: string[];
  seniorityMatch: "exact" | "close" | "none";
  weightedScore: number;
  skillScoreContribution: number;
  seniorityScoreContribution: number;
  userSeniority?: string;
  jobSeniority?: string;
}

export interface TrustBreakdown {
  providerScore: number;
  companyAdjustment: number;
  freshnessScore: number;
  signals: {
    providerReputation: number;
    companySizeBonus: number;
    isKnownEmployer: boolean;
    daysSincePosted: number;
  };
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  skills: string[];
  seniority: string;
  salary: SalaryInfo | null;
  matchScore: number | null;
  matchSummary: string | null;
  trustScore: number | null;
  postedAt: string;
  source: string;
  matchBreakdown?: MatchBreakdown | null;
  trustBreakdown?: TrustBreakdown | null;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchParams {
  q: string;
  skills: string[];
  seniority: string;
  remoteMode: string[];
  countries: string[];
  companies: string[];
  excludeCompanies: string[];
  trustMin: number;
  sort: "trust" | "match";
  page: number;
  pageSize: number;
  userSkills: string[];
  userSeniority: string;
}

export interface SearchResponse {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface FiltersState {
  query: string;
  skills: string[];
  seniority: string;
  remoteMode: string[];
  countries: string[];
  companies: string[];
  excludeCompanies: string[];
  trustMin: number;
  sort: "trust" | "match";
  userSkills: string[];
  userSeniority: string;
}
