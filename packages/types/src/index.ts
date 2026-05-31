export type {
  NormalizedJob,
  SalaryInfo,
  SalaryPeriod,
  SeniorityLevel,
  RemoteMode,
} from './normalized-job.ts'

export type {
  SearchJobsInput,
  ValidatedSearchInput,
  SearchSortOption,
} from './search-dto.ts'

export type {
  JobProvider,
  ProviderType,
  ProviderMetadata,
  RateLimitInfo,
  ProviderReputation,
  ProviderResult,
  AggregatedProviderResult,
  ProviderHealthStatus,
  Normalizer,
} from './provider.types.ts'

export type {
  MatchScore,
  MatchExplanation,
  MatchThresholdLabel,
} from './match.types.ts'
export { MATCH_THRESHOLDS, getMatchThresholdLabel } from './match.types.ts'

export type {
  TrustScore,
  TrustSignals,
  CompanySizeCategory,
  TrustVisibility,
  TrustClassification,
} from './trust.types.ts'
export { TRUST_THRESHOLDS, getTrustVisibility, getTrustClassification } from './trust.types.ts'

export type {
  RankingWeights,
  RankingResult,
  RankingBreakdown,
} from './ranking.types.ts'
export { DEFAULT_RANKING_WEIGHTS } from './ranking.types.ts'

export type {
  ApiResponse,
  ApiErrorResponse,
  PaginationMeta,
  PartialResponseMeta,
} from './api.types.ts'
