/**
 * probabiliFormazioniService — orchestrazione del cron "probabili formazioni".
 *
 * Flusso:
 * 1. Controlla la finestra temporale: [dataInizio - 48h, dataInizio) Europe/Rome,
 *    salvo bypass esplicito. Se fuori finestra → restituisce risultato skipped
 *    senza toccare il DB.
 * 2. Scarica l'HTML dalla fonte.
 * 3. Valida il parsing completo (parser lancia se non valido).
 * 4. In una singola transazione:
 *    a. Elimina tutti i ProbabileFormazioneGiocatore
 *    b. Elimina tutti i ProbabileFormazione
 *    c. Inserisce nuovi ProbabileFormazione + ProbabileFormazioneGiocatore
 * 5. Restituisce conteggi.
 *
 * Il giornataSerieA salvato è quello della prossima giornata DB, non il numero
 * eventualmente presente nella pagina fonte.
 */

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import { AppDataSource } from '~/data-source'
import {
  ProbabileFormazione,
  ProbabileFormazioneGiocatore,
  SerieA,
} from '~/server/db/entities'
import {
  getProssimaGiornataSerieA,
  getProssimaGiornata,
} from '~/server/api/calendario/repository'
import {
  parseProbabiliFormazioni,
  type MatchProbabile,
} from './probabiliFormazioniParser'
import {
  loadCandidatiPerStagione,
  matchGiocatore,
  type CandidatesByTeam,
} from './probabiliFormazioniMatcher'
import { Configurazione } from '~/config'
import { isInProbabiliFormazioniWindow } from './probabiliFormazioniWindow'

dayjs.extend(utc)
dayjs.extend(timezone)

const TIMEZONE = 'Europe/Rome'
const SOURCE_URL = 'https://www.fantacalcio.it/probabili-formazioni-serie-a'
const WINDOW_HOURS = 48

// ─── Tipi pubblici ────────────────────────────────────────────────────────────

export interface ProbabiliFormazioniResult {
  status: 'ok' | 'skipped' | 'error'
  /** Presente quando status === 'skipped' */
  reason?: string
  giornataSerieA?: number
  matchImportati?: number
  giocatoriImportati?: number
  giocatoriAssociati?: number
  giocatoriNonAssociati?: number
  fetchedAt?: string
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export async function importaProbabiliFormazioni(
  bypassFinestraTemporale = false,
): Promise<ProbabiliFormazioniResult> {
  const now = dayjs().tz(TIMEZONE)
  // ── 1. Prossima giornata Serie A non giocata ─────────────────────────────
  const giornataSerieA = await getProssimaGiornataSerieA(false, 'asc')

  if (!giornataSerieA) {
    return {
      status: 'skipped',
      reason: 'Nessuna giornata Serie A non giocata trovata',
    }
  }

  // ── 2. Data di inizio della giornata (earliest Calendario.data) ───────────
  const giornate = await getProssimaGiornata(giornataSerieA, false)
  const dataInizio = giornate
    .flatMap((g) => (g.data ? [new Date(g.data)] : []))
    .sort((a, b) => a.getTime() - b.getTime())[0]

  if (!dataInizio) {
    return {
      status: 'skipped',
      reason: `Nessuna data trovata per la giornata ${giornataSerieA}`,
    }
  }

  // ── 3. Controllo finestra temporale ──────────────────────────────────────
  const dataInizioTz = dayjs(dataInizio).tz(TIMEZONE)
  const windowStart = dataInizioTz.subtract(WINDOW_HOURS, 'hour')

  const inWindow = isInProbabiliFormazioniWindow(
    now.toDate(),
    dataInizioTz.toDate(),
  )

  if (!bypassFinestraTemporale && !inWindow) {
    return {
      status: 'skipped',
      reason:
        `Fuori dalla finestra temporale. now=${now.toISOString()}, ` +
        `finestra=[${windowStart.toISOString()}, ${dataInizioTz.toISOString()})`,
    }
  }

  // ── 4. Fetch HTML ─────────────────────────────────────────────────────────
  console.log(`[probabiliFormazioni] Fetch da ${SOURCE_URL}`)
  const html = await fetchHtml(SOURCE_URL)

  // ── 5. Parsing ────────────────────────────────────────────────────────────
  const expectedMatchCount = await SerieA.count({
    where: { giornata: giornataSerieA },
  })
  if (expectedMatchCount === 0) {
    throw new Error(
      `[probabiliFormazioni] Nessuna partita Serie A configurata per la giornata ${giornataSerieA}`,
    )
  }

  const { matches } = parseProbabiliFormazioni(html, {
    expectedMatchCount,
    minimumPlayersPerTeam: 12,
  })
  console.log(`[probabiliFormazioni] Parsed ${matches.length} match`)

  // ── 6. Carica candidati giocatori per la stagione ─────────────────────────
  const stagione = Configurazione.stagione
  const candidatiPerSquadra: CandidatesByTeam =
    await loadCandidatiPerStagione(stagione)

  // ── 7. Transazione ────────────────────────────────────────────────────────
  const fetchedAt = new Date()
  const stats = await persistiInTransazione(
    matches,
    giornataSerieA,
    fetchedAt,
    candidatiPerSquadra,
  )

  console.log(
    `[probabiliFormazioni] Completato: ${stats.matchImportati} match, ` +
      `${stats.giocatoriImportati} giocatori ` +
      `(${stats.giocatoriAssociati} associati, ${stats.giocatoriNonAssociati} non associati)`,
  )

  return {
    status: 'ok',
    giornataSerieA,
    fetchedAt: fetchedAt.toISOString(),
    ...stats,
  }
}

// ─── Fetch HTML ───────────────────────────────────────────────────────────────

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ErFantacalcio-bot/1.0)',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'it-IT,it;q=0.9',
    },
    // next.js fetch cache: no-store per avere sempre dati freschi
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok) {
    throw new Error(
      `[probabiliFormazioni] Fetch fallito: ${response.status} ${response.statusText}`,
    )
  }

  return response.text()
}

// ─── Persistenza transazionale ────────────────────────────────────────────────

interface PersistStats {
  matchImportati: number
  giocatoriImportati: number
  giocatoriAssociati: number
  giocatoriNonAssociati: number
}

async function persistiInTransazione(
  matches: MatchProbabile[],
  giornataSerieA: number,
  fetchedAt: Date,
  candidatiPerSquadra: CandidatesByTeam,
): Promise<PersistStats> {
  let matchImportati = 0
  let giocatoriImportati = 0
  let giocatoriAssociati = 0
  let giocatoriNonAssociati = 0

  await AppDataSource.transaction(async (trx) => {
    // a. Elimina prima tutti i ProbabileFormazioneGiocatore
    await trx
      .createQueryBuilder()
      .delete()
      .from(ProbabileFormazioneGiocatore)
      .execute()
    // b. Elimina tutti i ProbabileFormazione
    await trx.createQueryBuilder().delete().from(ProbabileFormazione).execute()

    // c. Inserisce nuovi ProbabileFormazione + ProbabileFormazioneGiocatore
    for (const match of matches) {
      // Crea ProbabileFormazione
      const pf = trx.create(ProbabileFormazione, {
        giornataSerieA,
        partita: match.partita,
        fetchedAt,
      })
      const savedPf = await trx.save(ProbabileFormazione, pf)

      // Crea ProbabileFormazioneGiocatore per ogni giocatore
      const pfgList = match.giocatori.map((g) => {
        const matchResult = matchGiocatore(
          g.nome,
          g.ruolo,
          g.squadra,
          candidatiPerSquadra,
        )

        if (matchResult.idGiocatore !== null) {
          giocatoriAssociati++
        } else {
          giocatoriNonAssociati++
        }

        return trx.create(ProbabileFormazioneGiocatore, {
          idProbabileFormazione: savedPf.idProbabileFormazione,
          idGiocatore: matchResult.idGiocatore,
          nomeGiocatore: g.nome,
          squadra: g.squadra,
          ruolo: g.ruolo,
          probabilita: g.probabilita,
          stato: g.stato,
        })
      })

      await trx.save(ProbabileFormazioneGiocatore, pfgList)

      giocatoriImportati += pfgList.length
      matchImportati++
    }
  })

  return {
    matchImportati,
    giocatoriImportati,
    giocatoriAssociati,
    giocatoriNonAssociati,
  }
}
