/**
 * Search endpoint controller.
 * TASK-009: Create Search Endpoint
 *
 * Thin controller - only validates input, calls service, serializes response.
 * No business logic here.
 */
import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { validateSearchInput } from '../validation/search-validation.ts'
import { aggregateSearch } from '../services/aggregation-service.ts'
import type { SearchRequestQuery } from '../dto/search-dto.ts'

async function searchJobsHandler(
  request: FastifyRequest<{ Querystring: SearchRequestQuery }>,
  reply: FastifyReply
): Promise<void> {
  // Validate input
  const validatedInput = validateSearchInput(
    request.query as Record<string, string | undefined>
  )

  // Execute search
  const result = await aggregateSearch(validatedInput)

  // Build flat response matching frontend SearchResponse type
  const response = {
    jobs: result.jobs,
    total: result.meta.totalResults,
    page: result.meta.page,
    pageSize: result.meta.pageSize,
    totalPages: result.meta.totalPages,
    partial: result.partial,
  }

  await reply.status(200).send(response)
}

/**
 * Register the search route on the Fastify instance.
 */
export function registerSearchRoute(app: FastifyInstance): void {
  app.get('/jobs/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          skills: { type: 'string' },
          page: { type: 'string' },
          pageSize: { type: 'string' },
          seniority: { type: 'string' },
          remoteMode: { type: 'string' },
          companies: { type: 'string' },
          excludedCompanies: { type: 'string' },
          excludeCompanies: { type: 'string' },
          sources: { type: 'string' },
          minTrustScore: { type: 'string' },
          includeHidden: { type: 'string' },
          sort: { type: 'string' },
          postedAfter: { type: 'string' },
          countries: { type: 'string' },
        },
      },
    },
  }, searchJobsHandler)
}
