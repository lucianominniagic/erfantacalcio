/**
 * Schemi Zod per il dominio "News Calcio".
 *
 * Quattro sezioni RSS (Calcio, Calciomercato, Coppe, Estero) vengono
 * rappresentate come risultati indipendenti (success | error): un feed
 * fallito non blocca gli altri.
 *
 * Il contratto descrive i dati *già parsati e normalizzati* dal provider;
 * quest'ultimo è responsabile di:
 *  - convertire le date RSS (RFC 822) in stringhe ISO 8601 con offset;
 *  - estrarre `imageUrl` dai tag `<media:content>` / `<enclosure>`;
 *  - limitare a {@link NEWS_MAX_ARTICLES_PER_FEED} articoli per feed.
 *
 * Provider, caching, fetch, oRPC e UI sono implementati da agenti successivi.
 */
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Feed identifiers & metadata
// ---------------------------------------------------------------------------

/** Identificativo stabile per ciascuna delle quattro sezioni news. */
export const newsFeedIdEnum = z.enum(['calcio', 'calciomercato', 'coppe', 'estero'])

export type NewsFeedId = z.infer<typeof newsFeedIdEnum>

/**
 * Metadata statico per ciascun feed: identificativo, etichetta UI,
 * URL sorgente RSS e ordine di presentazione nella pagina.
 *
 * Fonte di verità condivisa tra provider (sa dove fare fetch) e
 * frontend (sa come ordinare e nominare le sezioni).
 */
export const NEWS_FEEDS = [
  {
    id: 'calcio' as const,
    label: 'Calcio',
    url: 'https://www.gazzetta.it/dynamic-feed/rss/section/Calcio.xml',
    order: 0,
  },
  {
    id: 'calciomercato' as const,
    label: 'Calciomercato',
    url: 'https://www.gazzetta.it/dynamic-feed/rss/section/Calciomercato.xml',
    order: 1,
  },
  {
    id: 'coppe' as const,
    label: 'Coppe',
    url: 'https://www.gazzetta.it/dynamic-feed/rss/section/Calcio/coppe.xml',
    order: 2,
  },
  {
    id: 'estero' as const,
    label: 'Estero',
    url: 'https://www.gazzetta.it/dynamic-feed/rss/section/Calcio/Estero.xml',
    order: 3,
  },
] as const satisfies ReadonlyArray<{
  id: NewsFeedId
  label: string
  url: string
  order: number
}>

/** Schema Zod per validare un singolo elemento di {@link NEWS_FEEDS}. */
export const newsFeedMetaSchema = z.object({
  id: newsFeedIdEnum,
  label: z.string().min(1),
  url: z.string().url(),
  order: z.number().int().min(0),
})

export type NewsFeedMeta = z.infer<typeof newsFeedMetaSchema>

// ---------------------------------------------------------------------------
// Article
// ---------------------------------------------------------------------------

/** Numero massimo di articoli restituiti per ciascun feed. */
export const NEWS_MAX_ARTICLES_PER_FEED = 5 as const

/**
 * Singolo articolo parsato da un feed RSS.
 *
 * - `title` — titolo dell'articolo (non vuoto).
 * - `description` — testo introduttivo o sommario (può essere stringa vuota).
 * - `pubDate` — data di pubblicazione in formato ISO 8601 con offset di
 *   fuso orario, normalizzata dal provider durante il parsing RSS.
 * - `url` — link all'articolo originale sul sito sorgente.
 * - `imageUrl` — URL dell'immagine di anteprima; `null` solo se il feed
 *   non fornisce alcun tag immagine (`<media:content>`, `<enclosure>`, ecc.).
 */
export const newsArticleSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  pubDate: z.string().datetime({ offset: true }),
  url: z.string().url(),
  imageUrl: z.string().url().nullable(),
})

export type NewsArticle = z.infer<typeof newsArticleSchema>

// ---------------------------------------------------------------------------
// Per-feed result (discriminated union)
// ---------------------------------------------------------------------------

/**
 * Risultato di un fetch RSS riuscito per un singolo feed.
 * `articles` contiene al massimo {@link NEWS_MAX_ARTICLES_PER_FEED} elementi.
 */
export const newsFeedSuccessSchema = z.object({
  status: z.literal('success'),
  feedId: newsFeedIdEnum,
  articles: z.array(newsArticleSchema).max(NEWS_MAX_ARTICLES_PER_FEED),
})

export type NewsFeedSuccess = z.infer<typeof newsFeedSuccessSchema>

/**
 * Risultato di un fetch RSS fallito per un singolo feed.
 * Il fallimento è isolato: gli altri tre feed non sono influenzati.
 * `message` riporta la causa dell'errore (HTTP, parsing, timeout, ecc.).
 */
export const newsFeedErrorSchema = z.object({
  status: z.literal('error'),
  feedId: newsFeedIdEnum,
  message: z.string().min(1),
})

export type NewsFeedError = z.infer<typeof newsFeedErrorSchema>

/**
 * Unione discriminata sul campo `status`.
 * Il provider deve sempre restituire uno dei due casi — non può omettere
 * un feed dalla risposta.
 */
export const newsFeedResultSchema = z.discriminatedUnion('status', [
  newsFeedSuccessSchema,
  newsFeedErrorSchema,
])

export type NewsFeedResult = z.infer<typeof newsFeedResultSchema>

// ---------------------------------------------------------------------------
// Full page response
// ---------------------------------------------------------------------------

/**
 * Risposta completa della pagina News Calcio.
 *
 * `feeds` contiene esattamente quattro elementi nell'ordine definito da
 * {@link NEWS_FEEDS}: calcio (0), calciomercato (1), coppe (2), estero (3).
 * Anche in caso di errori parziali tutti e quattro i risultati sono presenti.
 */
export const newsCalcioResponseSchema = z.object({
  feeds: z.array(newsFeedResultSchema).length(4),
})

export type NewsCalcioResponse = z.infer<typeof newsCalcioResponseSchema>
