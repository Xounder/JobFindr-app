import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { CompanyDiscovery } from './company-discovery.ts'

vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('CompanyDiscovery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('greenhouse', () => {
    it('should fetch and map greenhouse boards', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          boards: [
            { name: 'Stripe', board_token: 'stripe' },
            { name: 'Airbnb', board_token: 'airbnb' },
          ],
          meta: { page: 1, per_page: 50, total: 2 },
        },
      })

      const result = await CompanyDiscovery.greenhouse()
      expect(result.length).toBe(2)
      expect(result[0].name).toBe('Stripe')
      expect(result[0].config).toEqual({ boardToken: 'stripe' })
      expect(result[0].provider).toBe('greenhouse')
      expect(result[0].metadata?.source).toBe('discovery')
    })

    it('should filter out boards without board_token', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          boards: [
            { name: 'Valid', board_token: 'valid' },
            { name: 'Invalid', board_token: '' },
            { name: 'NoToken', board_token: null },
          ],
          meta: { page: 1, per_page: 50, total: 3 },
        },
      })

      const result = await CompanyDiscovery.greenhouse()
      expect(result.length).toBe(1)
      expect(result[0].name).toBe('Valid')
    })

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))

      const result = await CompanyDiscovery.greenhouse()
      expect(result).toEqual([])
    })

    it('should handle empty response', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { boards: [], meta: { page: 1, per_page: 50, total: 0 } },
      })

      const result = await CompanyDiscovery.greenhouse()
      expect(result).toEqual([])
    })
  })

  describe('gupy', () => {
    it('should search and deduplicate companies', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          data: [
            { careerPageName: 'Nubank', careerPageId: 1 },
            { careerPageName: 'Nubank', careerPageId: 1 },
            { careerPageName: 'iFood', careerPageId: 2 },
          ],
          total: 3,
        },
      })

      const result = await CompanyDiscovery.gupy({ terms: ['engineer'], minJobsThreshold: 1 })
      expect(result.length).toBe(2)
    })

    it('should filter companies below min job threshold', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          data: [
            { careerPageName: 'Nubank', careerPageId: 1 },
            { careerPageName: 'Nubank', careerPageId: 1 },
            { careerPageName: 'Nubank', careerPageId: 1 },
            { careerPageName: 'iFood', careerPageId: 2 },
          ],
          total: 4,
        },
      })

      const result = await CompanyDiscovery.gupy({ terms: ['engineer'], minJobsThreshold: 3 })
      expect(result.length).toBe(1)
      expect(result[0].name).toBe('Nubank')
    })

    it('should handle empty search results', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { data: [], total: 0 },
      })

      const result = await CompanyDiscovery.gupy({ terms: ['engineer'], minJobsThreshold: 1 })
      expect(result).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Timeout'))

      const result = await CompanyDiscovery.gupy({ terms: ['engineer'], minJobsThreshold: 1 })
      expect(result).toEqual([])
    })
  })
})
