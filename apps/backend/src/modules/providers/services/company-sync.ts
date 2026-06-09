import cron from 'node-cron'
import type { CompanyConfig, CompanyRegistry, ProviderName } from '../config/company-registry.ts'
import { CompanyDiscovery } from './company-discovery.ts'
import { env } from '../../../config/env.ts'
import { logger } from '../../../shared/logger/logger.ts'

export type SyncResult = {
  provider: string
  success: boolean
  discoveredCount: number
  errors: string[]
  durationMs: number
}

export type SyncStatus = {
  provider: string
  lastRunAt: string | null
  lastDurationMs: number | null
  lastCount: number | null
  status: 'success' | 'failure' | 'idle' | 'running'
  nextRunAt: string | null
}

export class CompanySync {
  private registry: CompanyRegistry
  private jobs: Map<ProviderName, cron.ScheduledTask> = new Map()
  private statuses: Map<ProviderName, SyncStatus> = new Map()
  private running = new Set<ProviderName>()

  constructor(registry: CompanyRegistry) {
    this.registry = registry
  }

  startAll(): void {
    this.scheduleProvider('greenhouse', env.GREENHOUSE_DISCOVERY_INTERVAL)
    this.scheduleProvider('gupy', env.GUPY_DISCOVERY_INTERVAL)

    logger.info('Company sync jobs started', {
      module: 'company-sync',
      data: { scheduled: Array.from(this.jobs.keys()) },
    })
  }

  stopAll(): void {
    for (const [provider, job] of this.jobs) {
      job.stop()
      logger.info(`Sync job stopped for ${provider}`, { module: 'company-sync' })
    }
    this.jobs.clear()
    this.statuses.clear()
  }

  private scheduleProvider(provider: ProviderName, cronExpression: string): void {
    if (!cron.validate(cronExpression)) {
      logger.warn(`Invalid cron expression for ${provider}: ${cronExpression}`, {
        module: 'company-sync',
      })
      return
    }

    const task = cron.schedule(cronExpression, async () => {
      await this.syncProvider(provider)
    })

    this.jobs.set(provider, task)

    this.statuses.set(provider, {
      provider,
      lastRunAt: null,
      lastDurationMs: null,
      lastCount: null,
      status: 'idle',
      nextRunAt: null,
    })

    logger.info(`Scheduled sync for ${provider}: ${cronExpression}`, {
      module: 'company-sync',
    })
  }

  async syncProvider(provider: ProviderName): Promise<SyncResult> {
    if (this.running.has(provider)) {
      return {
        provider,
        success: false,
        discoveredCount: 0,
        errors: ['Sync already running'],
        durationMs: 0,
      }
    }

    this.running.add(provider)
    const startTime = Date.now()

    this.statuses.set(provider, {
      ...(this.statuses.get(provider) ?? { provider, lastRunAt: null, lastDurationMs: null, lastCount: null, status: 'idle', nextRunAt: null }),
      status: 'running',
    })

    const errors: string[] = []
    let discoveredCount = 0

    try {
      const dynamicFlag = this.getDynamicFlag(provider)
      if (!dynamicFlag) {
        logger.info(`Sync skipped for ${provider} — dynamic companies disabled`, {
          module: 'company-sync',
        })
        const durationMs = Date.now() - startTime
        this.recordResult(provider, true, 0, errors, durationMs)
        return { provider, success: true, discoveredCount: 0, errors, durationMs }
      }

      let configs: Omit<CompanyConfig, 'id' | 'createdAt' | 'updatedAt'>[]

      switch (provider) {
        case 'greenhouse':
          configs = await CompanyDiscovery.greenhouse()
          break
        case 'gupy':
          configs = await CompanyDiscovery.gupy()
          break
        default:
          errors.push(`No discovery logic for provider: ${provider}`)
          const durationMs = Date.now() - startTime
          this.recordResult(provider, false, 0, errors, durationMs)
          return { provider, success: false, discoveredCount: 0, errors, durationMs }
      }

      discoveredCount = configs.length
      await this.registry.replaceAll(provider, configs)

      const totalDurationMs = Date.now() - startTime
      this.recordResult(provider, true, discoveredCount, errors, totalDurationMs)

      logger.info(`Sync completed for ${provider}`, {
        module: 'company-sync',
        data: { discoveredCount, durationMs: totalDurationMs },
      })

      return { provider, success: true, discoveredCount, errors, durationMs: totalDurationMs }
    } catch (error) {
      const totalDurationMs = Date.now() - startTime
      const message = error instanceof Error ? error.message : 'Unknown error'
      errors.push(message)

      this.recordResult(provider, false, discoveredCount, errors, totalDurationMs)

      logger.error(`Sync failed for ${provider}`, {
        module: 'company-sync',
        error: message,
      })

      return { provider, success: false, discoveredCount, errors, durationMs: totalDurationMs }
    } finally {
      this.running.delete(provider)
    }
  }

  private getDynamicFlag(provider: ProviderName): boolean {
    switch (provider) {
      case 'greenhouse': return env.GREENHOUSE_DYNAMIC_COMPANIES
      case 'gupy': return env.GUPY_DYNAMIC_COMPANIES
      case 'ashby': return env.ASHBY_DYNAMIC_COMPANIES
      case 'lever': return env.LEVER_DYNAMIC_COMPANIES
      case 'workday': return env.WORKDAY_DYNAMIC_COMPANIES
    }
  }

  private recordResult(provider: ProviderName, success: boolean, count: number, _errors: string[], durationMs: number): void {
    const now = new Date().toISOString()
    const nextDate = new Date(Date.now() + 86400000)

    this.statuses.set(provider, {
      provider,
      lastRunAt: now,
      lastDurationMs: durationMs,
      lastCount: count,
      status: success ? 'success' : 'failure',
      nextRunAt: nextDate.toISOString(),
    })
  }

  isRunning(provider: ProviderName): boolean {
    return this.running.has(provider)
  }

  getStatus(): SyncStatus[] {
    return Array.from(this.statuses.values())
  }
}
