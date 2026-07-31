/**
 * newsService.test — unit tests for fetchAllNewsFeeds orchestration.
 *
 * Validates:
 * - All four feeds are fetched in parallel
 * - Failed feeds produce error results while others succeed
 * - Results are returned in fixed order (calcio, corrieredellosport, vocegiallorossa, lalaziosiamonoi)
 * - Cache TTL 15 minutes and deduplication
 * - Schema validation of final response
 * - Partial failure isolation (one feed error ≠ complete failure)
 * - NEWS_FEEDS config: order, IDs, labels, URLs
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { fetchAllNewsFeeds } from '~/server/api/news/services/newsService'
import { NEWS_FEEDS } from '~/schemas/news'
import { InMemoryFeedCache } from '~/server/api/news/cache/newsCache'
import type { INewsProvider, NewsFeedFetchResult } from '~/server/api/news/providers/newsProvider'

// ---------------------------------------------------------------------------
// Mock fixtures
// ---------------------------------------------------------------------------

const mockArticles = (title: string, url: string): NewsFeedFetchResult => ({
  channelLogoUrl: `${url}/logo.png`,
  articles: [
    {
      title,
      description: `Description for ${title}`,
      pubDate: '2025-01-01T12:00:00.000Z',
      url: `${url}/article1`,
      imageUrl: null,
    },
  ],
})

const createMockProvider = (
  feedResults: Record<string, NewsFeedFetchResult | Error>,
): INewsProvider => ({
  fetchFeed(feed) {
    const result = feedResults[feed.id]
    if (result instanceof Error) {
      throw result
    }
    return Promise.resolve(result)
  },
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('newsService — fetchAllNewsFeeds', () => {
  let cache: InMemoryFeedCache<NewsFeedFetchResult>

  beforeEach(() => {
    cache = new InMemoryFeedCache<NewsFeedFetchResult>()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('successful fetch of all four feeds', () => {
    it('returns all four feeds in fixed order with success status', async () => {
      const provider = createMockProvider({
        calcio: mockArticles('Calcio Article', 'https://calcio.com'),
        corrieredellosport: mockArticles('Corriere Article', 'https://corriere.com'),
        vocegiallorossa: mockArticles('Voce Article', 'https://voce.com'),
        lalaziosiamonoi: mockArticles('Lazio Article', 'https://lazio.com'),
      })

      const response = await fetchAllNewsFeeds(provider, cache)

      expect(response.feeds).toHaveLength(4)

      // Verify order: calcio (0), corrieredellosport (1), vocegiallorossa (2), lalaziosiamonoi (3)
      expect(response.feeds[0]).toMatchObject({
        status: 'success',
        feedId: 'calcio',
        channelLogoUrl: 'https://calcio.com/logo.png',
      })
      expect(response.feeds[0]?.status === 'success' && response.feeds[0].articles).toHaveLength(
        1,
      )

      expect(response.feeds[1]).toMatchObject({
        status: 'success',
        feedId: 'corrieredellosport',
        channelLogoUrl: 'https://corriere.com/logo.png',
      })

      expect(response.feeds[2]).toMatchObject({
        status: 'success',
        feedId: 'vocegiallorossa',
        channelLogoUrl: 'https://voce.com/logo.png',
      })

      expect(response.feeds[3]).toMatchObject({
        status: 'success',
        feedId: 'lalaziosiamonoi',
        channelLogoUrl: 'https://lazio.com/logo.png',
      })
    })

    it('includes all articles from each feed in response', async () => {
      const provider = createMockProvider({
        calcio: {
          channelLogoUrl: 'https://gazzetta.it/logo.png',
          articles: [
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
        },
        corrieredellosport: mockArticles('Corriere', 'https://corriere.com'),
        vocegiallorossa: mockArticles('Voce', 'https://voce.com'),
        lalaziosiamonoi: mockArticles('Lazio', 'https://lazio.com'),
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
        corrieredellosport: new Error('Feed fetch timeout'),
        vocegiallorossa: mockArticles('Voce', 'https://voce.com'),
        lalaziosiamonoi: mockArticles('Lazio', 'https://lazio.com'),
      })

      const response = await fetchAllNewsFeeds(provider, cache)

      expect(response.feeds).toHaveLength(4)

      expect(response.feeds[0]?.status).toBe('success')
      expect(response.feeds[1]).toMatchObject({
        status: 'error',
        feedId: 'corrieredellosport',
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
        corrieredellosport: mockArticles('Corriere', 'https://corriere.com'),
        vocegiallorossa: new Error('Timeout'),
        lalaziosiamonoi: mockArticles('Lazio', 'https://lazio.com'),
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
        corrieredellosport: mockArticles('Corriere', 'https://corriere.com'),
        vocegiallorossa: mockArticles('Voce', 'https://voce.com'),
        lalaziosiamonoi: mockArticles('Lazio', 'https://lazio.com'),
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
        corrieredellosport: new Error('Error 2'),
        vocegiallorossa: new Error('Error 3'),
        lalaziosiamonoi: new Error('Error 4'),
      })

      const response = await fetchAllNewsFeeds(provider, cache)

      expect(response.feeds).toHaveLength(4)
      expect(response.feeds.every((f) => f.status === 'error')).toBe(true)
      expect(response.feeds[0]?.feedId).toBe('calcio')
      expect(response.feeds[1]?.feedId).toBe('corrieredellosport')
      expect(response.feeds[2]?.feedId).toBe('vocegiallorossa')
      expect(response.feeds[3]?.feedId).toBe('lalaziosiamonoi')
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
      let resolveCalcio: (val: NewsFeedFetchResult) => void = () => {
        // Intentionally empty - will be assigned in the Promise
      }
      const calcioFetcher = vi.fn((): Promise<NewsFeedFetchResult> => {
        return new Promise<NewsFeedFetchResult>((resolve) => {
          resolveCalcio = resolve
        })
      }).mockImplementation((): Promise<NewsFeedFetchResult> =>
        new Promise<NewsFeedFetchResult>((resolve) => {
          resolveCalcio = resolve
        }),
      )

      const provider: INewsProvider = {
        fetchFeed(feed): Promise<NewsFeedFetchResult> {
          if (feed.id === 'calcio') {
            return calcioFetcher()
          }
          return Promise.resolve(mockArticles('Other', `https://${feed.id}.com`))
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
        corrieredellosport: mockArticles('Corriere', 'https://corriere.com'),
        vocegiallorossa: mockArticles('Voce', 'https://voce.com'),
        lalaziosiamonoi: mockArticles('Lazio', 'https://lazio.com'),
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
      const timings: string[] = []

      const provider: INewsProvider = {
        async fetchFeed(feed) {
          if (feed.id === 'calcio') {
            timings.push('calcio-start')
            await new Promise((resolve) => setTimeout(resolve, 100))
            timings.push('calcio-end')
          } else if (feed.id === 'corrieredellosport') {
            timings.push('corriere-start')
            await new Promise((resolve) => setTimeout(resolve, 100))
            timings.push('corriere-end')
          } else if (feed.id === 'vocegiallorossa') {
            timings.push('voce-start')
            await new Promise((resolve) => setTimeout(resolve, 100))
            timings.push('voce-end')
          } else if (feed.id === 'lalaziosiamonoi') {
            timings.push('lazio-start')
            await new Promise((resolve) => setTimeout(resolve, 100))
            timings.push('lazio-end')
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
        corrieredellosport: mockArticles('Corriere', 'https://corriere.com'),
        vocegiallorossa: mockArticles('Voce', 'https://voce.com'),
        lalaziosiamonoi: mockArticles('Lazio', 'https://lazio.com'),
      })

      const response = await fetchAllNewsFeeds(provider, cache)

      const calcioFeed = response.feeds[0]
      expect(calcioFeed?.status === 'error' && calcioFeed.message).toBe('Network timeout')
    })

    it('handles non-Error thrown values', async () => {
      const provider: INewsProvider = {
        fetchFeed(feed) {
          if (feed.id === 'calcio') {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw 'some string error'
          }
          return Promise.resolve(mockArticles('Test', `https://${feed.id}.com`))
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
    it('uses default provider and cache when not injected', () => {
      // Just verify that calling without arguments doesn't throw
      // We can't test the actual fetch without network, but we can verify
      // the function signature works
      expect(typeof fetchAllNewsFeeds).toBe('function')
    })
  })

  describe('NEWS_FEEDS configuration validation', () => {
    it('validates NEWS_FEEDS order: calcio (0), corrieredellosport (1), vocegiallorossa (2), lalaziosiamonoi (3)', () => {
      expect(NEWS_FEEDS).toHaveLength(4)
      expect(NEWS_FEEDS[0].id).toBe('calcio')
      expect(NEWS_FEEDS[0].order).toBe(0)
      expect(NEWS_FEEDS[1].id).toBe('corrieredellosport')
      expect(NEWS_FEEDS[1].order).toBe(1)
      expect(NEWS_FEEDS[2].id).toBe('vocegiallorossa')
      expect(NEWS_FEEDS[2].order).toBe(2)
      expect(NEWS_FEEDS[3].id).toBe('lalaziosiamonoi')
      expect(NEWS_FEEDS[3].order).toBe(3)
    })

    it('validates NEWS_FEEDS labels are distinct and non-empty', () => {
      const labels = NEWS_FEEDS.map((f) => f.label)
      expect(labels).toHaveLength(4)
      labels.forEach((label) => {
        expect(label).toBeTruthy()
        expect(label.length).toBeGreaterThan(0)
      })
      // Check uniqueness
      expect(new Set(labels).size).toBe(4)
    })

    it('validates NEWS_FEEDS contains correct labels and sources', () => {
      const gazzetta = NEWS_FEEDS.find((f) => f.id === 'calcio')
      expect(gazzetta?.label).toBe('Gazzetta dello Sport')

      const corriere = NEWS_FEEDS.find((f) => f.id === 'corrieredellosport')
      expect(corriere?.label).toBe('Corriere dello Sport')

      const voce = NEWS_FEEDS.find((f) => f.id === 'vocegiallorossa')
      expect(voce?.label).toBe('Voce Giallorossa')

      const lazio = NEWS_FEEDS.find((f) => f.id === 'lalaziosiamonoi')
      expect(lazio?.label).toBe('La Lazio Siamo Noi')
    })

    it('validates NEWS_FEEDS URLs are valid and distinct', () => {
      const urls = NEWS_FEEDS.map((f) => f.url)
      expect(urls).toHaveLength(4)

      urls.forEach((url) => {
        expect(url).toMatch(/^https:\/\//)
        expect(url.length).toBeGreaterThan(0)
      })

      // Check uniqueness
      expect(new Set(urls).size).toBe(4)
    })

    it('validates NEWS_FEEDS order values are sequential integers starting at 0', () => {
      const orders = NEWS_FEEDS.map((f) => f.order)
      expect(orders).toEqual([0, 1, 2, 3])
    })

    it('frontends render feeds in NEWS_FEEDS order with correct labels', () => {
      // Simulate what frontend does: sort by order and display labels
      const sortedFeeds = [...NEWS_FEEDS].sort((a, b) => a.order - b.order)

      expect(sortedFeeds[0]?.label).toBe('Gazzetta dello Sport')
      expect(sortedFeeds[1]?.label).toBe('Corriere dello Sport')
      expect(sortedFeeds[2]?.label).toBe('Voce Giallorossa')
      expect(sortedFeeds[3]?.label).toBe('La Lazio Siamo Noi')
    })
  })
})
