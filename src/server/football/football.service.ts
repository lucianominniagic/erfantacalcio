/**
 * football.service — orchestrazione dei dati Serie A.
 *
 * Espone ESATTAMENTE tre funzioni pubbliche:
 *   getSerieAStandings()   — classifica TOTAL con metadata
 *   getTopScorers()        — classifica marcatori
 *   getSerieAOverview()    — aggregato cached (revalidate 3600 s), include
 *                            partite "latest"/"next" per giornata (vedi sotto)
 *
 * Strategia matchday (football-data.org v4):
 *   `season.currentMatchday` è la giornata attiva/imminente (policy 36h/60h):
 *   per un certo periodo dopo la conclusione delle partite continua a puntare
 *   alla giornata appena giocata, prima di avanzare alla successiva. Si usa
 *   quindi:
 *     • latest: matchday = currentMatchday      — filtrate su status FINISHED
 *     • next:   matchday = currentMatchday + 1  — filtrate su status SCHEDULED
 *   Entrambe ordinate e capped a 10 risultati.
 *
 * Dependency injection:
 *   Tutte le funzioni accettano `provider: IFootballProvider` (default produzione)
 *   per test deterministici.
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
  type FootballScorer,
  type FootballStandingEntry,
  type FootballSeasonMetadata,
  type SerieAOverview,
} from '~/schemas/football'
import { footballDataClient } from './football.client'
import type { IFootballProvider } from './football.types'

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
 * 1. Recupera standings → metadata (currentMatchday) + classifica.
 * 2. In parallelo (Promise.all): partite di currentMatchday (latest),
 *    partite di currentMatchday + 1 (next), marcatori. Gli errori si
 *    propagano — non diventano array vuoti.
 * 3. Filtra e ordina le partite (max 10 ciascuna).
 * 4. Valida la shape finale con serieAOverviewSchema.
 *
 * Le partite sono recuperate per giornata (non per finestra di date):
 *   - latest: matchday = currentMatchday      — solo status FINISHED, data desc
 *   - next:   matchday = currentMatchday + 1  — solo status SCHEDULED, data asc
 *
 * Il filtro/ordinamento è fatto qui e non delegato al provider perché
 * `IFootballProvider` è provider-neutral: un mock di test può restituire le
 * partite in qualsiasi ordine e con qualsiasi status.
 *
 * @param provider - Provider dati (default: footballDataClient).
 */
export async function orchestrateSerieAOverview(
  provider: IFootballProvider = footballDataClient,
): Promise<SerieAOverview> {
  // Step 1: standings — metadata (currentMatchday) + classifica
  const { standings, metadata } = await provider.getStandings()

  // Step 2: chiamate in parallelo — errori propagati da Promise.all
  const [latestRaw, nextRaw, scorers] = await Promise.all([
    provider.getMatches({ matchday: metadata.currentMatchday - 1}), // latest: giornata corrente
    provider.getMatches({ matchday: metadata.currentMatchday }), // next: giornata successiva
    provider.getScorers(),
  ])

  // Filtra FINISHED, ordine decrescente (più recente prima), max 10
  const latestMatches = latestRaw
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
    .slice(0, 10)

  // Filtra SCHEDULED/TIMED (→ 'scheduled' nel DTO), ordine crescente, max 10
  const nextMatches = nextRaw
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
