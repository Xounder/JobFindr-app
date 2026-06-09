import type { JobProvider, ProviderMetadata } from '@jobfindr/types'
import { providerRegistry } from '../domain/provider-registry.ts'
import type { CompanyRegistry } from '../config/company-registry.ts'
import { logger } from '../../../shared/logger/logger.ts'

export class ProviderLoader {
  private registry: CompanyRegistry | undefined

  constructor(registry?: CompanyRegistry) {
    this.registry = registry
  }

  async loadAll(): Promise<void> {
    const loaders: Array<{ name: string; load: () => Promise<JobProvider> }> = []

    try {
      const { createGreenhouseProvider } = await import('../greenhouse/greenhouse-provider.ts')
      const companies = this.registry
        ? (await this.registry.getEnabled('greenhouse')).map(c => ({
            name: c.name,
            boardToken: (c.config as { boardToken: string }).boardToken,
          }))
        : undefined
      loaders.push({ name: 'greenhouse', load: () => createGreenhouseProvider(companies) })
    } catch (error) {
      logger.warn('Failed to load Greenhouse provider', {
        module: 'provider-loader',
        error: error instanceof Error ? error.message : 'Unknown',
      })
    }

    try {
      const { createGupyProvider } = await import('../gupy/gupy-provider.ts')
      const companies = this.registry
        ? (await this.registry.getEnabled('gupy')).map(c => ({
            careerPageId: (c.config as { careerPageId: number }).careerPageId,
            careerPageName: (c.config as { careerPageName: string }).careerPageName,
          }))
        : undefined
      loaders.push({ name: 'gupy', load: () => createGupyProvider(companies) })
    } catch (error) {
      logger.warn('Failed to load Gupy provider', {
        module: 'provider-loader',
        error: error instanceof Error ? error.message : 'Unknown',
      })
    }

    try {
      const { createAshbyProvider } = await import('../ashby/ashby-provider.ts')
      const companies = this.registry
        ? (await this.registry.getEnabled('ashby')).map(c => ({
            name: c.name,
            board: (c.config as { board: string }).board,
          }))
        : undefined
      loaders.push({ name: 'ashby', load: () => createAshbyProvider(companies) })
    } catch (error) {
      logger.warn('Failed to load Ashby provider', {
        module: 'provider-loader',
        error: error instanceof Error ? error.message : 'Unknown',
      })
    }

    try {
      const { createLeverProvider } = await import('../lever/lever-provider.ts')
      const companies = this.registry
        ? (await this.registry.getEnabled('lever')).map(c => ({
            name: c.name,
            slug: (c.config as { slug: string }).slug,
          }))
        : undefined
      loaders.push({ name: 'lever', load: () => createLeverProvider(companies) })
    } catch (error) {
      logger.warn('Failed to load Lever provider', {
        module: 'provider-loader',
        error: error instanceof Error ? error.message : 'Unknown',
      })
    }

    try {
      const { createWorkdayProvider } = await import('../workday/workday-provider.ts')
      const companies = this.registry
        ? (await this.registry.getEnabled('workday')).map(c => ({
            name: c.name,
            subdomain: (c.config as { subdomain: string }).subdomain,
            tenant: (c.config as { tenant: string }).tenant,
            careerSite: (c.config as { careerSite: string }).careerSite,
          }))
        : undefined
      loaders.push({ name: 'workday', load: () => createWorkdayProvider(companies) })
    } catch (error) {
      logger.warn('Failed to load Workday provider', {
        module: 'provider-loader',
        error: error instanceof Error ? error.message : 'Unknown',
      })
    }

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

  async loadByName(name: string): Promise<boolean> {
    const providerMap: Record<string, () => Promise<JobProvider>> = {
      greenhouse: async () => {
        const m = await import('../greenhouse/greenhouse-provider.ts')
        const companies = this.registry
          ? (await this.registry.getEnabled('greenhouse')).map(c => ({
              name: c.name,
              boardToken: (c.config as { boardToken: string }).boardToken,
            }))
          : undefined
        return m.createGreenhouseProvider(companies)
      },
      gupy: async () => {
        const m = await import('../gupy/gupy-provider.ts')
        const companies = this.registry
          ? (await this.registry.getEnabled('gupy')).map(c => ({
              careerPageId: (c.config as { careerPageId: number }).careerPageId,
              careerPageName: (c.config as { careerPageName: string }).careerPageName,
            }))
          : undefined
        return m.createGupyProvider(companies)
      },
      ashby: async () => {
        const m = await import('../ashby/ashby-provider.ts')
        const companies = this.registry
          ? (await this.registry.getEnabled('ashby')).map(c => ({
              name: c.name,
              board: (c.config as { board: string }).board,
            }))
          : undefined
        return m.createAshbyProvider(companies)
      },
      lever: async () => {
        const m = await import('../lever/lever-provider.ts')
        const companies = this.registry
          ? (await this.registry.getEnabled('lever')).map(c => ({
              name: c.name,
              slug: (c.config as { slug: string }).slug,
            }))
          : undefined
        return m.createLeverProvider(companies)
      },
      workday: async () => {
        const m = await import('../workday/workday-provider.ts')
        const companies = this.registry
          ? (await this.registry.getEnabled('workday')).map(c => ({
              name: c.name,
              subdomain: (c.config as { subdomain: string }).subdomain,
              tenant: (c.config as { tenant: string }).tenant,
              careerSite: (c.config as { careerSite: string }).careerSite,
            }))
          : undefined
        return m.createWorkdayProvider(companies)
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
