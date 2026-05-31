/**
 * Provider registry - central registration and discovery of providers.
 * TASK-018: Create Provider Registry
 */
import type { JobProvider, ProviderMetadata } from '@jobfindr/types'
import { logger } from '../../../shared/logger/logger.ts'

type RegisteredProvider = {
  provider: JobProvider
  metadata: ProviderMetadata
}

export class ProviderRegistry {
  private providers: Map<string, RegisteredProvider> = new Map()

  /**
   * Register a provider.
   */
  register(
    provider: JobProvider,
    metadata?: Partial<ProviderMetadata>
  ): void {
    const name = provider.name

    if (this.providers.has(name)) {
      logger.warn(`Provider ${name} already registered, overwriting`, {
        module: 'provider-registry',
      })
    }

    const defaultMetadata: ProviderMetadata = {
      name,
      version: '1.0.0',
      providerType: provider.providerType,
      enabled: true,
      priority: 100,
      timeoutMs: 10_000,
      retryCount: 3,
    }

    this.providers.set(name, {
      provider,
      metadata: { ...defaultMetadata, ...metadata },
    })

    logger.info(`Provider ${name} registered`, {
      module: 'provider-registry',
      data: { enabled: defaultMetadata.enabled, priority: defaultMetadata.priority },
    })
  }

  /**
   * Unregister a provider.
   */
  unregister(name: string): boolean {
    const existed = this.providers.has(name)
    this.providers.delete(name)
    if (existed) {
      logger.info(`Provider ${name} unregistered`, { module: 'provider-registry' })
    }
    return existed
  }

  /**
   * Get a provider by name.
   */
  get(name: string): JobProvider | undefined {
    return this.providers.get(name)?.provider
  }

  /**
   * Get provider metadata.
   */
  getMetadata(name: string): ProviderMetadata | undefined {
    return this.providers.get(name)?.metadata
  }

  /**
   * Get all registered providers.
   */
  getAll(): JobProvider[] {
    return [...this.providers.values()]
      .filter((rp) => rp.metadata.enabled)
      .sort((a, b) => a.metadata.priority - b.metadata.priority)
      .map((rp) => rp.provider)
  }

  /**
   * Get all registered provider names.
   */
  getNames(): string[] {
    return [...this.providers.keys()]
  }

  /**
   * Get all providers metadata.
   */
  getAllMetadata(): ProviderMetadata[] {
    return [...this.providers.values()]
      .sort((a, b) => a.metadata.priority - b.metadata.priority)
      .map((rp) => rp.metadata)
  }

  /**
   * Enable a provider.
   */
  enable(name: string): boolean {
    const rp = this.providers.get(name)
    if (!rp) return false
    rp.metadata.enabled = true
    return true
  }

  /**
   * Disable a provider.
   */
  disable(name: string): boolean {
    const rp = this.providers.get(name)
    if (!rp) return false
    rp.metadata.enabled = false
    return true
  }

  /**
   * Get count of registered providers.
   */
  get count(): number {
    return this.providers.size
  }

  /**
   * Get count of enabled providers.
   */
  get enabledCount(): number {
    return [...this.providers.values()].filter((rp) => rp.metadata.enabled).length
  }
}

/**
 * Global singleton provider registry.
 */
export const providerRegistry = new ProviderRegistry()
