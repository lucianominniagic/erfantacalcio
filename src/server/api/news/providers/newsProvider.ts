/**
 * newsProvider — contratto provider-neutral per il fetch dei feed news.
 *
 * Ogni implementazione riceve i metadati di un feed (id, label, url)
 * e restituisce al massimo NEWS_MAX_ARTICLES_PER_FEED articoli già
 * normalizzati e validati con Zod.
 *
 * La cache è responsabilità del service layer, non del provider.
 */
import type { NewsArticle, NewsFeedMeta } from '~/schemas/news'

export interface INewsProvider {
  /**
   * Scarica e parsa il feed RSS indicato da `feed.url`.
   *
   * - Deve restituire al massimo {@link NEWS_MAX_ARTICLES_PER_FEED} articoli.
   * - In caso di errore di rete o parsing lancia un `Error`.
   * - NON effettua caching; il caching è delegato al service layer.
   */
  fetchFeed(feed: NewsFeedMeta): Promise<NewsArticle[]>
}
