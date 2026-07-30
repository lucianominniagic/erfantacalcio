/**
 * gazzettaRssProvider — implementazione di INewsProvider per i feed RSS
 * della Gazzetta dello Sport.
 *
 * Caratteristiche:
 * - AbortSignal.timeout() con budget FETCH_TIMEOUT_MS per tentativo.
 * - Retry (max MAX_RETRIES extra tentativi) solo per errori HTTP 5xx e
 *   di rete; errori 4xx e di parsing vengono lanciati immediatamente.
 * - Parsing XML robusto con cheerio (xmlMode: true).
 * - Estrazione immagine da: media:content → media:thumbnail → enclosure →
 *   <img> nel testo CDATA della description.
 * - Date RFC 822 normalizzate in ISO 8601 UTC ("Z" è offset valido per
 *   z.string().datetime({ offset: true })).
 * - Descrizione: strippata di tag HTML, restituita come testo puro.
 * - Output validato articolo per articolo con newsArticleSchema; articoli
 *   non validi vengono scartati senza far fallire l'intero feed.
 */
import * as cheerio from 'cheerio'
import type { AnyNode } from 'domhandler'

import {
  newsArticleSchema,
  NEWS_MAX_ARTICLES_PER_FEED,
  type NewsArticle,
  type NewsFeedMeta,
} from '~/schemas/news'
import type { INewsProvider } from './newsProvider'

// ---------------------------------------------------------------------------
// Costanti
// ---------------------------------------------------------------------------

const FETCH_TIMEOUT_MS = 8_000
const MAX_RETRIES = 2
const RETRY_DELAY_BASE_MS = 300

// ---------------------------------------------------------------------------
// Errori interni
// ---------------------------------------------------------------------------

/**
 * Errore non riprovabile (HTTP 4xx, parse error): il retry non ha senso.
 */
class NonRetryableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NonRetryableError'
  }
}

// ---------------------------------------------------------------------------
// Fetch con retry
// ---------------------------------------------------------------------------

async function fetchXml(url: string): Promise<string> {
  let lastError: Error = new Error('Fetch fallito senza risposta')

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise<void>((resolve) =>
        setTimeout(resolve, RETRY_DELAY_BASE_MS * attempt),
      )
    }

    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; ErFantacalcio/1.0)',
        },
        cache: 'no-store',
      })

      if (!res.ok) {
        if (res.status >= 400 && res.status < 500) {
          throw new NonRetryableError(
            `HTTP ${res.status} ${res.statusText} — richiesta non riprovabile`,
          )
        }
        // 5xx — transiente, riprova
        lastError = new Error(`HTTP ${res.status} ${res.statusText}`)
        continue
      }

      return await res.text()
    } catch (err) {
      if (err instanceof NonRetryableError) throw err
      if (err instanceof Error) lastError = err
      // Errore di rete o timeout — transiente, riprova
    }
  }

  throw lastError
}

// ---------------------------------------------------------------------------
// Parsing XML RSS
// ---------------------------------------------------------------------------

/**
 * Estrae la data di pubblicazione da una stringa RFC 822 e la converte
 * in ISO 8601 UTC. Il suffisso "Z" è accettato da
 * `z.string().datetime({ offset: true })`.
 *
 * Lancia `NonRetryableError` se la stringa non è una data valida.
 */
function normalizePubDate(raw: string): string {
  const d = new Date(raw)
  if (isNaN(d.getTime())) {
    throw new NonRetryableError(`pubDate non valida: "${raw}"`)
  }
  return d.toISOString()
}

/**
 * Rimuove i tag HTML da una stringa e restituisce testo puro.
 * Usa cheerio per sicurezza (nessuna regex su HTML arbitrario).
 */
function stripHtml(html: string): string {
  if (!html) return ''
  const $d = cheerio.load(html)
  return $d('body').text().trim()
}

/**
 * Parsa il contenuto XML di un feed RSS e restituisce gli articoli validati.
 *
 * L'helper `extractImageUrl` è definito come funzione interna per chiudersi
 * sul `$` root (CheerioAPI) ed evitare di propagarlo come parametro extra.
 *
 * Articoli che falliscono la validazione Zod vengono scartati silenziosamente.
 * Se non viene estratto nessun articolo, lancia NonRetryableError.
 */
function parseRssXml(xml: string, feedId: string): NewsArticle[] {
  const $ = cheerio.load(xml, { xmlMode: true })

  /**
   * Estrae l'URL dell'immagine da un item RSS, provando in ordine:
   * 1. media:content[url]
   * 2. media:thumbnail[url]
   * 3. enclosure[url] con type immagine
   * 4. primo <img src="..."> nel testo della description (CDATA HTML)
   *
   * Si chiude sul `$` del parser XML corrente.
   */
  function extractImageUrl(itemEl: AnyNode, descriptionRaw: string): string | null {
    const $item = $(itemEl)

    // 1. media:content — in XML mode, namespace tags are preserved as-is
    let mcUrl = $item.find('media\\:content').first().attr('url')
    if (!mcUrl) {
      // Fallback: direct child selection (namespace-aware)
      const mediaContent = $item.children().filter((_, el) => {
        const tagName = $(el).prop('name')
        return tagName === 'media:content' || tagName === 'content'
      })
      mcUrl = mediaContent.first().attr('url')
    }
    if (mcUrl) return mcUrl

    // 2. media:thumbnail
    let mtUrl = $item.find('media\\:thumbnail').first().attr('url')
    if (!mtUrl) {
      const mediaThumbnail = $item.children().filter((_, el) => {
        const tagName = $(el).prop('name')
        return tagName === 'media:thumbnail' || tagName === 'thumbnail'
      })
      mtUrl = mediaThumbnail.first().attr('url')
    }
    if (mtUrl) return mtUrl

    // 3. enclosure con type immagine
    let enclosureUrl: string | undefined
    $item.find('enclosure').each((_, encEl) => {
      const type = $(encEl).attr('type') ?? ''
      if (type.startsWith('image/')) {
        enclosureUrl = $(encEl).attr('url')
        return false // interrompe l'iterazione
      }
    })
    if (enclosureUrl) return enclosureUrl

    // 4. <img> nella description HTML (CDATA)
    if (descriptionRaw) {
      const $desc = cheerio.load(descriptionRaw)
      const src = $desc('img').first().attr('src')
      if (src) return src
    }

    return null
  }

  const articles: NewsArticle[] = []

  $('item').each((index, el) => {
    if (index >= NEWS_MAX_ARTICLES_PER_FEED) return false

    const $item = $(el)

    const title = $item.children('title').first().text().trim()
    const rawLink = $item.children('link').first().text().trim()
    const pubDateRaw = $item.children('pubDate').first().text().trim()
    const descriptionRaw = $item.children('description').first().text().trim()

    let pubDate: string
    try {
      pubDate = normalizePubDate(pubDateRaw)
    } catch {
      // Data non parsabile → scarta l'articolo
      return
    }

    const description = stripHtml(descriptionRaw)
    const imageUrl = extractImageUrl(el, descriptionRaw)

    const parsed = newsArticleSchema.safeParse({
      title,
      description,
      pubDate,
      url: rawLink,
      imageUrl,
    })

    if (parsed.success) {
      articles.push(parsed.data)
    }
  })

  if (articles.length === 0) {
    throw new NonRetryableError(
      `Feed "${feedId}": nessun articolo valido estratto dall'XML RSS.`,
    )
  }

  return articles
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const gazzettaRssProvider: INewsProvider = {
  async fetchFeed(feed: NewsFeedMeta): Promise<NewsArticle[]> {
    const xml = await fetchXml(feed.url)
    return parseRssXml(xml, feed.id)
  },
}
