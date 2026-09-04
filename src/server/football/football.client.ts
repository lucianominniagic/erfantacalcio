/**
 * football.client — implementazione concreta di IFootballProvider per
 * football-data.org API v4.
 *
 * Caratteristiche:
 * - fetch nativo con AbortSignal.timeout() (8 s per tentativo).
 * - Header `X-Auth-Token` letto da `process.env.FOOTBALL_DATA_API_KEY`;
 *   fallisce esplicitamente a runtime se la chiave è assente.
 * - Retry bounded (max 2 tentativi extra) solo per errori di rete e 5xx;
 *   4xx, 429 e parse errors sono `NonRetryableError` e vengono rilanciati
 *   immediatamente.
 * - JSON parsato come `unknown`, poi validato con gli schema Zod raw.
 * - Nessun `any` o cast non sicuro.
 *
 * Esporta il singleton `footballDataClient: IFootballProvider` da usare
 * in produzione. I test iniettano un mock via `IFootballProvider`.
 */
import {
  fdStandingsResponseSchema,
  fdMatchesResponseSchema,
  fdScorersResponseSchema,
  SERIE_A_COMPETITION_CODE,
} from '~/schemas/football'
import type { FootballMatch, FootballScorer } from '~/schemas/football'
import type { IFootballProvider, StandingsResult, FootballMatchFilters } from './football.types'
import { mapStandings, mapMatches, mapScorers } from './football.mapper'

// ---------------------------------------------------------------------------
// Costanti
// ---------------------------------------------------------------------------

const BASE_URL = 'https://api.football-data.org/v4'
const FETCH_TIMEOUT_MS = 8_000
const MAX_RETRIES = 2
const RETRY_DELAY_BASE_MS = 300

// ---------------------------------------------------------------------------
// Errori
// ---------------------------------------------------------------------------

/**
 * Errore non riprovabile: HTTP 4xx, 429, errori di parsing.
 * Il retry non avrebbe senso per queste condizioni.
 */
class FootballNonRetryableError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message)
    this.name = 'FootballNonRetryableError'
  }
}

// ---------------------------------------------------------------------------
// API key helper
// ---------------------------------------------------------------------------

function requireApiKey(): string {
  const key = process.env.FOOTBALL_DATA_API_KEY
  if (!key) {
    throw new FootballNonRetryableError(
      'FOOTBALL_DATA_API_KEY non configurata — impossibile contattare football-data.org. ' +
        'Aggiungere la chiave alle variabili d\'ambiente del server.',
    )
  }
  return key
}

// ---------------------------------------------------------------------------
// Fetch con retry
// ---------------------------------------------------------------------------

async function fetchJson(path: string): Promise<unknown> {
  const apiKey = requireApiKey()
  const url = `${BASE_URL}${path}`
  let lastError: Error = new Error(`Fetch fallito senza risposta per ${url}`)

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise<void>((resolve) =>
        setTimeout(resolve, RETRY_DELAY_BASE_MS * attempt),
      )
    }

    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          'X-Auth-Token': apiKey,
          Accept: 'application/json',
        },
        // Bypassa cache Next.js per il fetch raw — la cache è gestita a livello
        // di servizio tramite unstable_cache.
        cache: 'no-store',
      })

      if (!res.ok) {
        // 4xx e 429: non ha senso riprovare
        if (res.status >= 400 && res.status < 500) {
          throw new FootballNonRetryableError(
            `football-data.org HTTP ${res.status} ${res.statusText} — richiesta non riprovabile (${url})`,
            res.status,
          )
        }
        // 5xx: transiente, il loop riprova
        lastError = new Error(
          `football-data.org HTTP ${res.status} ${res.statusText} (${url})`,
        )
        continue
      }

      // Parsa come unknown — il Zod schema valida la shape nel chiamante
      return (await res.json()) as unknown
    } catch (err) {
      if (err instanceof FootballNonRetryableError) throw err
      if (err instanceof Error) {
        lastError = err
        // AbortError (timeout) o errori di rete — transiente, riprova
      }
    }
  }

  throw lastError
}

// ---------------------------------------------------------------------------
// Helpers URL
// ---------------------------------------------------------------------------

function withSeasonParam(base: string, season?: number): string {
  return season !== undefined ? `${base}?season=${season}` : base
}

/**
 * Costruisce l'URL per la query delle partite Serie A a partire dai filtri
 * provider-neutral `FootballMatchFilters`.
 *
 * Usa `URLSearchParams` per garantire encoding corretto senza cast o `any`.
 * I parametri presenti nei filtri sono aggiunti nell'ordine: season, dateFrom,
 * dateTo, matchday (tutti opzionali).
 */
function matchesUrl(filters: FootballMatchFilters): string {
  const params = new URLSearchParams()
  if (filters.season !== undefined) params.set('season', String(filters.season))
  if (filters.dateFrom !== undefined) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo !== undefined) params.set('dateTo', filters.dateTo)
  if (filters.matchday !== undefined) params.set('matchday', String(filters.matchday))
  const qs = params.toString()
  return `/competitions/${SERIE_A_COMPETITION_CODE}/matches${qs ? `?${qs}` : ''}`
}

// ---------------------------------------------------------------------------
// Implementazione concreta IFootballProvider
// ---------------------------------------------------------------------------

export const footballDataClient: IFootballProvider = {
  async getStandings(season?: number): Promise<StandingsResult> {
    const path = withSeasonParam(
      `/competitions/${SERIE_A_COMPETITION_CODE}/standings`,
      season,
    )
    const raw = await fetchJson(path)
    const parsed = fdStandingsResponseSchema.parse(raw)
    console.dir(mapStandings(parsed), { depth: null })
    return mapStandings(parsed)
  },

  async getMatches(filters: FootballMatchFilters): Promise<FootballMatch[]> {
    const raw = await fetchJson(matchesUrl(filters))
    const parsed = fdMatchesResponseSchema.parse(raw)
    return mapMatches(parsed).sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
  },

  async getScorers(season?: number): Promise<FootballScorer[]> {
    const path = withSeasonParam(
      `/competitions/${SERIE_A_COMPETITION_CODE}/scorers`,
      season,
    )
    const raw = await fetchJson(path)
    const parsed = fdScorersResponseSchema.parse(raw)
    return mapScorers(parsed)
  },
}
