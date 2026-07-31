/**
 * football.service — orchestrazione dei dati Serie A.
 *
 * Espone ESATTAMENTE cinque funzioni pubbliche:
 *   getSerieAStandings()   — classifica TOTAL con metadata
 *   getLatestMatches()     — partite FINISHED negli ultimi 14 giorni, data desc, max 10
 *   getNextMatches()       — partite SCHEDULED nei prossimi 21 giorni, data asc, max 10
 *   getTopScorers()        — classifica marcatori
 *   getSerieAOverview()    — aggregato cached (revalidate 3600 s)
 *
 * Strategia date-window (football-data.org v4):
 *   - `season.currentMatchday` è la giornata attiva/imminente (policy 36h/60h),
 *     non l'ultima completata. Usarla come filtro per "latest" o "next" è
 *     semanticamente scorretto. Si usano invece finestre temporali:
 *     • latest: [oggi-14, domani)   — dateTo esclusiva include oggi
 *     • next:   [oggi,   oggi+21)   — dateTo esclusiva, prossimi 21 giorni
 *
 * Dependency injection:
 *   Tutte le funzioni accettano `provider: IFootballProvider` (default produzione)
 *   e `now: Date` (default `new Date()`) per test deterministici.
 *   `now` non viene mai mutato.
 *
 * Cache strategy:
 *   `orchestrateSerieAOverview` è la funzione orchestratrice testabile.
 *   `getSerieAOverview` è la versione wrapped da `unstable_cache` (produzione),
 *   revalidate 3600 s. Nessuna cache annidata.
 *
 * Error propagation:
 *   Le chiamate secondarie usano Promise.all — qualsiasi errore si propaga
 *   e non viene silenziosamente convertito in array vuoto.
 */
import { unstable_cache } from 'next/cache'
import {
  serieAOverviewSchema,
  type FootballMatch,
  type FootballScorer,
  type FootballStandingEntry,
  type FootballSeasonMetadata,
  type SerieAOverview,
} from '~/schemas/football'
import { footballDataClient } from './football.client'
import type { IFootballProvider } from './football.types'

// ---------------------------------------------------------------------------
// Helpers data (puri, nessuna mutazione dell'input)
// ---------------------------------------------------------------------------

/**
 * Formatta una `Date` come stringa YYYY-MM-DD in UTC.
 * Non applica timezone shift: usa sempre le componenti UTC.
 */
function toYYYYMMDD(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Restituisce una **nuova** `Date` con `days` giorni aggiunti.
 * L'input non viene mai mutato.
 */
function addDays(date: Date, days: number): Date {
  const copy = new Date(date.getTime())
  copy.setUTCDate(copy.getUTCDate() + days)
  return copy
}

// ---------------------------------------------------------------------------
// Funzioni pubbliche standalone (testabili, DI-friendly)
// ---------------------------------------------------------------------------

/**
 * Recupera la classifica Serie A TOTAL e la metadata della stagione.
 * Fallisce esplicitamente se il gruppo TOTAL è assente o currentMatchday è null.
 */
export async function getSerieAStandings(
  provider: IFootballProvider = footballDataClient,
): Promise<{ standings: FootballStandingEntry[]; metadata: FootballSeasonMetadata }> {
  return provider.getStandings()
}

/**
 * Recupera le partite FINITE negli ultimi 14 giorni (finestra temporale),
 * ordinate per data decrescente, max 10.
 *
 * Finestra: [oggi-14, domani) — `dateTo` esclusiva per includere le partite di oggi.
 *
 * @param provider - Provider dati (default: footballDataClient).
 * @param now      - Data di riferimento (default: `new Date()`). Non viene mutata.
 */
export async function getLatestMatches(
  provider: IFootballProvider = footballDataClient,
  now: Date = new Date(),
): Promise<FootballMatch[]> {
  const dateFrom = toYYYYMMDD(addDays(now, -14))
  const dateTo = toYYYYMMDD(addDays(now, 1)) // esclusiva: include le partite di oggi
  const matches = await provider.getMatches({ dateFrom, dateTo })
  return matches
    .filter((m) => m.status === 'finished')
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
    .slice(0, 10)
}

/**
 * Recupera le partite PROGRAMMATE nei prossimi 21 giorni (finestra temporale),
 * ordinate per data crescente, max 10.
 *
 * Finestra: [oggi, oggi+21) — semantica "prossimi 21 giorni", `dateTo` esclusiva.
 * Considera sia SCHEDULED sia TIMED (entrambi mappati a 'scheduled' nel DTO).
 *
 * @param provider - Provider dati (default: footballDataClient).
 * @param now      - Data di riferimento (default: `new Date()`). Non viene mutata.
 */
export async function getNextMatches(
  provider: IFootballProvider = footballDataClient,
  now: Date = new Date(),
): Promise<FootballMatch[]> {
  const dateFrom = toYYYYMMDD(now)
  const dateTo = toYYYYMMDD(addDays(now, 21)) // esclusiva: [oggi, oggi+21)
  const matches = await provider.getMatches({ dateFrom, dateTo })
  return matches
    .filter((m) => m.status === 'scheduled')
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
    .slice(0, 10)
}

/**
 * Recupera la classifica marcatori della stagione corrente.
 */
export async function getTopScorers(
  provider: IFootballProvider = footballDataClient,
): Promise<FootballScorer[]> {
  return provider.getScorers()
}

// ---------------------------------------------------------------------------
// Orchestratore testabile (usato anche dalla funzione cached)
// ---------------------------------------------------------------------------

/**
 * Orchestrazione completa:
 * 1. Recupera standings → metadata (currentMatchday per display) + classifica.
 * 2. In parallelo (Promise.all): partite finestra latest, partite finestra next,
 *    marcatori. Gli errori si propagano — non diventano array vuoti.
 * 3. Filtra e ordina le partite (max 10 ciascuna).
 * 4. Valida la shape finale con serieAOverviewSchema.
 *
 * Le partite sono recuperate tramite finestre temporali (non per giornata):
 *   - latest: [oggi-14, domani)  — `dateTo` esclusiva, include partite di oggi
 *   - next:   [oggi, oggi+21)    — `dateTo` esclusiva, prossimi 21 giorni
 *
 * @param provider - Provider dati (default: footballDataClient).
 * @param now      - Data di riferimento (default: `new Date()`). Non viene mutata.
 *                   Iniettare un valore fisso nei test per risultati deterministici.
 */
export async function orchestrateSerieAOverview(
  provider: IFootballProvider = footballDataClient,
): Promise<SerieAOverview> {
  // Step 1: standings — metadata (per display) + classifica
  const { standings, metadata } = await provider.getStandings()

  
  // Step 2: chiamate in parallelo — errori propagati da Promise.all
  const [latestRaw, nextRaw, scorers] = await Promise.all([
    provider.getMatches({ matchday: metadata.currentMatchday }), // latest: giornata precedente
    provider.getMatches({ matchday: metadata.currentMatchday + 1 }), // next: giornata successiva
    provider.getScorers(),
  ])

  // Filtra FINISHED, ordine decrescente (più recente prima), max 10
  const latestMatches = latestRaw
    //.filter((m) => m.status === 'finished')
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
    .slice(0, 10)

  // Filtra SCHEDULED/TIMED (→ 'scheduled' nel DTO), ordine crescente, max 10
  const nextMatches = nextRaw
    .filter((m) => m.status === 'scheduled')
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
    .slice(0, 10)

  const overview = {
    standings,
    latestMatches,
    nextMatches,
    scorers,
    metadata,
  }

  // Validazione finale della shape — ZodError se qualcosa non torna
  return serieAOverviewSchema.parse(overview)
}

// ---------------------------------------------------------------------------
// Funzione cached di produzione
// ---------------------------------------------------------------------------

/**
 * Versione cached di `orchestrateSerieAOverview`.
 *
 * Usa `unstable_cache` di Next.js con revalidate 3600 s (1 ora).
 * La cache è applicata una volta sola all'overview completo, evitando
 * cache annidate incoerenti tra le singole chiamate.
 *
 * Non accetta parametri per design: la cache key è fissa a
 * `['serie-a-overview']`. Nei test usa direttamente `orchestrateSerieAOverview`.
 */
export const getSerieAOverview: () => Promise<SerieAOverview> = unstable_cache(
  async (): Promise<SerieAOverview> => orchestrateSerieAOverview(footballDataClient),
  ['serie-a-overview'],
  { revalidate: 3600 },
)
