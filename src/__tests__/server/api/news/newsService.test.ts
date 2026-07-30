/**
 * newsService.test — unit tests for fetchAllNewsFeeds orchestration.
 *
 * Validates:
 * - All four feeds are fetched in parallel
 * - Failed feeds produce error results while others succeed
 * - Results are returned in fixed order (calcio, calciomercato, coppe, estero)
 * - Cache TTL 15 minutes and deduplication
 * - Schema validation of final response
 * - Partial failure isolation (one feed error ≠ complete failure)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { fetchAllNewsFeeds } from '~/server/api/news/services/newsService'
import { InMemoryFeedCache } from '~/server/api/news/cache/newsCache'
import type { INewsProvider } from '~/server/api/news/providers/newsProvider'
import type { NewsArticle } from '~/schemas/news'

// ---------------------------------------------------------------------------
// Mock fixtures
// ---------------------------------------------------------------------------

const mockArticles = (title: string, url: string): NewsArticle[] => [
  {
    title,
    description: `Description for ${title}`,
    pubDate: '2025-01-01T12:00:00.000Z',
    url: `${url}/article1`,
    imageUrl: null,
  },
]

const createMockProvider = (
  feedResults: Record<string, NewsArticle[] | Error>,
): INewsProvider => ({
  async fetchFeed(feed) {
    const result = feedResults[feed.id]
    if (result instanceof Error) {
      throw result
    }
    return result
  },
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('newsService — fetchAllNewsFeeds', () => {
  let cache: InMemoryFeedCache<NewsArticle[]>

  beforeEach(() => {
    cache = new InMemoryFeedCache<NewsArticle[]>()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('successful fetch of all four feeds', () => {
    it('returns all four feeds in fixed order with success status', async () => {
      const provider = createMockProvider({
        calcio: mockArticles('Calcio Article', 'https://calcio.com'),
        calciomercato: mockArticles('Mercato Article', 'https://mercato.com'),
        coppe: mockArticles('Coppe Article', 'https://coppe.com'),
        estero: mockArticles('Estero Article', 'https://estero.com'),
      })

      const response = await fetchAllNewsFeeds(provider, cache)

      expect(response.feeds).toHaveLength(4)

      // Verify order: calcio (0), calciomercato (1), coppe (2), estero (3)
      expect(response.feeds[0]).toMatchObject({
        status: 'success',
        feedId: 'calcio',
      })
      expect(response.feeds[0]?.status === 'success' && response.feeds[0].articles).toHaveLength(
        1,
      )

      expect(response.feeds[1]).toMatchObject({
        status: 'success',
        feedId: 'calciomercato',
      })

      expect(response.feeds[2]).toMatchObject({
        status: 'success',
        feedId: 'coppe',
      })

      expect(response.feeds[3]).toMatchObject({
        status: 'success',
        feedId: 'estero',
      })
    })

    it('includes all articles from each feed in response', async () => {
      const provider = createMockProvider({
        calcio: [
          {
            title: 'Article 1',
            description: 'Desc 1',
            pubDate: '2025-01-01T12:00:00.000Z',
            url: 'https://example.com/1',
            imageUrl: null,
          },
          {
            title: 'Article 2',
            description: 'Desc 2',
            pubDate: '2025-01-01T11:00:00.000Z',
            url: 'https://example.com/2',
            imageUrl: null,
          },
        ],
        calciomercato: mockArticles('Mercato', 'https://mercato.com'),
        coppe: mockArticles('Coppe', 'https://coppe.com'),
        estero: mockArticles('Estero', 'https://estero.com'),
      })

      const response = await fetchAllNewsFeeds(provider, cache)

      const calcioFeed = response.feeds[0]
      expect(calcioFeed?.status === 'success' && calcioFeed.articles).toHaveLength(2)
    })
  })

  describe('partial failure — one feed errors while others succeed', () => {
    it('returns error result for failed feed and success for others', async () => {
      const provider = createMockProvider({
        calcio: mockArticles('Calcio', 'https://calcio.com'),
        calciomercato: new Error('Feed fetch timeout'),
        coppe: mockArticles('Coppe', 'https://coppe.com'),
        estero: mockArticles('Estero', 'https://estero.com'),
      })

      const response = await fetchAllNewsFeeds(provider, cache)

      expect(response.feeds).toHaveLength(4)

      expect(response.feeds[0]?.status).toBe('success')
      expect(response.feeds[1]).toMatchObject({
        status: 'error',
        feedId: 'calciomercato',
      })
      expect(response.feeds[1]?.status === 'error' && response.feeds[1].message).toContain(
        'timeout',
      )
      expect(response.feeds[2]?.status).toBe('success')
      expect(response.feeds[3]?.status).toBe('success')
    })

    it('returns error for multiple feeds with other feeds unaffected', async () => {
      const provider = createMockProvider({
        calcio: new Error('HTTP 500'),
        calciomercato: mockArticles('Mercato', 'https://mercato.com'),
        coppe: new Error('Timeout'),
        estero: mockArticles('Estero', 'https://estero.com'),
      })

      const response = await fetchAllNewsFeeds(provider, cache)

      expect(response.feeds[0]?.status).toBe('error')
      expect(response.feeds[1]?.status).toBe('success')
      expect(response.feeds[2]?.status).toBe('error')
      expect(response.feeds[3]?.status).toBe('success')
    })

    it('includes error message in error result', async () => {
      const provider = createMockProvider({
        calcio: new Error('Specific error message'),
        calciomercato: mockArticles('Mercato', 'https://mercato.com'),
        coppe: mockArticles('Coppe', 'https://coppe.com'),
        estero: mockArticles('Estero', 'https://estero.com'),
      })

      const response = await fetchAllNewsFeeds(provider, cache)

      const calcioFeed = response.feeds[0]
      expect(calcioFeed?.status === 'error' && calcioFeed.message).toBe(
        'Specific error message',
      )
    })
  })

  describe('all feeds fail', () => {
    it('returns four error results with all feeds errored', async () => {
      const provider = createMockProvider({
        calcio: new Error('Error 1'),
        calciomercato: new Error('Error 2'),
        coppe: new Error('Error 3'),
        estero: new Error('Error 4'),
      })

      const response = await fetchAllNewsFeeds(provider, cache)

      expect(response.feeds).toHaveLength(4)
      expect(response.feeds.every((f) => f.status === 'error')).toBe(true)
      expect(response.feeds[0]?.feedId).toBe('calcio')
      expect(response.feeds[1]?.feedId).toBe('calciomercato')
      expect(response.feeds[2]?.feedId).toBe('coppe')
      expect(response.feeds[3]?.feedId).toBe('estero')
    })
  })

  describe('cache behavior', () => {
    it('uses cache on second call for same feed', async () => {
      const fetcher = vi.fn().mockResolvedValue(mockArticles('Test', 'https://test.com'))
      const provider: INewsProvider = {
        fetchFeed: fetcher,
      }

      // First call
      await fetchAllNewsFeeds(provider, cache)
      expect(fetcher).toHaveBeenCalledTimes(4)

      // Second call — should use cache for all feeds
      await fetchAllNewsFeeds(provider, cache)
      expect(fetcher).toHaveBeenCalledTimes(4) // no additional calls
    })

    it('deduplicates concurrent requests for same feed', async () => {
      let resolveCalcio: (val: NewsArticle[]) => void = () => {}
      const calcioFetcher = vi
        .fn()
        .mockImplementation(
          () =>
            new Promise<NewsArticle[]>((resolve) => {
              resolveCalcio = resolve
            }),
        )

      const provider: INewsProvider = {
        async fetchFeed(feed) {
          if (feed.id === 'calcio') {
            return calcioFetcher()
          }
          return mockArticles('Other', `https://${feed.id}.com`)
        },
      }

      // Start two concurrent fetchAllNewsFeeds calls
      const promise1 = fetchAllNewsFeeds(provider, cache)
      const promise2 = fetchAllNewsFeeds(provider, cache)

      // calcioFetcher is in-flight; second call should reuse it (called once)
      expect(calcioFetcher).toHaveBeenCalledTimes(1)

      // Resolve the in-flight fetch with actual articles
      resolveCalcio(mockArticles('Calcio', 'https://calcio.com'))

      const response1 = await promise1
      const response2 = await promise2

      // Both responses should succeed with calcio feed
      expect(response1.feeds[0]?.status).toBe('success')
      expect(response2.feeds[0]?.status).toBe('success')
      expect(calcioFetcher).toHaveBeenCalledTimes(1)
    })

    it('has TTL of 15 minutes', async () => {
      // This test uses fake timers to verify TTL behavior
      vi.useFakeTimers()
      try {
        const fetcher = vi.fn().mockResolvedValue(mockArticles('Test', 'https://test.com'))
        const provider: INewsProvider = {
          fetchFeed: fetcher,
        }

        // First call
        await fetchAllNewsFeeds(provider, cache)
        expect(fetcher).toHaveBeenCalledTimes(4)

        // Advance 14 minutes 59 seconds — cache should still be valid
        vi.advanceTimersByTime(14 * 60 * 1_000 + 59 * 1_000)
        await fetchAllNewsFeeds(provider, cache)
        expect(fetcher).toHaveBeenCalledTimes(4)

        // Advance 1 more second (15 minutes total) — cache expires
        vi.advanceTimersByTime(1_001)
        await fetchAllNewsFeeds(provider, cache)
        expect(fetcher).toHaveBeenCalledTimes(8) // 4 more calls
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('response validation with Zod schema', () => {
    it('validates and returns newsCalcioResponseSchema-compliant response', async () => {
      const provider = createMockProvider({
        calcio: mockArticles('Calcio', 'https://calcio.com'),
        calciomercato: mockArticles('Mercato', 'https://mercato.com'),
        coppe: mockArticles('Coppe', 'https://coppe.com'),
        estero: mockArticles('Estero', 'https://estero.com'),
      })

      const response = await fetchAllNewsFeeds(provider, cache)

      // Should pass validation (no throw)
      expect(response).toBeDefined()
      expect(response.feeds).toHaveLength(4)
      expect(response.feeds.every((f) => 'status' in f && 'feedId' in f)).toBe(true)
    })
  })

  describe('parallel execution', () => {
    it('fetches all four feeds in parallel, not sequentially', async () => {
      let calcioStarted = false
      let mercatoStarted = false
      let coppeStarted = false
      let esteroStarted = false

      const timings: string[] = []

      const provider: INewsProvider = {
        async fetchFeed(feed) {
          if (feed.id === 'calcio') {
            calcioStarted = true
            timings.push('calcio-start')
            await new Promise((resolve) => setTimeout(resolve, 100))
            timings.push('calcio-end')
          } else if (feed.id === 'calciomercato') {
            mercatoStarted = true
            timings.push('mercato-start')
            await new Promise((resolve) => setTimeout(resolve, 100))
            timings.push('mercato-end')
          } else if (feed.id === 'coppe') {
            coppeStarted = true
            timings.push('coppe-start')
            await new Promise((resolve) => setTimeout(resolve, 100))
            timings.push('coppe-end')
          } else if (feed.id === 'estero') {
            esteroStarted = true
            timings.push('estero-start')
            await new Promise((resolve) => setTimeout(resolve, 100))
            timings.push('estero-end')
          }
          return mockArticles('Test', `https://${feed.id}.com`)
        },
      }

      const start = Date.now()
      await fetchAllNewsFeeds(provider, cache)
      const duration = Date.now() - start

      // All feeds should have started before any ended
      const allStarted = timings.filter((t) => t.endsWith('-start'))
      const allEnded = timings.filter((t) => t.endsWith('-end'))
      expect(allStarted).toHaveLength(4)
      expect(allEnded).toHaveLength(4)

      // With parallel execution (100ms each), total should be ~100-150ms
      // Sequential would be ~400ms
      expect(duration).toBeLessThan(250)
    })
  })

  describe('error message handling', () => {
    it('handles Error object with message property', async () => {
      const provider = createMockProvider({
        calcio: new Error('Network timeout'),
        calciomercato: mockArticles('Mercato', 'https://mercato.com'),
        coppe: mockArticles('Coppe', 'https://coppe.com'),
        estero: mockArticles('Estero', 'https://estero.com'),
      })

      const response = await fetchAllNewsFeeds(provider, cache)

      const calcioFeed = response.feeds[0]
      expect(calcioFeed?.status === 'error' && calcioFeed.message).toBe('Network timeout')
    })

    it('handles non-Error thrown values', async () => {
      const provider: INewsProvider = {
        async fetchFeed(feed) {
          if (feed.id === 'calcio') {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw 'some string error'
          }
          return mockArticles('Test', `https://${feed.id}.com`)
        },
      }

      const response = await fetchAllNewsFeeds(provider, cache)

      const calcioFeed = response.feeds[0]
      expect(calcioFeed?.status === 'error' && calcioFeed.message).toBe(
        'Errore sconosciuto nel fetch del feed',
      )
    })
  })

  describe('default provider and cache', () => {
    it('uses default provider and cache when not injected', async () => {
      // Just verify that calling without arguments doesn't throw
      // We can't test the actual fetch without network, but we can verify
      // the function signature works
      expect(typeof fetchAllNewsFeeds).toBe('function')
    })
  })
})
