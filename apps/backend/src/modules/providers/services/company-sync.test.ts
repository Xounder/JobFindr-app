import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CompanySync } from './company-sync.ts'
import { CompanyRegistry } from '../config/company-registry.ts'
import { CompanyDiscovery } from './company-discovery.ts'

vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn((_expr: string, _cb: () => void) => {
      return { stop: vi.fn() }
    }),
    validate: vi.fn(() => true),
  },
  schedule: vi.fn((_expr: string, _cb: () => void) => {
    return { stop: vi.fn() }
  }),
  validate: vi.fn(() => true),
}))

vi.mock('./company-discovery.ts')

describe('CompanySync', () => {
  let registry: CompanyRegistry
  let sync: CompanySync

  beforeEach(async () => {
    registry = new CompanyRegistry({ ttlMs: 5000 })
    await registry.initialize()
    sync = new CompanySync(registry)
    vi.clearAllMocks()
  })

  it('should start sync jobs for greenhouse and gupy', () => {
    sync.startAll()
    const status = sync.getStatus()
    const providers = status.map(s => s.provider)
    expect(providers).toContain('greenhouse')
    expect(providers).toContain('gupy')
  })

  it('should stop all sync jobs', () => {
    sync.startAll()
    sync.stopAll()
    const status = sync.getStatus()
    expect(status.length).toBe(0)
  })

  it('should sync greenhouse provider', async () => {
    const mockConfigs = [
      { provider: 'greenhouse' as const, name: 'Stripe', enabled: true, priority: 10, config: { boardToken: 'stripe' }, metadata: { source: 'discovery' as const, lastSyncedAt: new Date().toISOString() } },
    ]
    vi.mocked(CompanyDiscovery.greenhouse).mockResolvedValueOnce(mockConfigs)

    const result = await sync.syncProvider('greenhouse')
    expect(result.success).toBe(true)
    expect(result.discoveredCount).toBe(1)
  })

  it('should sync gupy provider', async () => {
    const mockConfigs = [
      { provider: 'gupy' as const, name: 'Nubank', enabled: true, priority: 10, config: { careerPageId: 1, careerPageName: 'Nubank' }, metadata: { source: 'discovery' as const, lastSyncedAt: new Date().toISOString() } },
    ]
    vi.mocked(CompanyDiscovery.gupy).mockResolvedValueOnce(mockConfigs)

    const result = await sync.syncProvider('gupy')
    expect(result.success).toBe(true)
    expect(result.discoveredCount).toBe(1)
  })

  it('should handle sync failure gracefully', async () => {
    vi.mocked(CompanyDiscovery.greenhouse).mockRejectedValueOnce(new Error('API Error'))

    const result = await sync.syncProvider('greenhouse')
    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should not run concurrent sync for same provider', async () => {
    vi.mocked(CompanyDiscovery.greenhouse).mockImplementationOnce(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return []
    })

    const [result1, result2] = await Promise.all([
      sync.syncProvider('greenhouse'),
      sync.syncProvider('greenhouse'),
    ])

    expect(result1.success).toBe(true)
    expect(result2.success).toBe(false)
    expect(result2.errors).toContain('Sync already running')
  })

  it('should return sync status', async () => {
    sync.startAll()
    const status = sync.getStatus()
    expect(status.length).toBeGreaterThanOrEqual(2)
    expect(status[0].status).toBe('idle')
  })

  it('should track isRunning state', () => {
    expect(sync.isRunning('greenhouse')).toBe(false)
  })
})
