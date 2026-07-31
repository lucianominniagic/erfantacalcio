/**
 * rssProvider.test — unit tests for RSS parsing, retry logic,
 * and image extraction from generic RSS feeds (Gazzetta, Corriere dello Sport,
 * Voce Giallorossa, La Lazio Siamo Noi).
 *
 * Uses mocked globalThis.fetch to avoid network calls and validate:
 * - HTTP error handling (4xx non-retryable vs 5xx retryable)
 * - Timeout behavior
 * - XML parsing and article normalization
 * - Image extraction from media:content, media:thumbnail, enclosure, <img> tags
 * - Date normalization to ISO 8601 UTC
 * - HTML stripping from descriptions
 * - Deterministic parsing errors don't retry
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { rssProvider } from '~/server/api/news/providers/rssProvider'
import type { NewsFeedMeta } from '~/schemas/news'

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const mockFeed: NewsFeedMeta = {
  id: 'calcio',
  label: 'Gazzetta dello Sport',
  url: 'https://www.gazzetta.it/dynamic-feed/rss/section/Calcio.xml',
  order: 0,
}

const minimalRssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <title>Test Article</title>
      <link>https://example.com/article1</link>
      <pubDate>Thu, 01 Jan 2025 12:00:00 +0000</pubDate>
      <description>Plain text description</description>
    </item>
  </channel>
</rss>`

const rssWithMediaContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <item>
      <title>Article with media:content</title>
      <link>https://example.com/article-media</link>
      <pubDate>Thu, 01 Jan 2025 12:00:00 +0000</pubDate>
      <description>Description</description>
      <media:content url="https://example.com/image.jpg" />
    </item>
  </channel>
</rss>`

const rssWithMediaThumbnail = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <item>
      <title>Article with media:thumbnail</title>
      <link>https://example.com/article-thumb</link>
      <pubDate>Thu, 01 Jan 2025 12:00:00 +0000</pubDate>
      <description>Description</description>
      <media:thumbnail url="https://example.com/thumb.jpg" />
    </item>
  </channel>
</rss>`

const rssWithEnclosure = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Article with enclosure</title>
      <link>https://example.com/article-enclosure</link>
      <pubDate>Thu, 01 Jan 2025 12:00:00 +0000</pubDate>
      <description>Description</description>
      <enclosure url="https://example.com/enclosure.jpg" type="image/jpeg" />
    </item>
  </channel>
</rss>`

const rssWithImageTag = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Article with img tag</title>
      <link>https://example.com/article-imgtag</link>
      <pubDate>Thu, 01 Jan 2025 12:00:00 +0000</pubDate>
      <description><![CDATA[<img src="https://example.com/img.jpg" /><p>Description</p>]]></description>
    </item>
  </channel>
</rss>`

const rssWithValidChannelLogo = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <image>
      <url>https://www.vocegiallorossa.it/logo.png</url>
    </image>
    <item>
      <title>Article with valid logo</title>
      <link>https://example.com/article-logo</link>
      <pubDate>Thu, 01 Jan 2025 12:00:00 +0000</pubDate>
      <description>Description</description>
    </item>
  </channel>
</rss>`

const rssWithLazioLogo = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <image>
      <url>https://www.lalaziosiamonoi.it/assets/logo.jpg</url>
    </image>
    <item>
      <title>La Lazio article</title>
      <link>https://example.com/lazio-article</link>
      <pubDate>Thu, 01 Jan 2025 12:00:00 +0000</pubDate>
      <description>La Lazio article description</description>
    </item>
  </channel>
</rss>`

const rssWithoutChannelLogo = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Feed without logo</title>
    <item>
      <title>Article without logo</title>
      <link>https://example.com/article-no-logo</link>
      <pubDate>Thu, 01 Jan 2025 12:00:00 +0000</pubDate>
      <description>Description</description>
    </item>
  </channel>
</rss>`

const rssWithMalformedChannelLogo = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <image>
      <url>not-a-valid-url</url>
    </image>
    <item>
      <title>Article with malformed logo URL</title>
      <link>https://example.com/article-bad-logo</link>
      <pubDate>Thu, 01 Jan 2025 12:00:00 +0000</pubDate>
      <description>Description</description>
    </item>
  </channel>
</rss>`

const rssWithEmptyChannelLogo = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <image>
      <url></url>
    </image>
    <item>
      <title>Article with empty logo URL</title>
      <link>https://example.com/article-empty-logo</link>
      <pubDate>Thu, 01 Jan 2025 12:00:00 +0000</pubDate>
      <description>Description</description>
    </item>
  </channel>
</rss>`

const rssWithHtmlDescription = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Article with HTML</title>
      <link>https://example.com/article-html</link>
      <pubDate>Thu, 01 Jan 2025 12:00:00 +0000</pubDate>
      <description><![CDATA[<p>This is <strong>bold</strong> text</p>]]></description>
    </item>
  </channel>
</rss>`

const rssMultipleArticles = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Article 1</title>
      <link>https://example.com/1</link>
      <pubDate>Thu, 01 Jan 2025 12:00:00 +0000</pubDate>
      <description>Desc 1</description>
    </item>
    <item>
      <title>Article 2</title>
      <link>https://example.com/2</link>
      <pubDate>Thu, 01 Jan 2025 11:00:00 +0000</pubDate>
      <description>Desc 2</description>
    </item>
    <item>
      <title>Article 3</title>
      <link>https://example.com/3</link>
      <pubDate>Thu, 01 Jan 2025 10:00:00 +0000</pubDate>
      <description>Desc 3</description>
    </item>
    <item>
      <title>Article 4</title>
      <link>https://example.com/4</link>
      <pubDate>Thu, 01 Jan 2025 09:00:00 +0000</pubDate>
      <description>Desc 4</description>
    </item>
    <item>
      <title>Article 5</title>
      <link>https://example.com/5</link>
      <pubDate>Thu, 01 Jan 2025 08:00:00 +0000</pubDate>
      <description>Desc 5</description>
    </item>
    <item>
      <title>Article 6</title>
      <link>https://example.com/6</link>
      <pubDate>Thu, 01 Jan 2025 07:00:00 +0000</pubDate>
      <description>Desc 6</description>
    </item>
  </channel>
</rss>`

const rssWithInvalidDate = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Article with bad date</title>
      <link>https://example.com/bad-date</link>
      <pubDate>not-a-date</pubDate>
      <description>Description</description>
    </item>
  </channel>
</rss>`

const rssMissingTitle = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <link>https://example.com/no-title</link>
      <pubDate>Thu, 01 Jan 2025 12:00:00 +0000</pubDate>
      <description>Description</description>
    </item>
  </channel>
</rss>`

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('rssProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('successful fetch and parse', () => {
    it('fetches and parses minimal RSS with valid article', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(minimalRssXml, { status: 200 }),
      )

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result).toHaveProperty('channelLogoUrl')
      expect(result).toHaveProperty('articles')
      expect(result.articles).toHaveLength(1)
      expect(result.articles[0]?.title).toBe('Test Article')
      expect(result.articles[0]?.url).toBe('https://example.com/article1')
      expect(result.articles[0]?.description).toBe('Plain text description')
      expect(result.articles[0]?.pubDate).toBe('2025-01-01T12:00:00.000Z')
      expect(result.articles[0]?.imageUrl).toBeNull()
    })

    it('extracts imageUrl from media:content tag', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(rssWithMediaContent, { status: 200 }),
      )

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result.articles).toHaveLength(1)
      expect(result.articles[0]?.imageUrl).toBe('https://example.com/image.jpg')
    })

    it('falls back to media:thumbnail when media:content is absent', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(rssWithMediaThumbnail, { status: 200 }),
      )

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result.articles).toHaveLength(1)
      expect(result.articles[0]?.imageUrl).toBe('https://example.com/thumb.jpg')
    })

    it('falls back to enclosure when media tags are absent', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(rssWithEnclosure, { status: 200 }),
      )

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result.articles).toHaveLength(1)
      expect(result.articles[0]?.imageUrl).toBe('https://example.com/enclosure.jpg')
    })

    it('extracts image from <img> tag in CDATA description', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(rssWithImageTag, { status: 200 }),
      )

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result.articles).toHaveLength(1)
      expect(result.articles[0]?.imageUrl).toBe('https://example.com/img.jpg')
    })

    it('strips HTML tags from description', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(rssWithHtmlDescription, { status: 200 }),
      )

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result.articles).toHaveLength(1)
      expect(result.articles[0]?.description).toBe('This is bold text')
    })

    it('limits results to NEWS_MAX_ARTICLES_PER_FEED', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(rssMultipleArticles, { status: 200 }),
      )

      const result = await rssProvider.fetchFeed(mockFeed)

      // 6 articles in feed, max 5 per spec
      expect(result.articles).toHaveLength(5)
      expect(result.articles[0]?.title).toBe('Article 1')
      expect(result.articles[4]?.title).toBe('Article 5')
    })

    it('normalizes RFC 822 date to ISO 8601 UTC', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(minimalRssXml, { status: 200 }),
      )

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result.articles[0]?.pubDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })
  })

  describe('error handling — non-retryable (4xx, parsing)', () => {
    it('throws immediately on HTTP 404 without retry', async () => {
      let callCount = 0
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++
        return Promise.resolve(
          new Response('Not Found', { status: 404, statusText: 'Not Found' }),
        )
      })

      await expect(rssProvider.fetchFeed(mockFeed)).rejects.toThrow(
        /HTTP 404/,
      )

      expect(callCount).toBe(1)
    })

    it('throws immediately on HTTP 403 Forbidden without retry', async () => {
      let callCount = 0
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++
        return Promise.resolve(
          new Response('Forbidden', { status: 403, statusText: 'Forbidden' }),
        )
      })

      await expect(rssProvider.fetchFeed(mockFeed)).rejects.toThrow(
        /HTTP 403/,
      )

      expect(callCount).toBe(1)
    })

    it('discards article with unparseable date and throws if no valid articles', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(rssWithInvalidDate, { status: 200 }),
      )

      // When the only article has an invalid date, it gets discarded,
      // resulting in zero valid articles → throws "no valid articles" error
      await expect(rssProvider.fetchFeed(mockFeed)).rejects.toThrow(
        /nessun articolo valido/,
      )
    })

    it('throws when RSS contains no valid articles', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(rssMissingTitle, { status: 200 }),
      )

      await expect(rssProvider.fetchFeed(mockFeed)).rejects.toThrow(
        /nessun articolo valido/,
      )
    })

    it('throws when response body is not XML', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response('<not xml', { status: 200 }),
      )

      // XML parser should fail, throw immediately
      await expect(rssProvider.fetchFeed(mockFeed)).rejects.toThrow()
    })
  })

  describe('error handling — retryable (5xx, timeout, network)', () => {
    it('retries on HTTP 500 and eventually succeeds', async () => {
      let callCount = 0
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount < 2) {
          return Promise.resolve(
            new Response('Server Error', { status: 500, statusText: 'Internal Server Error' }),
          )
        }
        return Promise.resolve(new Response(minimalRssXml, { status: 200 }))
      })

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result.articles).toHaveLength(1)
      expect(callCount).toBe(2)
    })

    it('retries on HTTP 503 and eventually succeeds', async () => {
      let callCount = 0
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount < 2) {
          return Promise.resolve(
            new Response('Service Unavailable', {
              status: 503,
              statusText: 'Service Unavailable',
            }),
          )
        }
        return Promise.resolve(new Response(minimalRssXml, { status: 200 }))
      })

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result.articles).toHaveLength(1)
      expect(callCount).toBe(2)
    })

    it('retries on network error and eventually succeeds', async () => {
      let callCount = 0
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount < 2) {
          return Promise.reject(new Error('Network timeout'))
        }
        return Promise.resolve(new Response(minimalRssXml, { status: 200 }))
      })

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result.articles).toHaveLength(1)
      expect(callCount).toBe(2)
    })

    it('retries up to MAX_RETRIES times before failing', async () => {
      let callCount = 0
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++
        return Promise.reject(new Error('Network error'))
      })

      await expect(rssProvider.fetchFeed(mockFeed)).rejects.toThrow(
        /Network error/,
      )

      // 1 initial attempt + 2 retries = 3 total
      expect(callCount).toBe(3)
    })

    it('throws timeout error on AbortSignal timeout', async () => {
      global.fetch = vi.fn().mockImplementation(() => {
        return Promise.reject(new DOMException('aborted', 'AbortError'))
      })

      await expect(rssProvider.fetchFeed(mockFeed)).rejects.toThrow()
    })
  })

  describe('fetch headers and configuration', () => {
    it('sends Accept header with RSS/XML types', async () => {
      let capturedInit: RequestInit | undefined
      global.fetch = vi.fn().mockImplementation((_url: unknown, init?: RequestInit) => {
        capturedInit = init
        return Promise.resolve(new Response(minimalRssXml, { status: 200 }))
      })

      await rssProvider.fetchFeed(mockFeed)

      expect(capturedInit?.headers).toBeDefined()
      const headers = capturedInit?.headers as Record<string, string>
      expect(headers.Accept).toContain('application/rss+xml')
    })

    it('sends User-Agent header', async () => {
      let capturedInit: RequestInit | undefined
      global.fetch = vi.fn().mockImplementation((_url: unknown, init?: RequestInit) => {
        capturedInit = init
        return Promise.resolve(new Response(minimalRssXml, { status: 200 }))
      })

      await rssProvider.fetchFeed(mockFeed)

      expect(capturedInit?.headers).toBeDefined()
      const headers = capturedInit?.headers as Record<string, string>
      expect(headers['User-Agent']).toContain('ErFantacalcio')
    })

    it('sets cache: no-store to bypass cache', async () => {
      let capturedInit: RequestInit | undefined
      global.fetch = vi.fn().mockImplementation((_url: unknown, init?: RequestInit) => {
        capturedInit = init
        return Promise.resolve(new Response(minimalRssXml, { status: 200 }))
      })

      await rssProvider.fetchFeed(mockFeed)

      expect(capturedInit?.cache).toBe('no-store')
    })
  })

  describe('article validation with Zod schema', () => {
    it('discards article with empty title', async () => {
      const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title></title>
      <link>https://example.com/empty-title</link>
      <pubDate>Thu, 01 Jan 2025 12:00:00 +0000</pubDate>
      <description>Description</description>
    </item>
    <item>
      <title>Valid Article</title>
      <link>https://example.com/valid</link>
      <pubDate>Thu, 01 Jan 2025 12:00:00 +0000</pubDate>
      <description>Description</description>
    </item>
  </channel>
</rss>`

      global.fetch = vi.fn().mockResolvedValue(new Response(rss, { status: 200 }))

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result.articles).toHaveLength(1)
      expect(result.articles[0]?.title).toBe('Valid Article')
    })

    it('discards article with invalid URL', async () => {
      const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Bad URL</title>
      <link>not-a-url</link>
      <pubDate>Thu, 01 Jan 2025 12:00:00 +0000</pubDate>
      <description>Description</description>
    </item>
    <item>
      <title>Valid Article</title>
      <link>https://example.com/valid</link>
      <pubDate>Thu, 01 Jan 2025 12:00:00 +0000</pubDate>
      <description>Description</description>
    </item>
  </channel>
</rss>`

      global.fetch = vi.fn().mockResolvedValue(new Response(rss, { status: 200 }))

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result.articles).toHaveLength(1)
      expect(result.articles[0]?.title).toBe('Valid Article')
    })

    it('allows nullable imageUrl', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(minimalRssXml, { status: 200 }),
      )

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result.articles[0]?.imageUrl).toBeNull()
      expect(() => {
        // Verify it passes validation
        expect(result.articles[0]).toHaveProperty('imageUrl')
      }).not.toThrow()
    })

    it('allows empty description string', async () => {
      const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Article with empty description</title>
      <link>https://example.com/article</link>
      <pubDate>Thu, 01 Jan 2025 12:00:00 +0000</pubDate>
      <description></description>
    </item>
  </channel>
</rss>`

      global.fetch = vi.fn().mockResolvedValue(new Response(rss, { status: 200 }))

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result.articles).toHaveLength(1)
      expect(result.articles[0]?.description).toBe('')
    })
  })

  describe('multi-source RSS compatibility', () => {
    it('handles different namespace declarations (media, content, etc)', async () => {
      const corriereFeed: NewsFeedMeta = {
        id: 'corrieredellosport',
        label: 'Corriere dello Sport',
        url: 'https://www.corrieredellosport.it/rss/calcio',
        order: 1,
      }

      global.fetch = vi.fn().mockResolvedValue(
        new Response(rssWithMediaContent, { status: 200 }),
      )

      const result = await rssProvider.fetchFeed(corriereFeed)

      expect(result.articles).toHaveLength(1)
      expect(result.articles[0]?.imageUrl).toBe('https://example.com/image.jpg')
    })

    it('parses Voce Giallorossa RSS structure', async () => {
      const voceFeed: NewsFeedMeta = {
        id: 'vocegiallorossa',
        label: 'Voce Giallorossa',
        url: 'https://www.vocegiallorossa.it/rss/',
        order: 2,
      }

      global.fetch = vi.fn().mockResolvedValue(
        new Response(minimalRssXml, { status: 200 }),
      )

      const result = await rssProvider.fetchFeed(voceFeed)

      expect(result.articles).toHaveLength(1)
      expect(result.articles[0]?.title).toBe('Test Article')
    })

    it('parses La Lazio Siamo Noi RSS structure', async () => {
      const lazioFeed: NewsFeedMeta = {
        id: 'lalaziosiamonoi',
        label: 'La Lazio Siamo Noi',
        url: 'https://www.lalaziosiamonoi.it/rss/',
        order: 3,
      }

      global.fetch = vi.fn().mockResolvedValue(
        new Response(rssWithEnclosure, { status: 200 }),
      )

      const result = await rssProvider.fetchFeed(lazioFeed)

      expect(result.articles).toHaveLength(1)
      expect(result.articles[0]?.imageUrl).toBe('https://example.com/enclosure.jpg')
    })
  })

  describe('channel logo extraction — <channel><image><url>', () => {
    it('extracts valid Voce Giallorossa style channel logo URL', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(rssWithValidChannelLogo, { status: 200 }),
      )

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result.channelLogoUrl).toBe('https://www.vocegiallorossa.it/logo.png')
      expect(result.articles).toHaveLength(1)
    })

    it('extracts valid La Lazio Siamo Noi style channel logo URL', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(rssWithLazioLogo, { status: 200 }),
      )

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result.channelLogoUrl).toBe('https://www.lalaziosiamonoi.it/assets/logo.jpg')
      expect(result.articles).toHaveLength(1)
    })

    it('returns null when channel logo tag is missing', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(rssWithoutChannelLogo, { status: 200 }),
      )

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result.channelLogoUrl).toBeNull()
      expect(result.articles).toHaveLength(1)
    })

    it('returns null when channel logo URL is malformed', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(rssWithMalformedChannelLogo, { status: 200 }),
      )

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result.channelLogoUrl).toBeNull()
      // Article parsing should not fail when logo URL is invalid
      expect(result.articles).toHaveLength(1)
      expect(result.articles[0]?.title).toBe('Article with malformed logo URL')
    })

    it('returns null when channel logo URL is empty string', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(rssWithEmptyChannelLogo, { status: 200 }),
      )

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result.channelLogoUrl).toBeNull()
      // Article parsing should not fail when logo URL is empty
      expect(result.articles).toHaveLength(1)
      expect(result.articles[0]?.title).toBe('Article with empty logo URL')
    })

    it('does not affect article parsing when logo extraction fails', async () => {
      const rssWithBadLogoButGoodArticles = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <image>
      <url>definitely not a url!!!</url>
    </image>
    <item>
      <title>First Article</title>
      <link>https://example.com/article1</link>
      <pubDate>Thu, 01 Jan 2025 12:00:00 +0000</pubDate>
      <description>Valid article despite bad logo</description>
    </item>
    <item>
      <title>Second Article</title>
      <link>https://example.com/article2</link>
      <pubDate>Thu, 01 Jan 2025 11:00:00 +0000</pubDate>
      <description>Another valid article</description>
    </item>
  </channel>
</rss>`

      global.fetch = vi.fn().mockResolvedValue(
        new Response(rssWithBadLogoButGoodArticles, { status: 200 }),
      )

      const result = await rssProvider.fetchFeed(mockFeed)

      expect(result.channelLogoUrl).toBeNull()
      expect(result.articles).toHaveLength(2)
      expect(result.articles[0]?.title).toBe('First Article')
      expect(result.articles[1]?.title).toBe('Second Article')
    })
  })
})
