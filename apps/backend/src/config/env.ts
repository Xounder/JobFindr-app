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

  // Cache TTL
  CACHE_JOBS_TTL: getEnvInt('CACHE_JOBS_TTL', 300),
  CACHE_TRUST_TTL: getEnvInt('CACHE_TRUST_TTL', 86400),
  CACHE_METADATA_TTL: getEnvInt('CACHE_METADATA_TTL', 3600),

  // Pagination
  MAX_PAGE_SIZE: getEnvInt('MAX_PAGE_SIZE', 20),
} as const
