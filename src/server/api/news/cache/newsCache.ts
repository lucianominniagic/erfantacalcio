/**
 * newsCache — cache in-memory con TTL per i feed RSS.
 *
 * Caratteristiche:
 * - Chiave stringa (tipicamente il feedId).
 * - TTL configurabile per entry.
 * - Deduplicazione delle richieste concorrenti in-flight: se una richiesta
 *   per la stessa chiave è già in corso, i chiamanti successivi ricevono
 *   la stessa Promise senza lanciare un fetch duplicato.
 * - Il singleton `feedCache` è l'istanza condivisa a livello di processo.
 *
 * La cache non è a conoscenza di NewsArticle o provider; è generica
 * su `V` per facilitare il test unitario.
 */

// ---------------------------------------------------------------------------
// Tipi interni
// ---------------------------------------------------------------------------

interface CacheEntry<V> {
  value: V
  expiresAt: number
}

// ---------------------------------------------------------------------------
// Classe cache
// ---------------------------------------------------------------------------

export class InMemoryFeedCache<V> {
  private readonly store = new Map<string, CacheEntry<V>>()
  private readonly inflight = new Map<string, Promise<V>>()

  /**
   * Restituisce il valore in cache se ancora valido, oppure invoca `fetcher`
   * per ottenere e memorizzare un nuovo valore.
   *
   * Richieste concorrenti per la stessa `key` (mentre `fetcher` è in corso)
   * ricevono la stessa Promise senza generare fetch aggiuntivi.
   *
   * @param key    - Chiave univoca dell'entry.
   * @param ttlMs  - Durata di validità in millisecondi.
   * @param fetcher - Funzione asincrona che produce il valore fresco.
   */
  async getOrFetch(
    key: string,
    ttlMs: number,
    fetcher: () => Promise<V>,
  ): Promise<V> {
    // Hit: cache valida
    const cached = this.store.get(key)
    if (cached !== undefined && Date.now() < cached.expiresAt) {
      return cached.value
    }

    // In-flight deduplication
    const existing = this.inflight.get(key)
    if (existing !== undefined) return existing

    const promise = fetcher()
      .then((value) => {
        this.store.set(key, { value, expiresAt: Date.now() + ttlMs })
        this.inflight.delete(key)
        return value
      })
      .catch((err: unknown) => {
        this.inflight.delete(key)
        throw err
      })

    this.inflight.set(key, promise)
    return promise
  }

  /**
   * Rimuove l'entry dalla cache (utile nei test).
   */
  invalidate(key: string): void {
    this.store.delete(key)
    this.inflight.delete(key)
  }

  /**
   * Svuota completamente la cache (utile nei test).
   */
  clear(): void {
    this.store.clear()
    this.inflight.clear()
  }
}

// ---------------------------------------------------------------------------
// Singleton di processo
// ---------------------------------------------------------------------------

/**
 * Istanza condivisa usata dal newsService.
 * Vive finché il processo Node.js è in esecuzione.
 *
 * Il tipo generico è {@link NewsFeedFetchResult} (non solo gli articoli):
 * la cache conserva anche `channelLogoUrl` così il service layer non deve
 * re-fetcharlo ad ogni richiesta.
 */
import type { NewsFeedFetchResult } from '../providers/newsProvider'

export const feedCache = new InMemoryFeedCache<NewsFeedFetchResult>()
