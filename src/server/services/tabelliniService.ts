/**
 * tabelliniService — mapper puri per il tabellino di una partita.
 *
 * Nessuna dipendenza da contesto tRPC, DB o sessione.
 * Rimuove la duplicazione tra home e away in getTabellini.
 */

import {
  getBonusModulo,
  getBonusSenzaVoto,
  getGolSegnati,
} from '~/server/utils/common'
import { Configurazione } from '~/config'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GiocatoreInfluente {
  idVoto: number
  votoBonus: number | null
  isSostituito: boolean
  isVotoInfluente: boolean
}

export interface VotoFormazione {
  idVoto: number
  voto: number | null
  ammonizione: number | null
  espulsione: number | null
  gol: number | null
  assist: number | null
  autogol: number | null
  altriBonus: number | null
  titolare: boolean
  riserva: number | null
  Giocatore: {
    idGiocatore: number
    nome: string
    ruolo: string
    Trasferimenti: Array<{
      SquadraSerieA?: { nome: string; maglia: string } | null
    }>
  }
}

export interface TabellinoVotoEntry {
  nome: string
  idGiocatore: number
  titolare: boolean
  riserva: number | null
  nomeSquadraSerieA: string | undefined
  magliaSquadraSerieA: string | undefined
  ruolo: string
  voto: number
  ammonizione: number
  espulsione: number
  gol: number
  assist: number
  autogol: number
  altriBonus: number
  votoBonus: number
  isSostituito: boolean
  isVotoInfluente: boolean
}

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Mappa un singolo `VotoFormazione` nel formato tabellino arricchito,
 * usando `giocatoriInfluenti` per ottenere votoBonus e flag di sostituzione.
 */
export function mapVotoToTabellinoEntry(
  voto: VotoFormazione,
  giocatoriInfluenti: GiocatoreInfluente[],
): TabellinoVotoEntry {
  const influente = giocatoriInfluenti.find((gi) => gi.idVoto === voto.idVoto)
  return {
    nome: voto.Giocatore.nome,
    idGiocatore: voto.Giocatore.idGiocatore,
    titolare: voto.titolare,
    riserva: voto.riserva,
    nomeSquadraSerieA: voto.Giocatore.Trasferimenti[0]?.SquadraSerieA?.nome,
    magliaSquadraSerieA: voto.Giocatore.Trasferimenti[0]?.SquadraSerieA?.maglia,
    ruolo: voto.Giocatore.ruolo,
    voto: voto.voto ?? 0,
    ammonizione: voto.ammonizione ?? 0,
    espulsione: voto.espulsione ?? 0,
    gol: voto.gol ?? 0,
    assist: voto.assist ?? 0,
    autogol: voto.autogol ?? 0,
    altriBonus: voto.altriBonus ?? 0,
    votoBonus: influente?.votoBonus ?? 0,
    isSostituito: influente?.isSostituito ?? false,
    isVotoInfluente: influente?.isVotoInfluente ?? false,
  }
}

// ─── calcolaFantapunti ────────────────────────────────────────────────────────

export interface CalcolaFantapuntiResult {
  fantapuntiBase: number
  fantapuntiTotale: number
  bonusModulo: number
  bonusSenzaVoto: number
  fattoreCasalingo: number
  golSegnati: number
  giocatoriInfluentiCount: number
}

export function calcolaFantapunti(
  giocatoriFormazione: GiocatoreInfluente[],
  modulo: string,
  isFattoreCasalingo: boolean,
): CalcolaFantapuntiResult {
  const influenti = giocatoriFormazione.filter((g) => g.isVotoInfluente)
  const fantapuntiBase = influenti.reduce(
    (acc, g) => acc + (g.votoBonus ?? 0),
    0,
  )

  if (fantapuntiBase === 0) {
    return {
      fantapuntiBase: 0,
      fantapuntiTotale: 0,
      bonusModulo: 0,
      bonusSenzaVoto: 0,
      fattoreCasalingo: 0,
      golSegnati: 0,
      giocatoriInfluentiCount: influenti.length,
    }
  }

  const bonusModulo = getBonusModulo(modulo)
  const bonusSenzaVoto = getBonusSenzaVoto(influenti.length)
  const fattoreCasalingo = isFattoreCasalingo
    ? Configurazione.bonusFattoreCasalingo
    : 0
  const fantapuntiTotale =
    fantapuntiBase + bonusModulo + bonusSenzaVoto + fattoreCasalingo

  return {
    fantapuntiBase,
    fantapuntiTotale,
    bonusModulo,
    bonusSenzaVoto,
    fattoreCasalingo,
    golSegnati: getGolSegnati(fantapuntiTotale),
    giocatoriInfluentiCount: influenti.length,
  }
}
