/**
 * Environment configuration with validation.
 * TASK-003: Setup Backend Application (env support)
 */
import 'dotenv/config'

function getEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue
}

function getEnvInt(key: string, defaultValue: number): number {
  const val = process.env[key]
  if (val === undefined) return defaultValue
  const parsed = Number.parseInt(val, 10)
  return Number.isNaN(parsed) ? defaultValue : parsed
}

export const env = {
  // Server
  PORT: getEnvInt('PORT', 3001),
  HOST: getEnv('HOST', '0.0.0.0'),
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  isDev: getEnv('NODE_ENV', 'development') === 'development',
  isProd: getEnv('NODE_ENV', 'development') === 'production',

  // CORS
  CORS_ORIGIN: getEnv('CORS_ORIGIN', 'http://localhost:5173'),

  // Rate Limiting
  RATE_LIMIT_MAX: getEnvInt('RATE_LIMIT_MAX', 100),
  RATE_LIMIT_WINDOW_MS: getEnvInt('RATE_LIMIT_WINDOW_MS', 60000),

  // Provider Timeouts
  PROVIDER_TIMEOUT_MS: getEnvInt('PROVIDER_TIMEOUT_MS', 10000),
  GUPY_TIMEOUT_MS: getEnvInt('GUPY_TIMEOUT_MS', 10000),
  GREENHOUSE_TIMEOUT_MS: getEnvInt('GREENHOUSE_TIMEOUT_MS', 30000),
  ASHBY_TIMEOUT_MS: getEnvInt('ASHBY_TIMEOUT_MS', 15000),
  LEVER_TIMEOUT_MS: getEnvInt('LEVER_TIMEOUT_MS', 15000),
  WORKDAY_TIMEOUT_MS: getEnvInt('WORKDAY_TIMEOUT_MS', 15000),
  ADZUNA_TIMEOUT_MS: getEnvInt('ADZUNA_TIMEOUT_MS', 10000),
  THEIRSTACK_TIMEOUT_MS: getEnvInt('THEIRSTACK_TIMEOUT_MS', 10000),

  // Cache TTL
  CACHE_JOBS_TTL: getEnvInt('CACHE_JOBS_TTL', 300),
  CACHE_TRUST_TTL: getEnvInt('CACHE_TRUST_TTL', 86400),
  CACHE_METADATA_TTL: getEnvInt('CACHE_METADATA_TTL', 3600),

  // Pagination
  MAX_PAGE_SIZE: getEnvInt('MAX_PAGE_SIZE', 20),

  // Company Registry
  COMPANY_REGISTRY_TTL_SECONDS: getEnvInt('COMPANY_REGISTRY_TTL_SECONDS', 86400),
  GREENHOUSE_DYNAMIC_COMPANIES: getEnv('GREENHOUSE_DYNAMIC_COMPANIES', 'true') === 'true',
  GUPY_DYNAMIC_COMPANIES: getEnv('GUPY_DYNAMIC_COMPANIES', 'true') === 'true',
  ASHBY_DYNAMIC_COMPANIES: getEnv('ASHBY_DYNAMIC_COMPANIES', 'false') === 'true',
  LEVER_DYNAMIC_COMPANIES: getEnv('LEVER_DYNAMIC_COMPANIES', 'false') === 'true',
  WORKDAY_DYNAMIC_COMPANIES: getEnv('WORKDAY_DYNAMIC_COMPANIES', 'false') === 'true',

  // Admin API
  ADMIN_JWT_SECRET: getEnv('ADMIN_JWT_SECRET', 'admin-jwt-secret-dev'),

  // Circuit Breaker
  CIRCUIT_BREAKER_FAILURE_THRESHOLD: getEnvInt('CIRCUIT_BREAKER_FAILURE_THRESHOLD', 5),
  CIRCUIT_BREAKER_SUCCESS_THRESHOLD: getEnvInt('CIRCUIT_BREAKER_SUCCESS_THRESHOLD', 2),
  CIRCUIT_BREAKER_TIMEOUT_MS: getEnvInt('CIRCUIT_BREAKER_TIMEOUT_MS', 30000),

  // Adzuna
  ADZUNA_APP_ID: getEnv('ADZUNA_APP_ID', ''),
  ADZUNA_APP_KEY: getEnv('ADZUNA_APP_KEY', ''),

  // TheirStack
  THEIRSTACK_API_KEY: getEnv('THEIRSTACK_API_KEY', ''),

  // Provider Quotas
  GREENHOUSE_QUOTA_PER_MINUTE: getEnvInt('GREENHOUSE_QUOTA_PER_MINUTE', 30),
  GREENHOUSE_QUOTA_CONCURRENT: getEnvInt('GREENHOUSE_QUOTA_CONCURRENT', 5),
  GUPY_QUOTA_PER_MINUTE: getEnvInt('GUPY_QUOTA_PER_MINUTE', 30),
  GUPY_QUOTA_CONCURRENT: getEnvInt('GUPY_QUOTA_CONCURRENT', 3),
  WORKDAY_QUOTA_PER_MINUTE: getEnvInt('WORKDAY_QUOTA_PER_MINUTE', 20),
  WORKDAY_QUOTA_CONCURRENT: getEnvInt('WORKDAY_QUOTA_CONCURRENT', 3),

  // Retry / Backoff
  RETRY_BASE_DELAY_MS: getEnvInt('RETRY_BASE_DELAY_MS', 1000),
  RETRY_MAX_DELAY_MS: getEnvInt('RETRY_MAX_DELAY_MS', 30000),
  RETRY_MAX_RETRIES: getEnvInt('RETRY_MAX_RETRIES', 3),
  RETRY_JITTER_ENABLED: getEnv('RETRY_JITTER_ENABLED', 'true') === 'true',

  // Discovery Sync
  GREENHOUSE_DISCOVERY_INTERVAL: getEnv('GREENHOUSE_DISCOVERY_INTERVAL', '0 3 * * *'),
  GREENHOUSE_DISCOVERY_MAX_PAGES: getEnvInt('GREENHOUSE_DISCOVERY_MAX_PAGES', 10),
  GREENHOUSE_DISCOVERY_PAGE_DELAY_MS: getEnvInt('GREENHOUSE_DISCOVERY_PAGE_DELAY_MS', 200),
  GUPY_DISCOVERY_INTERVAL: getEnv('GUPY_DISCOVERY_INTERVAL', '0 5 * * 0'),
  GUPY_DISCOVERY_CONCURRENCY: getEnvInt('GUPY_DISCOVERY_CONCURRENCY', 3),
  GUPY_DISCOVERY_DELAY_MS: getEnvInt('GUPY_DISCOVERY_DELAY_MS', 500),
  GUPY_DISCOVERY_MIN_JOBS: getEnvInt('GUPY_DISCOVERY_MIN_JOBS', 3),
} as const
