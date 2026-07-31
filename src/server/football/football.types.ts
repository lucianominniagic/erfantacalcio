/**
 * football.types — interfacce provider-neutral per il modulo football.
 *
 * Responsabilità:
 * - Definisce `FootballMatchFilters`: filtri provider-neutral per getMatches().
 * - Definisce `IFootballProvider`: contratto che ogni implementazione concreta
 *   deve rispettare (football-data.org, mock di test, ecc.).
 * - Definisce `StandingsResult`: DTO aggregato restituito da getStandings()
 *   perché classifica e metadata di stagione arrivano dalla stessa API call.
 *
 * Nessuna dipendenza da fetch, Axios o altri client HTTP — pura astrazione.
 */
import type {
  FootballMatch,
  FootballScorer,
  FootballStandingEntry,
  FootballSeasonMetadata,
} from '~/schemas/football'

// ---------------------------------------------------------------------------
// Filtri partite
// ---------------------------------------------------------------------------

/**
 * Filtri provider-neutral per la query delle partite.
 *
 * `dateFrom` / `dateTo` seguono la policy football-data.org v4:
 *   - formato YYYY-MM-DD (UTC)
 *   - `dateTo` è **esclusiva** (la data indicata non è inclusa nei risultati)
 *
 * Tutti i campi sono opzionali; il client costruisce i query param
 * solo per quelli presenti (nessun cast / `any`).
 */
export interface FootballMatchFilters {
  /** Data di inizio finestra (inclusiva), formato YYYY-MM-DD UTC. */
  dateFrom?: string
  /**
   * Data di fine finestra (esclusiva per football-data.org v4),
   * formato YYYY-MM-DD UTC.
   */
  dateTo?: string
  /** Numero di giornata. */
  matchday?: number
  /** Anno di inizio stagione (es. 2024). Omettere = stagione corrente. */
  season?: number
}

// ---------------------------------------------------------------------------
// Tipi aggregati
// ---------------------------------------------------------------------------

/**
 * Risultato combinato di una chiamata standings:
 * la classifica TOTAL + la metadata di stagione (inclusa currentMatchday).
 */
export interface StandingsResult {
  standings: FootballStandingEntry[]
  metadata: FootballSeasonMetadata
}

// ---------------------------------------------------------------------------
// Interfaccia provider-neutral
// ---------------------------------------------------------------------------

/**
 * Contratto per i provider di dati calcistici.
 *
 * Tutti i metodi restituiscono DTO provider-neutral (definiti in
 * `~/schemas/football`), indipendentemente dalla fonte dei dati.
 *
 * L'implementazione concreta di produzione è `footballDataClient`
 * in `football.client.ts`. I test iniettano un `MockFootballProvider`.
 */
export interface IFootballProvider {
  /**
   * Recupera la classifica Serie A e la metadata della stagione corrente.
   *
   * @param season - Anno di inizio stagione (es. 2024). Omettere = stagione corrente.
   * @throws Se la standings TOTAL è assente o currentMatchday è null.
   */
  getStandings(season?: number): Promise<StandingsResult>

  /**
   * Recupera le partite che soddisfano i filtri indicati.
   *
   * Usa `dateFrom`/`dateTo` (finestra temporale) oppure `matchday` (giornata specifica),
   * oppure una combinazione. Il client costruisce l'URL corretto senza cast.
   *
   * @param filters - Filtri provider-neutral (vedi `FootballMatchFilters`).
   */
  getMatches(filters: FootballMatchFilters): Promise<FootballMatch[]>

  /**
   * Recupera la classifica marcatori.
   *
   * @param season - Anno di inizio stagione. Omettere = stagione corrente.
   */
  getScorers(season?: number): Promise<FootballScorer[]>
}
