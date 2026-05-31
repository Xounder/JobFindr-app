/**
 * Provider Status Route.
 * TASK-115: Create Provider Health Monitoring
 *
 * GET /providers/status endpoint for monitoring provider health.
 */
import type { FastifyInstance } from 'fastify'
import { providerHealthStore } from './provider-health.ts'

/**
 * Register the provider status route.
 */
export function registerProviderStatusRoute(app: FastifyInstance): void {
  app.get('/providers/status', async (_request, _reply) => {
    const statuses = providerHealthStore.getAllStatuses()

    return {
      healthyCount: statuses.filter((s) => s.isHealthy).length,
      unhealthyCount: statuses.filter((s) => !s.isHealthy).length,
      totalCount: statuses.length,
      uptimeMs: providerHealthStore.uptimeMs,
      providers: statuses,
    }
  })
}
