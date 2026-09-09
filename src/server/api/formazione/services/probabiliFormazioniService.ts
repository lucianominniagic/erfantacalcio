/**
 * probabiliFormazioniService — orchestrazione del cron "probabili formazioni".
 *
 * Flusso:
 * 1. Controlla la finestra temporale: [dataInizio - 72h, dataInizio) Europe/Rome,
 *    salvo bypass esplicito. Se fuori finestra → restituisce risultato skipped.
 *    Se la finestra è scaduta (giornata già iniziata, non "troppo presto"),
 *    elimina le probabili formazioni ormai stale per quella giornata prima
 *    di uscire (delete idempotente, cascata su ProbabileFormazioneGiocatore).
 * 2. Scarica l'HTML dalla fonte primaria (fantacalcio.it) e, in parallelo,
 *    dalla fonte secondaria (sosfanta.com).
 * 3. Valida il parsing completo della fonte primaria (il parser lancia se
 *    non valido — la fonte primaria è obbligatoria, se fallisce l'intero job
 *    fallisce). La fonte secondaria è best-effort: un suo fallimento (fetch,
 *    parsing, o flag di configurazione disattivato) NON fa fallire il job,
 *    si prosegue semplicemente senza media.
 * 4. Associa ogni giocatore sosfanta a un idGiocatore tramite lo stesso
 *    matcher usato per fantacalcio, riusando gli stessi candidati per
 *    stagione. I giocatori sosfanta non associabili vengono scartati:
 *    sosfanta contribuisce solo una probabilità aggiuntiva per giocatori già
 *    identificati dalla fonte primaria, mai nuove righe.
 * 5. In una singola transazione:
 *    a. Elimina tutti i ProbabileFormazioneGiocatore
 *    b. Elimina tutti i ProbabileFormazione
 *    c. Inserisce nuovi ProbabileFormazione + ProbabileFormazioneGiocatore,
 *       con probabilita = media fantacalcio/sosfanta quando disponibile
 * 6. Restituisce conteggi.
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
  parseSosfantaProbabiliFormazioni,
  type SosfantaPlayer,
} from './probabiliFormazioniSosfantaParser'
import {
  loadCandidatiPerStagione,
  matchGiocatore,
  type CandidatesByTeam,
} from './probabiliFormazioniMatcher'
import { mergeProbabilita } from './probabiliFormazioniMerge'
import { Configurazione } from '~/config'
import {
  isInProbabiliFormazioniWindow,
  WINDOW_HOURS,
} from './probabiliFormazioniWindow'

dayjs.extend(utc)
dayjs.extend(timezone)

const TIMEZONE = 'Europe/Rome'
const SOURCE_URL = 'https://www.fantacalcio.it/probabili-formazioni-serie-a'
const SOSFANTA_SOURCE_URL =
  'https://www.sosfanta.com/lista-formazioni/probabili-formazioni-serie-a/'

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
  /** true se fetch+parsing della fonte secondaria sosfanta.com è riuscito */
  fonteSosfantaOk?: boolean
  /** Presente solo quando fonteSosfantaOk === false */
  fonteSosfantaErrore?: string
  /** Numero di giocatori la cui probabilita è una media fantacalcio/sosfanta */
  giocatoriMediati?: number
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export async function importaProbabiliFormazioni(
  bypassFinestraTemporale = false,
): Promise<ProbabiliFormazioniResult> {
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
  if (!bypassFinestraTemporale) {
    const now = dayjs().tz(TIMEZONE)
    const windowStart = dataInizioTz.subtract(WINDOW_HOURS, 'hour')
    const inWindow = isInProbabiliFormazioniWindow(
      now.toDate(),
      dataInizioTz.toDate(),
    )

    if (!inWindow) {
      // Finestra scaduta (giornata già iniziata, non solo "troppo presto"):
      // elimina tutti i dati ormai stale (come in persistiInTransazione,
      // non serve filtrare per giornata: la tabella contiene solo l'ultima
      // giornata importata). Idempotente — se già eliminati da un run
      // precedente non trova nulla da cancellare. La delete su
      // ProbabileFormazione basta da sola: la FK verso
      // ProbabileFormazioneGiocatore ha `onDelete: 'CASCADE'`.
      if (now.toDate().getTime() >= dataInizioTz.toDate().getTime()) {
        const deleted = await ProbabileFormazione.createQueryBuilder()
          .delete()
          .execute()
        if ((deleted.affected ?? 0) > 0) {
          console.log(
            `[probabiliFormazioni] Finestra scaduta: eliminate ${deleted.affected} probabili formazioni`,
          )
        }
      }

      return {
        status: 'skipped',
        reason:
          `Fuori dalla finestra temporale. now=${now.toISOString()}, ` +
          `finestra=[${windowStart.toISOString()}, ${dataInizioTz.toISOString()})`,
      }
    }
  }

  // ── 4. Fetch + parsing in parallelo (fantacalcio.it obbligatoria, ─────────
  //      sosfanta.com best-effort) ───────────────────────────────────────────
  const expectedMatchCount = await SerieA.count({
    where: { giornata: giornataSerieA },
  })
  if (expectedMatchCount === 0) {
    throw new Error(
      `[probabiliFormazioni] Nessuna partita Serie A configurata per la giornata ${giornataSerieA}`,
    )
  }

  const fantacalcioTask = async (): Promise<{ matches: MatchProbabile[] }> => {
    console.log(`[probabiliFormazioni] Fetch da ${SOURCE_URL}`)
    const html = await fetchHtml(SOURCE_URL)
    return parseProbabiliFormazioni(html, {
      expectedMatchCount,
      minimumPlayersPerTeam: 12,
    })
  }

  const sosfantaAbilitata = Configurazione.probabiliFormazioniSosfantaEnabled
  const sosfantaTask = async (): Promise<{ players: SosfantaPlayer[] }> => {
    if (!sosfantaAbilitata) {
      throw new Error('Fonte disabilitata da configurazione')
    }
    console.log(`[probabiliFormazioni] Fetch da ${SOSFANTA_SOURCE_URL}`)
    const html = await fetchHtml(SOSFANTA_SOURCE_URL)
    return parseSosfantaProbabiliFormazioni(html)
  }

  const [fantacalcioSettled, sosfantaSettled] = await Promise.allSettled([
    fantacalcioTask(),
    sosfantaTask(),
  ])

  // La fonte primaria resta obbligatoria: un suo fallimento fa fallire il job.
  if (fantacalcioSettled.status === 'rejected') {
    throw fantacalcioSettled.reason
  }
  const { matches } = fantacalcioSettled.value
  console.log(
    `[probabiliFormazioni] Parsed ${matches.length} match (fantacalcio.it)`,
  )

  let fonteSosfantaOk = false
  let fonteSosfantaErrore: string | undefined
  let sosfantaPlayers: SosfantaPlayer[] = []

  if (sosfantaSettled.status === 'fulfilled') {
    fonteSosfantaOk = true
    sosfantaPlayers = sosfantaSettled.value.players
    console.log(
      `[probabiliFormazioni] Parsed ${sosfantaPlayers.length} giocatori (sosfanta.com)`,
    )
  } else {
    fonteSosfantaErrore =
      sosfantaSettled.reason instanceof Error
        ? sosfantaSettled.reason.message
        : String(sosfantaSettled.reason)
    console.warn(
      `[probabiliFormazioni] Fonte sosfanta.com non disponibile: ${fonteSosfantaErrore}`,
    )
  }

  // ── 5. Carica candidati giocatori per la stagione ─────────────────────────
  const stagione = Configurazione.stagione
  const candidatiPerSquadra: CandidatesByTeam =
    await loadCandidatiPerStagione(stagione)

  // ── 6. Associa i giocatori sosfanta a idGiocatore (stesso matcher/candidati)
  const sosfantaProbabilitaPerGiocatore = new Map<number, number>()
  if (fonteSosfantaOk) {
    for (const player of sosfantaPlayers) {
      const { idGiocatore } = matchGiocatore(
        player.nome,
        '',
        player.squadra,
        candidatiPerSquadra,
      )
      if (idGiocatore === null) continue

      if (sosfantaProbabilitaPerGiocatore.has(idGiocatore)) {
        console.warn(
          `[probabiliFormazioni] Giocatore sosfanta duplicato per idGiocatore=${idGiocatore} ` +
            `(${player.nome}), mantengo la prima occorrenza`,
        )
        continue
      }

      sosfantaProbabilitaPerGiocatore.set(idGiocatore, player.probabilita)
    }
  }

  // ── 7. Transazione ────────────────────────────────────────────────────────
  const fetchedAt = new Date()
  const stats = await persistiInTransazione(
    matches,
    giornataSerieA,
    fetchedAt,
    candidatiPerSquadra,
    sosfantaProbabilitaPerGiocatore,
  )

  console.log(
    `[probabiliFormazioni] Completato: ${stats.matchImportati} match, ` +
      `${stats.giocatoriImportati} giocatori ` +
      `(${stats.giocatoriAssociati} associati, ${stats.giocatoriNonAssociati} non associati), ` +
      `sosfanta=${fonteSosfantaOk ? 'ok' : `non disponibile (${fonteSosfantaErrore})`}, ` +
      `${stats.giocatoriMediati} mediati`,
  )

  return {
    status: 'ok',
    giornataSerieA,
    fetchedAt: fetchedAt.toISOString(),
    fonteSosfantaOk,
    ...(fonteSosfantaErrore !== undefined ? { fonteSosfantaErrore } : {}),
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
  giocatoriMediati: number
}

async function persistiInTransazione(
  matches: MatchProbabile[],
  giornataSerieA: number,
  fetchedAt: Date,
  candidatiPerSquadra: CandidatesByTeam,
  sosfantaProbabilitaPerGiocatore: Map<number, number>,
): Promise<PersistStats> {
  let matchImportati = 0
  let giocatoriImportati = 0
  let giocatoriAssociati = 0
  let giocatoriNonAssociati = 0
  let giocatoriMediati = 0

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

        // Media con sosfanta.com quando disponibile per lo stesso idGiocatore
        // (senza idGiocatore non è possibile alcuna media: nome/ruolo/squadra/
        // stato restano quelli di fantacalcio.it, invariati).
        let probabilita = g.probabilita
        if (matchResult.idGiocatore !== null) {
          const merged = mergeProbabilita({
            idGiocatore: matchResult.idGiocatore,
            probabilitaFantacalcio: g.probabilita,
            probabilitaSosfanta:
              sosfantaProbabilitaPerGiocatore.get(matchResult.idGiocatore) ??
              null,
          })
          probabilita = merged.probabilita
          if (merged.fonteSosfantaUsata) {
            giocatoriMediati++
          }
        }

        return trx.create(ProbabileFormazioneGiocatore, {
          idProbabileFormazione: savedPf.idProbabileFormazione,
          idGiocatore: matchResult.idGiocatore,
          nomeGiocatore: g.nome,
          squadra: g.squadra,
          ruolo: g.ruolo,
          probabilita,
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
    giocatoriMediati,
  }
}
