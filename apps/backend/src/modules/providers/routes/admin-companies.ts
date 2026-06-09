import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import crypto from 'node:crypto'
import { z } from 'zod'
import type { CompanyRegistry, CompanyConfig, ProviderName, ProviderSpecificConfig } from '../config/company-registry.ts'
import type { CompanySync } from '../services/company-sync.ts'
import { env } from '../../../config/env.ts'

const PROVIDER_NAMES: ProviderName[] = ['greenhouse', 'ashby', 'lever', 'workday', 'gupy']

// ─── Auth ───────────────────────────────────────────────────────────────────

function verifyAdminToken(token: string): { valid: boolean; error?: string; status?: number } {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return { valid: false, error: 'Invalid token format', status: 401 }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())

    const secret = env.ADMIN_JWT_SECRET
    const signature = crypto.createHmac('sha256', secret)
      .update(`${parts[0]}.${parts[1]}`)
      .digest('base64url')

    if (signature !== parts[2]) return { valid: false, error: 'Invalid signature', status: 401 }
    if (payload.exp && payload.exp * 1000 < Date.now()) return { valid: false, error: 'Token expired', status: 401 }

    const scopes: string[] = payload.scope ?? []
    if (!scopes.includes('admin:companies')) return { valid: false, error: 'Missing required scope: admin:companies', status: 403 }

    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid token', status: 401 }
  }
}

async function requireAdminScope(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' } })
    return
  }

  const result = verifyAdminToken(authHeader.slice(7))
  if (!result.valid) {
    reply.status(result.status ?? 401).send({ error: { code: result.status === 403 ? 'FORBIDDEN' : 'UNAUTHORIZED', message: result.error } })
  }
}

// ─── Validation Schemas ─────────────────────────────────────────────────────

const providerSchema = z.enum(['greenhouse', 'ashby', 'lever', 'workday', 'gupy'])

const greenhouseConfigSchema = z.object({ boardToken: z.string().min(1) })
const ashbyConfigSchema = z.object({ board: z.string().min(1) })
const leverConfigSchema = z.object({ slug: z.string().min(1) })
const workdayConfigSchema = z.object({ subdomain: z.string().min(1), tenant: z.string().min(1), careerSite: z.string().min(1) })
const gupyConfigSchema = z.object({ careerPageId: z.number().int().positive(), careerPageName: z.string().min(1) })

function getConfigSchema(provider: ProviderName): z.ZodType<ProviderSpecificConfig> {
  switch (provider) {
    case 'greenhouse': return greenhouseConfigSchema
    case 'ashby': return ashbyConfigSchema
    case 'lever': return leverConfigSchema
    case 'workday': return workdayConfigSchema
    case 'gupy': return gupyConfigSchema
  }
}

const createCompanySchema = z.object({
  provider: providerSchema,
  name: z.string().min(1).max(200),
  config: z.unknown(),
  priority: z.number().int().min(0).max(100).optional().default(10),
})

const updateCompanySchema = z.object({
  provider: providerSchema.optional(),
  name: z.string().min(1).max(200).optional(),
  config: z.unknown().optional(),
  priority: z.number().int().min(0).max(100).optional(),
  enabled: z.boolean().optional(),
})

const listCompaniesQuerySchema = z.object({
  provider: providerSchema.optional(),
  enabled: z.string().optional(),
  source: z.enum(['discovery', 'admin', 'static']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).catch(50).default(50),
})

const syncBodySchema = z.object({
  provider: providerSchema,
})

// ─── Workday Connection Test ────────────────────────────────────────────────

export async function testWorkdayConnection(config: { subdomain: string; tenant: string; careerSite: string }): Promise<{ success: boolean; error?: string; latencyMs?: number }> {
  const url = `https://${config.subdomain}.wd1.myworkdayjobs.com/wday/cxs/${config.tenant}/${config.careerSite}/jobs`
  const startTime = Date.now()

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 1, offset: 0 }),
      signal: AbortSignal.timeout(env.WORKDAY_TIMEOUT_MS),
    })

    const latencyMs = Date.now() - startTime

    if (response.ok) {
      return { success: true, latencyMs }
    }
    return { success: false, error: `Workday API returned ${response.status}: ${response.statusText}`, latencyMs }
  } catch (error) {
    const latencyMs = Date.now() - startTime
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message, latencyMs }
  }
}

// ─── Route Handlers ─────────────────────────────────────────────────────────

function sendValidationError(reply: FastifyReply, error: z.ZodError): void {
  reply.status(400).send({
    error: {
      code: 'VALIDATION_ERROR',
      message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; '),
      details: error.errors,
    },
  })
}

async function listCompaniesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
  registry: CompanyRegistry,
): Promise<void> {
  const parsed = listCompaniesQuerySchema.safeParse(request.query)
  if (!parsed.success) {
    sendValidationError(reply, parsed.error)
    return
  }
  const query = parsed.data

  const providers = query.provider ? [query.provider] : PROVIDER_NAMES
  const allCompanies: CompanyConfig[] = []

  for (const p of providers) {
    const companies = await registry.getAll(p)
    allCompanies.push(...companies)
  }

  let filtered = allCompanies
  if (query.enabled !== undefined) {
    const enabledBool = query.enabled === 'true'
    filtered = filtered.filter(c => c.enabled === enabledBool)
  }
  if (query.source !== undefined) {
    filtered = filtered.filter(c => c.metadata?.source === query.source)
  }

  const providersSummary: Record<string, { total: number; discovered: number; manual: number; static: number }> = {}
  for (const p of PROVIDER_NAMES) {
    const provCompanies = allCompanies.filter(c => c.provider === p)
    providersSummary[p] = {
      total: provCompanies.length,
      discovered: provCompanies.filter(c => c.metadata?.source === 'discovery').length,
      manual: provCompanies.filter(c => c.metadata?.source === 'admin').length,
      static: provCompanies.filter(c => c.metadata?.source === 'static').length,
    }
  }

  const total = filtered.length
  const page = query.page
  const pageSize = query.pageSize
  const start = (page - 1) * pageSize
  const paginated = filtered.slice(start, start + pageSize)

  reply.status(200).send({
    companies: paginated,
    total,
    page,
    pageSize,
    providers: providersSummary,
  })
}

async function createCompanyHandler(
  request: FastifyRequest,
  reply: FastifyReply,
  registry: CompanyRegistry,
): Promise<void> {
  const parsed = createCompanySchema.safeParse(request.body)
  if (!parsed.success) {
    sendValidationError(reply, parsed.error)
    return
  }
  const body = parsed.data

  const configSchema = getConfigSchema(body.provider)
  const configResult = configSchema.safeParse(body.config)
  if (!configResult.success) {
    reply.status(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: configResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; '),
        details: configResult.error.errors,
      },
    })
    return
  }

  const existing = await registry.getAll(body.provider)
  const duplicate = existing.find(c => c.name === body.name)
  if (duplicate) {
    reply.status(409).send({
      error: { code: 'CONFLICT', message: `Company "${body.name}" already exists for provider "${body.provider}"` },
    })
    return
  }

  const created = await registry.upsert({
    provider: body.provider,
    name: body.name,
    enabled: true,
    priority: body.priority ?? 10,
    config: configResult.data as ProviderSpecificConfig,
    metadata: { source: 'admin' },
  })

  reply.status(201).send(created)
}

async function updateCompanyHandler(
  request: FastifyRequest,
  reply: FastifyReply,
  registry: CompanyRegistry,
): Promise<void> {
  const { id } = request.params as { id: string }
  const parsed = updateCompanySchema.safeParse(request.body)
  if (!parsed.success) {
    sendValidationError(reply, parsed.error)
    return
  }
  const body = parsed.data

  const existing = await registry.getById(id)
  if (!existing) {
    reply.status(404).send({ error: { code: 'NOT_FOUND', message: `Company with id "${id}" not found` } })
    return
  }

  let validatedConfig: ProviderSpecificConfig | undefined
  if (body.config !== undefined) {
    const provider = body.provider ?? existing.provider
    const configSchema = getConfigSchema(provider)
    const configResult = configSchema.safeParse(body.config)
    if (!configResult.success) {
      reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: configResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; '),
          details: configResult.error.errors,
        },
      })
      return
    }
    validatedConfig = configResult.data as ProviderSpecificConfig
  }

  const updated = await registry.upsert({
    provider: body.provider ?? existing.provider,
    name: body.name ?? existing.name,
    enabled: body.enabled ?? existing.enabled,
    priority: body.priority ?? existing.priority,
    config: validatedConfig ?? existing.config,
    metadata: existing.metadata,
  })

  reply.status(200).send(updated)
}

async function deleteCompanyHandler(
  request: FastifyRequest,
  reply: FastifyReply,
  registry: CompanyRegistry,
): Promise<void> {
  const { id } = request.params as { id: string }

  const existing = await registry.getById(id)
  if (!existing) {
    reply.status(404).send({ error: { code: 'NOT_FOUND', message: `Company with id "${id}" not found` } })
    return
  }

  await registry.disable(id)
  reply.status(200).send({ success: true })
}

async function syncCompanyHandler(
  request: FastifyRequest,
  reply: FastifyReply,
  sync: CompanySync,
): Promise<void> {
  const parsed = syncBodySchema.safeParse(request.body)
  if (!parsed.success) {
    sendValidationError(reply, parsed.error)
    return
  }
  const body = parsed.data
  const timestamp = Date.now()
  const jobId = `sync-${body.provider}-${timestamp}`

  sync.syncProvider(body.provider).catch(() => {})

  reply.status(202).send({
    jobId,
    status: 'started',
    provider: body.provider,
  })
}

async function statusHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
  sync: CompanySync,
): Promise<void> {
  const syncs = sync.getStatus()
  reply.status(200).send({ syncs })
}

// ─── Route Registration ─────────────────────────────────────────────────────

export function registerAdminCompanyRoutes(app: FastifyInstance, registry: CompanyRegistry, sync: CompanySync): void {
  app.get('/admin/companies', { preHandler: requireAdminScope }, async (request, reply) => {
    return listCompaniesHandler(request, reply, registry)
  })

  app.post('/admin/companies', { preHandler: requireAdminScope }, async (request, reply) => {
    return createCompanyHandler(request, reply, registry)
  })

  app.put('/admin/companies/:id', { preHandler: requireAdminScope }, async (request, reply) => {
    return updateCompanyHandler(request, reply, registry)
  })

  app.delete('/admin/companies/:id', { preHandler: requireAdminScope }, async (request, reply) => {
    return deleteCompanyHandler(request, reply, registry)
  })

  app.post('/admin/companies/sync', { preHandler: requireAdminScope }, async (request, reply) => {
    return syncCompanyHandler(request, reply, sync)
  })

  app.get('/admin/companies/status', { preHandler: requireAdminScope }, async (request, reply) => {
    return statusHandler(request, reply, sync)
  })
}
