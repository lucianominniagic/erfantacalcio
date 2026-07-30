/**
 * newsService — orchestrazione del fetch dei quattro feed RSS Gazzetta.
 *
 * Responsabilità:
 * - Avvia le quattro richieste in parallelo (Promise.all).
 * - Interpone la cache in-memory (TTL 15 minuti).
 * - Isola i fallimenti: un feed in errore produce un NewsFeedError per
 *   quella sezione senza bloccare gli altri.
 * - Valida la risposta finale con newsCalcioResponseSchema prima di
 *   restituirla all'endpoint oRPC.
 *
 * Dependency injection:
 * `fetchAllNewsFeeds` accetta provider e cache come parametri opzionali
 * con default ai singleton di produzione. Questo permette ai test di
 * iniettare mock senza modificare il modulo.
 */
import {
  NEWS_FEEDS,
  newsCalcioResponseSchema,
  type NewsCalcioResponse,
  type NewsFeedResult,
} from '~/schemas/news'
import { gazzettaRssProvider } from '../providers/gazzettaRssProvider'
import type { INewsProvider } from '../providers/newsProvider'
import { feedCache, InMemoryFeedCache } from '../cache/newsCache'
import type { NewsArticle } from '~/schemas/news'

// ---------------------------------------------------------------------------
// Costanti
// ---------------------------------------------------------------------------

/** TTL della cache per ciascun feed: 15 minuti in millisecondi. */
const FEED_CACHE_TTL_MS = 15 * 60 * 1_000

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Recupera i quattro feed RSS in parallelo e restituisce una
 * `NewsCalcioResponse` validata.
 *
 * @param provider - Implementazione di INewsProvider (default: Gazzetta RSS).
 * @param cache    - Cache in-memory (default: singleton di processo).
 */
export async function fetchAllNewsFeeds(
  provider: INewsProvider = gazzettaRssProvider,
  cache: InMemoryFeedCache<NewsArticle[]> = feedCache,
): Promise<NewsCalcioResponse> {
  const results: NewsFeedResult[] = await Promise.all(
    NEWS_FEEDS.map(async (feed): Promise<NewsFeedResult> => {
      try {
        const articles = await cache.getOrFetch(
          feed.id,
          FEED_CACHE_TTL_MS,
          () => provider.fetchFeed(feed),
        )
        return { status: 'success', feedId: feed.id, articles }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Errore sconosciuto nel fetch del feed'
        return { status: 'error', feedId: feed.id, message }
      }
    }),
  )

  // Validazione finale: garantisce shape corretta prima di esporre al client
  return newsCalcioResponseSchema.parse({ feeds: results })
}
