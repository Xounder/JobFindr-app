/**
 * Dynamic provider loader.
 * TASK-019: Create Provider Loader
 *
 * Discovers and loads all available providers.
 * Integrates with health monitoring.
 */
import type { JobProvider, ProviderMetadata } from '@jobfindr/types'
import { providerRegistry } from '../domain/provider-registry.ts'
import { logger } from '../../../shared/logger/logger.ts'

export class ProviderLoader {
  /**
   * Load and register all available providers.
   */
  async loadAll(): Promise<void> {
    const loaders: Array<{ name: string; load: () => Promise<JobProvider> }> = []

    // Dynamic imports for each provider
    try {
      const { createGreenhouseProvider } = await import('../greenhouse/greenhouse-provider.ts')
      loaders.push({ name: 'greenhouse', load: createGreenhouseProvider })
    } catch (error) {
      logger.warn('Failed to load Greenhouse provider', {
        module: 'provider-loader',
        error: error instanceof Error ? error.message : 'Unknown',
      })
    }

    try {
      const { createGupyProvider } = await import('../gupy/gupy-provider.ts')
      loaders.push({ name: 'gupy', load: createGupyProvider })
    } catch (error) {
      logger.warn('Failed to load Gupy provider', {
        module: 'provider-loader',
        error: error instanceof Error ? error.message : 'Unknown',
      })
    }

    try {
      const { createAshbyProvider } = await import('../ashby/ashby-provider.ts')
      loaders.push({ name: 'ashby', load: createAshbyProvider })
    } catch (error) {
      logger.warn('Failed to load Ashby provider', {
        module: 'provider-loader',
        error: error instanceof Error ? error.message : 'Unknown',
      })
    }

    try {
      const { createLeverProvider } = await import('../lever/lever-provider.ts')
      loaders.push({ name: 'lever', load: createLeverProvider })
    } catch (error) {
      logger.warn('Failed to load Lever provider', {
        module: 'provider-loader',
        error: error instanceof Error ? error.message : 'Unknown',
      })
    }

    try {
      const { createWorkdayProvider } = await import('../workday/workday-provider.ts')
      loaders.push({ name: 'workday', load: createWorkdayProvider })
    } catch (error) {
      logger.warn('Failed to load Workday provider', {
        module: 'provider-loader',
        error: error instanceof Error ? error.message : 'Unknown',
      })
    }

    // Register all loaded providers
    for (const { name, load } of loaders) {
      try {
        const provider = await load()
        const metadata: Partial<ProviderMetadata> = {
          providerType: provider.providerType,
        }
        providerRegistry.register(provider, metadata)
      } catch (error) {
        logger.warn(`Failed to register ${name} provider`, {
          module: 'provider-loader',
          error: error instanceof Error ? error.message : 'Unknown',
        })
      }
    }

    logger.info(`Provider loader completed: ${providerRegistry.count} providers registered`, {
      module: 'provider-loader',
      data: { names: providerRegistry.getNames() },
    })
  }

  /**
   * Load a specific provider by name.
   */
  async loadByName(name: string): Promise<boolean> {
    const providerMap: Record<string, () => Promise<JobProvider>> = {
      greenhouse: async () => {
        const m = await import('../greenhouse/greenhouse-provider.ts')
        return m.createGreenhouseProvider()
      },
      gupy: async () => {
        const m = await import('../gupy/gupy-provider.ts')
        return m.createGupyProvider()
      },
      ashby: async () => {
        const m = await import('../ashby/ashby-provider.ts')
        return m.createAshbyProvider()
      },
      lever: async () => {
        const m = await import('../lever/lever-provider.ts')
        return m.createLeverProvider()
      },
      workday: async () => {
        const m = await import('../workday/workday-provider.ts')
        return m.createWorkdayProvider()
      },
    }

    const loader = providerMap[name]
    if (!loader) return false

    try {
      const provider = await loader()
      const metadata: Partial<ProviderMetadata> = {
        providerType: provider.providerType,
      }
      providerRegistry.register(provider, metadata)
      return true
    } catch (error) {
      logger.warn(`Failed to load provider ${name}`, {
        module: 'provider-loader',
        error: error instanceof Error ? error.message : 'Unknown',
      })
      return false
    }
  }
}
