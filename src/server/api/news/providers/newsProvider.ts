/**
 * newsProvider — contratto provider-neutral per il fetch dei feed news.
 *
 * Ogni implementazione riceve i metadati di un feed (id, label, url)
 * e restituisce un {@link NewsFeedFetchResult} contenente gli articoli già
 * normalizzati e validati con Zod, più i metadati del canale (logo).
 *
 * La cache è responsabilità del service layer, non del provider.
 */
import type { NewsArticle, NewsFeedMeta } from '~/schemas/news'

// ---------------------------------------------------------------------------
// Risultato source-neutral del fetch di un singolo feed
// ---------------------------------------------------------------------------

/**
 * Risultato tipizzato restituito da qualsiasi implementazione di
 * {@link INewsProvider} dopo un fetch riuscito.
 *
 * - `channelLogoUrl` — URL del logo del canale estratto dal tag standard RSS
 *   `<channel><image><url>` (o equivalente per altri formati). Impostato a
 *   `null` dal provider quando il tag è assente oppure il suo valore non è
 *   un URL assoluto valido; il service layer propaga `null` al client senza
 *   alterare il risultato.
 * - `articles` — array di articoli già validati, al massimo
 *   {@link NEWS_MAX_ARTICLES_PER_FEED} elementi.
 */
export interface NewsFeedFetchResult {
  /** URL logo canale da `<channel><image><url>`; `null` se assente o non valido. */
  channelLogoUrl: string | null
  articles: NewsArticle[]
}

// ---------------------------------------------------------------------------
// Contratto provider
// ---------------------------------------------------------------------------

export interface INewsProvider {
  /**
   * Scarica e parsa il feed RSS indicato da `feed.url`.
   *
   * - Deve restituire al massimo {@link NEWS_MAX_ARTICLES_PER_FEED} articoli.
   * - `channelLogoUrl` è `null` quando il feed non espone un logo valido
   *   (assenza del tag o URL non assoluto); non lancia errore per questo.
   * - In caso di errore di rete o parsing lancia un `Error`.
   * - NON effettua caching; il caching è delegato al service layer.
   */
  fetchFeed(feed: NewsFeedMeta): Promise<NewsFeedFetchResult>
}
