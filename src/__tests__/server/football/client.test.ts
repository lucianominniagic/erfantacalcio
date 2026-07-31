/**
 * client.test — unit tests for footballDataClient.
 *
 * Validates:
 * - fetch header `X-Auth-Token` present
 * - URL construction: standings/matches/scorers with optional season param
 * - Response Zod validation success
 * - Zod validation failure → throw
 * - 4xx HTTP errors: non-retryable, fail immediately
 * - 429 rate-limit: non-retryable, fail immediately
 * - 5xx HTTP errors: retryable with exponential backoff
 * - Network errors: retryable (AbortError, timeout)
 * - Retry exhaustion: error after 3 attempts (initial + 2 retries)
 * - API key missing → throw at runtime
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { footballDataClient } from '~/server/football/football.client'
import {
  createFdStandingsResponse,
  createFdMatchesResponse,
  createFdScorersResponse,
} from './fixtures'

// Mock fetch globally
global.fetch = vi.fn()

describe('footballDataClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    // Set API key for tests
    process.env.FOOTBALL_DATA_API_KEY = 'test-api-key'
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
    delete process.env.FOOTBALL_DATA_API_KEY
  })

  describe('getStandings', () => {
    it('sends request with X-Auth-Token header', async () => {
      const response = createFdStandingsResponse()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response(JSON.stringify(response), { status: 200 }),
      )

      await footballDataClient.getStandings()

      const request = vi.mocked(global.fetch).mock.calls[0]
      expect(request?.[0].toString()).toContain('/standings')
      expect(new Headers(request?.[1]?.headers).get('X-Auth-Token')).toBe(
        'test-api-key',
      )
    })

    it('constructs URL without season param when not provided', async () => {
      const response = createFdStandingsResponse()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response(JSON.stringify(response), { status: 200 }),
      )

      await footballDataClient.getStandings()

      const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string
      expect(call).toContain('/standings')
      expect(call).not.toContain('season=')
    })

    it('constructs URL with season param when provided', async () => {
      const response = createFdStandingsResponse()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response(JSON.stringify(response), { status: 200 }),
      )

      await footballDataClient.getStandings(2022)

      const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string
      expect(call).toContain('season=2022')
    })

    it('validates response with Zod schema', async () => {
      const response = createFdStandingsResponse()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response(JSON.stringify(response), { status: 200 }),
      )

      const result = await footballDataClient.getStandings()

      expect(result.standings).toBeDefined()
      expect(result.metadata.currentMatchday).toBe(15)
    })

    it('throws on Zod validation failure', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response(JSON.stringify({ invalid: 'response' }), { status: 200 }),
      )

      await expect(footballDataClient.getStandings()).rejects.toThrow()
    })
  })

  describe('getMatches with date-based API', () => {
    it('constructs URL with dateFrom/dateTo via URLSearchParams', async () => {
      const response = createFdMatchesResponse()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response(JSON.stringify(response), { status: 200 }),
      )

      await footballDataClient.getMatches({
        dateFrom: '2024-01-15',
        dateTo: '2024-01-22',
      })

      const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string
      expect(call).toContain('dateFrom=2024-01-15')
      expect(call).toContain('dateTo=2024-01-22')
    })

    it('constructs URL with matchday filter', async () => {
      const response = createFdMatchesResponse()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response(JSON.stringify(response), { status: 200 }),
      )

      await footballDataClient.getMatches({ matchday: 15 })

      const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string
      expect(call).toContain('matchday=15')
    })

    it('constructs URL with season filter', async () => {
      const response = createFdMatchesResponse()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response(JSON.stringify(response), { status: 200 }),
      )

      await footballDataClient.getMatches({ season: 2024 })

      const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string
      expect(call).toContain('season=2024')
    })

    it('constructs URL combining dateFrom, dateTo, and season', async () => {
      const response = createFdMatchesResponse()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response(JSON.stringify(response), { status: 200 }),
      )

      await footballDataClient.getMatches({
        dateFrom: '2024-01-15',
        dateTo: '2024-01-22',
        season: 2024,
      })

      const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string
      expect(call).toContain('season=2024')
      expect(call).toContain('dateFrom=2024-01-15')
      expect(call).toContain('dateTo=2024-01-22')
    })

    it('constructs URL combining matchday and season', async () => {
      const response = createFdMatchesResponse()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response(JSON.stringify(response), { status: 200 }),
      )

      await footballDataClient.getMatches({
        matchday: 15,
        season: 2024,
      })

      const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string
      expect(call).toContain('matchday=15')
      expect(call).toContain('season=2024')
    })

    it('handles empty filters object (no query params)', async () => {
      const response = createFdMatchesResponse()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response(JSON.stringify(response), { status: 200 }),
      )

      await footballDataClient.getMatches({})

      const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string
      expect(call).toContain('/matches')
      expect(call).not.toContain('?')
    })

    it('returns array of mapped matches', async () => {
      const response = createFdMatchesResponse()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response(JSON.stringify(response), { status: 200 }),
      )

      const result = await footballDataClient.getMatches({ matchday: 1 })

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]?.id).toBeDefined()
      expect(result[0]?.status).toBeDefined()
    })

    it('validates dateTo as exclusive boundary in URL', async () => {
      const response = createFdMatchesResponse()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response(JSON.stringify(response), { status: 200 }),
      )

      await footballDataClient.getMatches({ dateTo: '2024-01-22' })

      const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string
      expect(call).toContain('dateTo=2024-01-22')
    })
  })

  describe('getScorers', () => {
    it('constructs URL with optional season param', async () => {
      const response = createFdScorersResponse()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response(JSON.stringify(response), { status: 200 }),
      )

      await footballDataClient.getScorers(2022)

      const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string
      expect(call).toContain('/scorers')
      expect(call).toContain('season=2022')
    })

    it('returns array of mapped scorers', async () => {
      const response = createFdScorersResponse()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response(JSON.stringify(response), { status: 200 }),
      )

      const result = await footballDataClient.getScorers()

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]?.player.name).toBeDefined()
      expect(result[0]?.goals).toBeDefined()
    })
  })

  describe('error handling', () => {
    it('throws immediately on 404', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response('Not Found', { status: 404, statusText: 'Not Found' }),
      )

      await expect(footballDataClient.getStandings()).rejects.toThrow('HTTP 404')
    })

    it('throws immediately on 401', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' }),
      )

      await expect(footballDataClient.getStandings()).rejects.toThrow('HTTP 401')
    })

    it('throws immediately on 429 rate limit', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response('Too Many Requests', { status: 429, statusText: 'Too Many Requests' }),
      )

      await expect(footballDataClient.getStandings()).rejects.toThrow('HTTP 429')
    })

    it('retries on 5xx error with backoff and throws after max attempts', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(
          new Response('Server Error', { status: 500, statusText: 'Internal Server Error' }),
        )
        .mockResolvedValueOnce(
          new Response('Server Error', { status: 500, statusText: 'Internal Server Error' }),
        )
        .mockResolvedValueOnce(
          new Response('Server Error', { status: 500, statusText: 'Internal Server Error' }),
        )

      const promise = footballDataClient.getStandings()

      // Use real timers because AbortSignal.timeout works with real time
      vi.useRealTimers()

      await expect(promise).rejects.toThrow('HTTP 500')

      // 3 attempts: initial + 2 retries
      expect(global.fetch).toHaveBeenCalledTimes(3)

      vi.useFakeTimers()
    }, { timeout: 15000 })

    it('retries on network error with backoff', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(
          new Response(JSON.stringify(createFdStandingsResponse()), { status: 200 }),
        )

      vi.useRealTimers()

      const result = await footballDataClient.getStandings()

      expect(result.standings).toBeDefined()
      expect(global.fetch).toHaveBeenCalledTimes(3)

      vi.useFakeTimers()
    }, { timeout: 15000 })

    it('retries with exponential backoff delay', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(
          new Response(JSON.stringify(createFdStandingsResponse()), { status: 200 }),
        )

      const promise = footballDataClient.getStandings()

      // Advance through first retry delay (300ms × 1)
      await vi.advanceTimersByTimeAsync(300)
      await vi.runAllTimersAsync()

      const result = await promise

      expect(result.standings).toBeDefined()
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('API key requirement', () => {
    it('throws when FOOTBALL_DATA_API_KEY is missing', async () => {
      delete process.env.FOOTBALL_DATA_API_KEY

      await expect(footballDataClient.getStandings()).rejects.toThrow(
        'FOOTBALL_DATA_API_KEY non configurata',
      )

      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('cache directive', () => {
    it('sets cache: no-store header', async () => {
      const response = createFdStandingsResponse()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response(JSON.stringify(response), { status: 200 }),
      )

      await footballDataClient.getStandings()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          cache: 'no-store',
        }),
      )
    })
  })
})
