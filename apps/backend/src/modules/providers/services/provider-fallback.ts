/**
 * Provider fallback system.
 * TASK-024: Create Provider Fallback System
 *
 * Handles provider failures gracefully with fallback strategies.
 */
import type { JobProvider, NormalizedJob, ValidatedSearchInput } from '@jobfindr/types'
import { logger } from '../../../shared/logger/logger.ts'

export type FallbackStrategy = 'skip' | 'retry' | 'degraded'

export type FallbackConfig = {
  strategy: FallbackStrategy
  maxRetries: number
  fallbackProviders: string[]
}

const defaultConfig: FallbackConfig = {
  strategy: 'skip',
  maxRetries: 1,
  fallbackProviders: [],
}

/**
 * Execute a provider with fallback support.
 */
export async function withProviderFallback(
  provider: JobProvider,
  input: ValidatedSearchInput,
  allProviders: Map<string, JobProvider>,
  config: Partial<FallbackConfig> = {}
): Promise<NormalizedJob[]> {
  const cfg = { ...defaultConfig, ...config }

  try {
    return await provider.search(input)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    logger.warn(`Provider ${provider.name} failed, applying fallback`, {
      module: 'provider-fallback',
      error: errorMessage,
      data: { strategy: cfg.strategy },
    })

    switch (cfg.strategy) {
      case 'retry': {
        for (let attempt = 1; attempt <= cfg.maxRetries; attempt++) {
          try {
            logger.info(`Retry ${attempt}/${cfg.maxRetries} for ${provider.name}`, {
              module: 'provider-fallback',
            })
            return await provider.search(input)
          } catch {
            // Continue on failure
          }
        }
        return []
      }

      case 'degraded': {
        for (const fallbackName of cfg.fallbackProviders) {
          const fallbackProvider = allProviders.get(fallbackName)
          if (fallbackProvider && fallbackProvider.name !== provider.name) {
            try {
              logger.info(`Trying fallback provider ${fallbackName}`, {
                module: 'provider-fallback',
              })
              return await fallbackProvider.search(input)
            } catch {
              // Continue to next fallback
            }
          }
        }
        return []
      }

      case 'skip':
      default:
        return []
    }
  }
}
