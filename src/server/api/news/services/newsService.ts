/**
 * newsService — orchestrazione del fetch dei quattro feed RSS calcistici
 * (Gazzetta dello Sport, Corriere dello Sport, Voce Giallorossa,
 * La Lazio Siamo Noi).
 *
 * Responsabilità:
 * - Avvia le quattro richieste in parallelo (Promise.all).
 * - Interpone la cache in-memory (TTL 15 minuti); la cache conserva il
 *   risultato completo ({@link NewsFeedFetchResult}) incluso `channelLogoUrl`.
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
import { rssProvider } from '../providers/rssProvider'
import type { INewsProvider, NewsFeedFetchResult } from '../providers/newsProvider'
import { feedCache, InMemoryFeedCache } from '../cache/newsCache'

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
 * @param provider - Implementazione di INewsProvider (default: RSS source-neutral).
 * @param cache    - Cache in-memory (default: singleton di processo).
 *                   Conserva il risultato completo (articoli + channelLogoUrl).
 */
export async function fetchAllNewsFeeds(
  provider: INewsProvider = rssProvider,
  cache: InMemoryFeedCache<NewsFeedFetchResult> = feedCache,
): Promise<NewsCalcioResponse> {
  const results: NewsFeedResult[] = await Promise.all(
    NEWS_FEEDS.map(async (feed): Promise<NewsFeedResult> => {
      try {
        const { channelLogoUrl, articles } = await cache.getOrFetch(
          feed.id,
          FEED_CACHE_TTL_MS,
          () => provider.fetchFeed(feed),
        )
        return { status: 'success', feedId: feed.id, channelLogoUrl, articles }
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
