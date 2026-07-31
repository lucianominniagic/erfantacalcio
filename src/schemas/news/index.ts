/**
 * Schemi Zod per il dominio "News Calcio".
 *
 * Quattro sorgenti RSS eterogenee (Gazzetta dello Sport, Corriere dello Sport,
 * Voce Giallorossa, La Lazio Siamo Noi) vengono rappresentate come risultati
 * indipendenti (success | error): un feed fallito non blocca gli altri.
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

/** Identificativo stabile per ciascuna delle quattro sorgenti news. */
export const newsFeedIdEnum = z.enum(['calcio', 'corrieredellosport', 'vocegiallorossa', 'lalaziosiamonoi'])

export type NewsFeedId = z.infer<typeof newsFeedIdEnum>

/**
 * Metadata statico per ciascun feed: identificativo, etichetta UI,
 * URL sorgente RSS e ordine di presentazione nella pagina.
 *
 * Sorgenti (in ordine):
 *  0 — Gazzetta dello Sport (sezione Calcio)
 *  1 — Corriere dello Sport
 *  2 — Voce Giallorossa
 *  3 — La Lazio Siamo Noi
 *
 * Fonte di verità condivisa tra provider (sa dove fare fetch) e
 * frontend (sa come ordinare e nominare le sezioni).
 */
export const NEWS_FEEDS = [
  {
    id: 'calcio' as const,
    label: 'Gazzetta dello Sport',
    url: 'https://www.gazzetta.it/dynamic-feed/rss/section/Calcio.xml',
    order: 0,
  },
  {
    id: 'corrieredellosport' as const,
    label: 'Corriere dello Sport',
    url: 'https://www.corrieredellosport.it/rss/calcio',
    order: 1,
  },
  {
    id: 'vocegiallorossa' as const,
    label: 'Voce Giallorossa',
    url: 'https://www.vocegiallorossa.it/rss/',
    order: 2,
  },
  {
    id: 'lalaziosiamonoi' as const,
    label: 'La Lazio Siamo Noi',
    url: 'https://www.lalaziosiamonoi.it/rss/',
    order: 3,
  },
] as const satisfies readonly {
  id: NewsFeedId
  label: string
  url: string
  order: number
}[]

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
 *
 * - `channelLogoUrl` — URL dell'immagine del canale, estratto dal tag
 *   standard RSS `<channel><image><url>`.
 *   Il provider lo imposta a `null` quando il feed non include tale tag
 *   oppure quando il valore presente non è un URL valido.
 *   Il frontend può usarlo come immagine di intestazione della sezione
 *   sorgente (es. logo testata); deve gestire il caso `null` mostrando
 *   un fallback o nessuna immagine.
 */
export const newsFeedSuccessSchema = z.object({
  status: z.literal('success'),
  feedId: newsFeedIdEnum,
  /** URL logo canale da `<channel><image><url>`; `null` se assente o non valido. */
  channelLogoUrl: z.string().url().nullable(),
  articles: z.array(newsArticleSchema).max(NEWS_MAX_ARTICLES_PER_FEED),
})

export type NewsFeedSuccess = z.infer<typeof newsFeedSuccessSchema>

/**
 * Risultato di un fetch RSS fallito per un singolo feed.
 * Il fallimento è isolato: le altre tre sorgenti non sono influenzate.
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
 * {@link NEWS_FEEDS}: calcio/Gazzetta (0), corrieredellosport (1),
 * vocegiallorossa (2), lalaziosiamonoi (3).
 * Anche in caso di errori parziali tutti e quattro i risultati sono presenti.
 */
export const newsCalcioResponseSchema = z.object({
  feeds: z.array(newsFeedResultSchema).length(4),
})

export type NewsCalcioResponse = z.infer<typeof newsCalcioResponseSchema>
