/**
 * newsCache.test — unit tests for InMemoryFeedCache.
 *
 * Validates:
 * - TTL-based cache expiration
 * - In-flight request deduplication (concurrent requests for same key)
 * - Cache hit/miss behavior
 * - invalidate() and clear() operations
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { InMemoryFeedCache } from '~/server/api/news/cache/newsCache'

describe('InMemoryFeedCache', () => {
  let cache: InMemoryFeedCache<string>

  beforeEach(() => {
    cache = new InMemoryFeedCache<string>()
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('cache hit and miss', () => {
    it('returns cached value without calling fetcher on hit', async () => {
      const fetcher = vi.fn().mockResolvedValue('cached-value')

      const result1 = await cache.getOrFetch('key1', 10_000, fetcher)
      const result2 = await cache.getOrFetch('key1', 10_000, fetcher)

      expect(result1).toBe('cached-value')
      expect(result2).toBe('cached-value')
      expect(fetcher).toHaveBeenCalledTimes(1)
    })

    it('calls fetcher on cache miss (new key)', async () => {
      const fetcher = vi.fn().mockResolvedValue('value')

      const result = await cache.getOrFetch('new-key', 10_000, fetcher)

      expect(result).toBe('value')
      expect(fetcher).toHaveBeenCalledOnce()
    })

    it('calls fetcher again after cache expiration', async () => {
      const fetcher = vi.fn().mockResolvedValue('value')

      const result1 = await cache.getOrFetch('key1', 5_000, fetcher)
      expect(result1).toBe('value')
      expect(fetcher).toHaveBeenCalledTimes(1)

      // Advance time past TTL
      vi.advanceTimersByTime(5_001)

      const result2 = await cache.getOrFetch('key1', 5_000, fetcher)
      expect(result2).toBe('value')
      expect(fetcher).toHaveBeenCalledTimes(2)
    })
  })

  describe('in-flight deduplication', () => {
    it('deduplicates concurrent requests for same key', async () => {
      let resolveFirst: (val: string) => void = () => {}
      const fetcher = vi.fn(
        () =>
          new Promise<string>((resolve) => {
            resolveFirst = resolve
          }),
      )

      // Fire two concurrent requests
      const promise1 = cache.getOrFetch('key1', 10_000, fetcher)
      const promise2 = cache.getOrFetch('key1', 10_000, fetcher)

      // fetcher was only called once (not twice) — deduplication verified by call count
      expect(fetcher).toHaveBeenCalledTimes(1)

      // Resolve the in-flight promise
      resolveFirst('shared-result')

      const result1 = await promise1
      const result2 = await promise2

      expect(result1).toBe('shared-result')
      expect(result2).toBe('shared-result')
    })

    it('handles multiple concurrent requests from three callers', async () => {
      let resolveFirst: (val: string) => void = () => {}
      const fetcher = vi.fn(
        () =>
          new Promise<string>((resolve) => {
            resolveFirst = resolve
          }),
      )

      const p1 = cache.getOrFetch('key1', 10_000, fetcher)
      const p2 = cache.getOrFetch('key1', 10_000, fetcher)
      const p3 = cache.getOrFetch('key1', 10_000, fetcher)

      // All three calls should reuse the same in-flight fetcher (called once)
      expect(fetcher).toHaveBeenCalledTimes(1)

      resolveFirst('result')

      expect(await p1).toBe('result')
      expect(await p2).toBe('result')
      expect(await p3).toBe('result')
    })

    it('cleans up in-flight promise on error', async () => {
      const error = new Error('Fetch failed')
      const fetcher = vi.fn().mockRejectedValue(error)

      // First attempt fails
      await expect(cache.getOrFetch('key1', 10_000, fetcher)).rejects.toThrow(
        'Fetch failed',
      )
      expect(fetcher).toHaveBeenCalledTimes(1)

      // Second attempt after error should retry (not reuse failed promise)
      const fetcher2 = vi.fn().mockResolvedValue('success')
      const result = await cache.getOrFetch('key1', 10_000, fetcher2)

      expect(result).toBe('success')
      expect(fetcher2).toHaveBeenCalledTimes(1)
    })

    it('allows new request after expired cache entry', async () => {
      const fetcher1 = vi.fn().mockResolvedValue('value1')

      const result1 = await cache.getOrFetch('key1', 5_000, fetcher1)
      expect(result1).toBe('value1')
      expect(fetcher1).toHaveBeenCalledTimes(1)

      // Advance past TTL
      vi.advanceTimersByTime(5_001)

      const fetcher2 = vi.fn().mockResolvedValue('value2')
      const result2 = await cache.getOrFetch('key1', 5_000, fetcher2)

      expect(result2).toBe('value2')
      expect(fetcher2).toHaveBeenCalledTimes(1)
    })
  })

  describe('TTL and expiration', () => {
    it('expires entry at correct time', async () => {
      const fetcher = vi.fn().mockResolvedValue('value')

      await cache.getOrFetch('key1', 5_000, fetcher)
      expect(fetcher).toHaveBeenCalledTimes(1)

      // Just before expiration — should still be cached
      vi.advanceTimersByTime(4_999)
      await cache.getOrFetch('key1', 5_000, fetcher)
      expect(fetcher).toHaveBeenCalledTimes(1)

      // At exact expiration time — should be expired
      vi.advanceTimersByTime(1)
      await cache.getOrFetch('key1', 5_000, fetcher)
      expect(fetcher).toHaveBeenCalledTimes(2)
    })

    it('supports different TTL values for different keys', async () => {
      const fetcher1 = vi.fn().mockResolvedValue('value1')
      const fetcher2 = vi.fn().mockResolvedValue('value2')

      await cache.getOrFetch('key1', 3_000, fetcher1)
      await cache.getOrFetch('key2', 5_000, fetcher2)

      // key1 expires first
      vi.advanceTimersByTime(3_001)
      await cache.getOrFetch('key1', 3_000, fetcher1)
      expect(fetcher1).toHaveBeenCalledTimes(2) // expired and refetched

      await cache.getOrFetch('key2', 5_000, fetcher2)
      expect(fetcher2).toHaveBeenCalledTimes(1) // still cached
    })
  })

  describe('invalidate and clear', () => {
    it('invalidates a specific cache entry', async () => {
      const fetcher = vi.fn().mockResolvedValue('value')

      await cache.getOrFetch('key1', 10_000, fetcher)
      expect(fetcher).toHaveBeenCalledTimes(1)

      cache.invalidate('key1')

      await cache.getOrFetch('key1', 10_000, fetcher)
      expect(fetcher).toHaveBeenCalledTimes(2)
    })

    it('does not affect other entries on invalidate', async () => {
      const fetcher1 = vi.fn().mockResolvedValue('value1')
      const fetcher2 = vi.fn().mockResolvedValue('value2')

      await cache.getOrFetch('key1', 10_000, fetcher1)
      await cache.getOrFetch('key2', 10_000, fetcher2)

      cache.invalidate('key1')

      await cache.getOrFetch('key1', 10_000, fetcher1)
      await cache.getOrFetch('key2', 10_000, fetcher2)

      expect(fetcher1).toHaveBeenCalledTimes(2) // refetched
      expect(fetcher2).toHaveBeenCalledTimes(1) // still cached
    })

    it('clears all cache entries', async () => {
      const fetcher1 = vi.fn().mockResolvedValue('value1')
      const fetcher2 = vi.fn().mockResolvedValue('value2')
      const fetcher3 = vi.fn().mockResolvedValue('value3')

      await cache.getOrFetch('key1', 10_000, fetcher1)
      await cache.getOrFetch('key2', 10_000, fetcher2)
      await cache.getOrFetch('key3', 10_000, fetcher3)

      cache.clear()

      await cache.getOrFetch('key1', 10_000, fetcher1)
      await cache.getOrFetch('key2', 10_000, fetcher2)
      await cache.getOrFetch('key3', 10_000, fetcher3)

      expect(fetcher1).toHaveBeenCalledTimes(2)
      expect(fetcher2).toHaveBeenCalledTimes(2)
      expect(fetcher3).toHaveBeenCalledTimes(2)
    })

    it('cancels in-flight requests on invalidate', async () => {
      let resolveFirst: (val: string) => void = () => {}
      const fetcher = vi
        .fn()
        .mockImplementation(
          () =>
            new Promise<string>((resolve) => {
              resolveFirst = resolve
            }),
        )

      const promise1 = cache.getOrFetch('key1', 10_000, fetcher)
      cache.invalidate('key1')

      // After invalidate, the in-flight promise should be removed
      // Next call should create a new fetch
      const promise2 = cache.getOrFetch('key1', 10_000, fetcher)

      // The two promises should be different (not deduplicated)
      expect(promise1).not.toBe(promise2)
    })
  })

  describe('error handling', () => {
    it('propagates fetcher errors to caller', async () => {
      const error = new Error('Network error')
      const fetcher = vi.fn().mockRejectedValue(error)

      await expect(cache.getOrFetch('key1', 10_000, fetcher)).rejects.toThrow(
        'Network error',
      )
    })

    it('does not cache on error', async () => {
      const fetcher = vi
        .fn()
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce('success')

      await expect(cache.getOrFetch('key1', 10_000, fetcher)).rejects.toThrow(
        'First error',
      )

      const result = await cache.getOrFetch('key1', 10_000, fetcher)
      expect(result).toBe('success')
      expect(fetcher).toHaveBeenCalledTimes(2)
    })

    it('shares error among concurrent callers', async () => {
      const error = new Error('Shared error')
      let rejectFirst: (err: Error) => void = () => {}
      const fetcher = vi.fn(
        () =>
          new Promise<string>((_resolve, reject) => {
            rejectFirst = reject
          }),
      )

      const promise1 = cache.getOrFetch('key1', 10_000, fetcher)
      const promise2 = cache.getOrFetch('key1', 10_000, fetcher)

      // Both should be waiting for same fetcher (called once)
      expect(fetcher).toHaveBeenCalledTimes(1)

      rejectFirst(error)

      await expect(promise1).rejects.toThrow('Shared error')
      await expect(promise2).rejects.toThrow('Shared error')
    })
  })

  describe('generic type support', () => {
    it('works with string values', async () => {
      const cache = new InMemoryFeedCache<string>()
      const fetcher = vi.fn().mockResolvedValue('string-value')

      const result = await cache.getOrFetch('key', 10_000, fetcher)
      expect(result).toBe('string-value')
    })

    it('works with array values', async () => {
      const cache = new InMemoryFeedCache<string[]>()
      const fetcher = vi.fn().mockResolvedValue(['a', 'b', 'c'])

      const result = await cache.getOrFetch('key', 10_000, fetcher)
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('works with object values', async () => {
      interface Article {
        title: string
        url: string
      }
      const cache = new InMemoryFeedCache<Article>()
      const article: Article = { title: 'Test', url: 'https://example.com' }
      const fetcher = vi.fn().mockResolvedValue(article)

      const result = await cache.getOrFetch('key', 10_000, fetcher)
      expect(result).toEqual(article)
    })
  })
})
