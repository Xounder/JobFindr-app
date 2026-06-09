import { describe, it, expect, beforeEach, vi } from 'vitest'
import Fastify from 'fastify'
import crypto from 'node:crypto'
import { CompanyRegistry } from '../config/company-registry.ts'
import { CompanySync } from '../services/company-sync.ts'
import { CompanyDiscovery } from '../services/company-discovery.ts'
import { registerAdminCompanyRoutes, testWorkdayConnection } from './admin-companies.ts'

vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn((_expr: string, _cb: () => void) => ({ stop: vi.fn() })),
    validate: vi.fn(() => true),
  },
  schedule: vi.fn((_expr: string, _cb: () => void) => ({ stop: vi.fn() })),
  validate: vi.fn(() => true),
}))

vi.mock('../services/company-discovery.ts')

const JWT_SECRET = 'admin-jwt-secret-dev'

function createAdminToken(scope?: string[]): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({
    scope: scope ?? ['admin:companies'],
    exp: Math.floor(Date.now() / 1000) + 3600,
  })).toString('base64url')
  const signature = crypto.createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url')
  return `${header}.${payload}.${signature}`
}

function createExpiredToken(): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({
    scope: ['admin:companies'],
    exp: Math.floor(Date.now() / 1000) - 3600,
  })).toString('base64url')
  const signature = crypto.createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url')
  return `${header}.${payload}.${signature}`
}

function createInvalidSignatureToken(): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({
    scope: ['admin:companies'],
    exp: Math.floor(Date.now() / 1000) + 3600,
  })).toString('base64url')
  return `${header}.${payload}.invalidsignature`
}

describe('Admin Company Routes', () => {
  let registry: CompanyRegistry
  let sync: CompanySync

  beforeEach(async () => {
    registry = new CompanyRegistry({ ttlMs: 5000 })
    await registry.initialize()
    sync = new CompanySync(registry)
    vi.clearAllMocks()
    vi.mocked(CompanyDiscovery.greenhouse).mockResolvedValue([])
    vi.mocked(CompanyDiscovery.gupy).mockResolvedValue([])
  })

  // ─── Auth Tests ─────────────────────────────────────────────────────────

  describe('Authentication', () => {
    it('returns 401 when no authorization header is provided', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)

      const response = await app.inject({ method: 'GET', url: '/admin/companies' })
      expect(response.statusCode).toBe(401)
      const body = JSON.parse(response.body)
      expect(body.error.code).toBe('UNAUTHORIZED')

      await app.close()
    })

    it('returns 401 when token format is invalid', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)

      const response = await app.inject({
        method: 'GET',
        url: '/admin/companies',
        headers: { authorization: 'Bearer not-a-valid-token' },
      })
      expect(response.statusCode).toBe(401)
      const body = JSON.parse(response.body)
      expect(body.error.code).toBe('UNAUTHORIZED')

      await app.close()
    })

    it('returns 403 when token lacks admin:companies scope', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)

      const token = createAdminToken(['read:jobs'])
      const response = await app.inject({
        method: 'GET',
        url: '/admin/companies',
        headers: { authorization: `Bearer ${token}` },
      })
      expect(response.statusCode).toBe(403)
      const body = JSON.parse(response.body)
      expect(body.error.code).toBe('FORBIDDEN')

      await app.close()
    })

    it('returns 401 when token is expired', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)

      const token = createExpiredToken()
      const response = await app.inject({
        method: 'GET',
        url: '/admin/companies',
        headers: { authorization: `Bearer ${token}` },
      })
      expect(response.statusCode).toBe(401)

      await app.close()
    })

    it('returns 401 when signature is invalid', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)

      const token = createInvalidSignatureToken()
      const response = await app.inject({
        method: 'GET',
        url: '/admin/companies',
        headers: { authorization: `Bearer ${token}` },
      })
      expect(response.statusCode).toBe(401)

      await app.close()
    })

    it('returns 401 when Bearer scheme is missing', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)

      const token = createAdminToken()
      const response = await app.inject({
        method: 'GET',
        url: '/admin/companies',
        headers: { authorization: token },
      })
      expect(response.statusCode).toBe(401)

      await app.close()
    })
  })

  // ─── GET /admin/companies ───────────────────────────────────────────────

  describe('GET /admin/companies', () => {
    it('returns all companies with pagination', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const response = await app.inject({
        method: 'GET',
        url: '/admin/companies',
        headers: { authorization: `Bearer ${token}` },
      })
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.companies.length).toBeGreaterThan(0)
      expect(body.total).toBeGreaterThan(0)
      expect(body.page).toBe(1)
      expect(body.pageSize).toBe(50)
      expect(body.providers).toBeDefined()
      expect(body.providers.greenhouse).toBeDefined()
      expect(body.providers.ashby).toBeDefined()

      await app.close()
    })

    it('filters by provider', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const response = await app.inject({
        method: 'GET',
        url: '/admin/companies?provider=ashby',
        headers: { authorization: `Bearer ${token}` },
      })
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      body.companies.forEach((c: { provider: string }) => {
        expect(c.provider).toBe('ashby')
      })

      await app.close()
    })

    it('filters by enabled', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const response = await app.inject({
        method: 'GET',
        url: '/admin/companies?enabled=true',
        headers: { authorization: `Bearer ${token}` },
      })
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      body.companies.forEach((c: { enabled: boolean }) => {
        expect(c.enabled).toBe(true)
      })

      await app.close()
    })

    it('filters by source', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const response = await app.inject({
        method: 'GET',
        url: '/admin/companies?source=static',
        headers: { authorization: `Bearer ${token}` },
      })
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      body.companies.forEach((c: { metadata?: { source?: string } }) => {
        expect(c.metadata?.source).toBe('static')
      })

      await app.close()
    })

    it('paginates results correctly', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const response = await app.inject({
        method: 'GET',
        url: '/admin/companies?page=1&pageSize=5',
        headers: { authorization: `Bearer ${token}` },
      })
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.companies.length).toBeLessThanOrEqual(5)
      expect(body.page).toBe(1)
      expect(body.pageSize).toBe(5)

      await app.close()
    })

    it('returns empty page when page exceeds total', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const response = await app.inject({
        method: 'GET',
        url: '/admin/companies?page=999',
        headers: { authorization: `Bearer ${token}` },
      })
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.companies).toEqual([])

      await app.close()
    })

    it('returns provider summary with correct counts', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const response = await app.inject({
        method: 'GET',
        url: '/admin/companies',
        headers: { authorization: `Bearer ${token}` },
      })
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)

      expect(body.providers.greenhouse.total).toBeGreaterThan(0)
      expect(body.providers.greenhouse.static).toBeGreaterThan(0)
      expect(body.providers.ashby.static).toBeGreaterThan(0)
      expect(body.providers.lever.static).toBeGreaterThan(0)
      expect(body.providers.workday.static).toBeGreaterThan(0)
      expect(body.providers.gupy.total).toBe(0)

      await app.close()
    })

    it('enforces max page size of 100', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const response = await app.inject({
        method: 'GET',
        url: '/admin/companies?pageSize=999',
        headers: { authorization: `Bearer ${token}` },
      })
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.pageSize).toBe(50)

      await app.close()
    })
  })

  // ─── POST /admin/companies ──────────────────────────────────────────────

  describe('POST /admin/companies', () => {
    it('creates a new company config', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const response = await app.inject({
        method: 'POST',
        url: '/admin/companies',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: 'ashby',
          name: 'TestCorp',
          config: { board: 'testcorp' },
          priority: 5,
        }),
      })
      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.name).toBe('TestCorp')
      expect(body.provider).toBe('ashby')
      expect(body.enabled).toBe(true)
      expect(body.id).toBeDefined()
      expect(body.createdAt).toBeDefined()
      expect(body.updatedAt).toBeDefined()
      expect(body.metadata?.source).toBe('admin')

      await app.close()
    })

    it('returns 409 for duplicate company name within same provider', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      await app.inject({
        method: 'POST',
        url: '/admin/companies',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: 'ashby',
          name: 'DuplicateCorp',
          config: { board: 'dup' },
        }),
      })

      const response = await app.inject({
        method: 'POST',
        url: '/admin/companies',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: 'ashby',
          name: 'DuplicateCorp',
          config: { board: 'dup2' },
        }),
      })
      expect(response.statusCode).toBe(409)

      await app.close()
    })

    it('validates provider-specific config', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const response = await app.inject({
        method: 'POST',
        url: '/admin/companies',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: 'workday',
          name: 'BadWorkday',
          config: { subdomain: 'test' },
        }),
      })
      expect(response.statusCode).toBe(400)

      await app.close()
    })

    it('rejects invalid provider', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const response = await app.inject({
        method: 'POST',
        url: '/admin/companies',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: 'unknown',
          name: 'Test',
          config: { board: 'test' },
        }),
      })
      expect(response.statusCode).toBe(400)

      await app.close()
    })

    it('rejects empty name', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const response = await app.inject({
        method: 'POST',
        url: '/admin/companies',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: 'ashby',
          name: '',
          config: { board: 'test' },
        }),
      })
      expect(response.statusCode).toBe(400)

      await app.close()
    })

    it('creates company with default priority', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const response = await app.inject({
        method: 'POST',
        url: '/admin/companies',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: 'lever',
          name: 'NoPriority',
          config: { slug: 'nopriority' },
        }),
      })
      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.priority).toBe(10)

      await app.close()
    })
  })

  // ─── PUT /admin/companies/:id ───────────────────────────────────────────

  describe('PUT /admin/companies/:id', () => {
    it('updates an existing company', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const createRes = await app.inject({
        method: 'POST',
        url: '/admin/companies',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: 'ashby',
          name: 'UpdateTest',
          config: { board: 'updatetest' },
        }),
      })
      const created = JSON.parse(createRes.body)

      const updateRes = await app.inject({
        method: 'PUT',
        url: `/admin/companies/${created.id}`,
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          priority: 50,
          enabled: false,
        }),
      })
      expect(updateRes.statusCode).toBe(200)
      const updated = JSON.parse(updateRes.body)
      expect(updated.priority).toBe(50)
      expect(updated.enabled).toBe(false)
      expect(updated.id).toBe(created.id)

      await app.close()
    })

    it('returns 404 for non-existent company', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const response = await app.inject({
        method: 'PUT',
        url: '/admin/companies/nonexistent-id',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'NewName' }),
      })
      expect(response.statusCode).toBe(404)

      await app.close()
    })

    it('validates updated config', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const createRes = await app.inject({
        method: 'POST',
        url: '/admin/companies',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: 'greenhouse',
          name: 'ConfigUpdateTest',
          config: { boardToken: 'validtoken' },
        }),
      })
      const created = JSON.parse(createRes.body)

      const updateRes = await app.inject({
        method: 'PUT',
        url: `/admin/companies/${created.id}`,
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          config: { boardToken: '' },
        }),
      })
      expect(updateRes.statusCode).toBe(400)

      await app.close()
    })
  })

  // ─── DELETE /admin/companies/:id ────────────────────────────────────────

  describe('DELETE /admin/companies/:id', () => {
    it('soft-deletes a company (sets enabled to false)', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const createRes = await app.inject({
        method: 'POST',
        url: '/admin/companies',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: 'ashby',
          name: 'SoftDeleteTest',
          config: { board: 'softdeletetest' },
        }),
      })
      const created = JSON.parse(createRes.body)
      expect(created.enabled).toBe(true)

      const deleteRes = await app.inject({
        method: 'DELETE',
        url: `/admin/companies/${created.id}`,
        headers: { authorization: `Bearer ${token}` },
      })
      expect(deleteRes.statusCode).toBe(200)
      expect(JSON.parse(deleteRes.body)).toEqual({ success: true })

      const getRes = await app.inject({
        method: 'GET',
        url: '/admin/companies?enabled=false',
        headers: { authorization: `Bearer ${token}` },
      })
      const all = JSON.parse(getRes.body)
      const deleted = all.companies.find((c: { id: string }) => c.id === created.id)
      expect(deleted).toBeDefined()
      expect(deleted.enabled).toBe(false)

      await app.close()
    })

    it('returns 404 for non-existent company', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const response = await app.inject({
        method: 'DELETE',
        url: '/admin/companies/nonexistent-id',
        headers: { authorization: `Bearer ${token}` },
      })
      expect(response.statusCode).toBe(404)

      await app.close()
    })
  })

  // ─── POST /admin/companies/sync ─────────────────────────────────────────

  describe('POST /admin/companies/sync', () => {
    it('triggers sync and returns job response', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const response = await app.inject({
        method: 'POST',
        url: '/admin/companies/sync',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ provider: 'greenhouse' }),
      })
      expect(response.statusCode).toBe(202)
      const body = JSON.parse(response.body)
      expect(body.jobId).toContain('sync-greenhouse-')
      expect(body.status).toBe('started')
      expect(body.provider).toBe('greenhouse')

      await app.close()
    })

    it('returns 400 for invalid provider', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const response = await app.inject({
        method: 'POST',
        url: '/admin/companies/sync',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ provider: 'invalid' }),
      })
      expect(response.statusCode).toBe(400)

      await app.close()
    })
  })

  // ─── GET /admin/companies/status ────────────────────────────────────────

  describe('GET /admin/companies/status', () => {
    it('returns sync statuses', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      sync.startAll()

      const response = await app.inject({
        method: 'GET',
        url: '/admin/companies/status',
        headers: { authorization: `Bearer ${token}` },
      })
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.syncs).toBeInstanceOf(Array)
      expect(body.syncs.length).toBeGreaterThanOrEqual(2)

      const greenhouse = body.syncs.find((s: { provider: string }) => s.provider === 'greenhouse')
      expect(greenhouse).toBeDefined()
      expect(greenhouse.status).toBe('idle')

      await app.close()
    })

    it('returns empty array when no syncs configured', async () => {
      const app = Fastify()
      registerAdminCompanyRoutes(app, registry, sync)
      const token = createAdminToken()

      const response = await app.inject({
        method: 'GET',
        url: '/admin/companies/status',
        headers: { authorization: `Bearer ${token}` },
      })
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.syncs).toEqual([])

      await app.close()
    })
  })

  // ─── testWorkdayConnection ───────────────────────────────────────────────

  describe('testWorkdayConnection', () => {
    it('returns success false when host is unreachable', async () => {
      const result = await testWorkdayConnection({
        subdomain: 'nonexistent-test',
        tenant: 'test',
        careerSite: 'test',
      })
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
