/**
 * tabelliniService — mapper puri per il tabellino di una partita.
 *
 * Nessuna dipendenza da contesto tRPC, DB o sessione.
 * Rimuove la duplicazione tra home e away in getTabellini.
 */

import { Configurazione } from '~/config'
import { Voti } from '~/server/db/entities'

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

// ─── Funzioni spostate da ~/server/utils/common ────────────────────────────

export function getBonusModulo(modulo: string) {
  const moduloToBonusMap: Record<string, number> = {
    '3-5-2': Configurazione.bonusModulo352,
    '4-3-3': Configurazione.bonusModulo433,
    '4-5-1': Configurazione.bonusModulo451,
    '4-4-2': Configurazione.bonusModulo442,
    '3-4-3': Configurazione.bonusModulo343,
    '5-3-2': Configurazione.bonusModulo532,
    '5-4-1': Configurazione.bonusModulo541,
    '': 0,
  }

  return Configurazione.bonusModulo ? (moduloToBonusMap[modulo] ?? 0) : 0
}

export function getGiocatoriVotoInfluente(
  giocatoriFormazione: {
    ruolo: string
    idVoto: number
    voto: number | null
    ammonizione: number
    espulsione: number
    gol: number | null
    assist: number | null
    altriBonus: number | null
    autogol: number | null
    titolare: boolean
    idGiocatore: number
    votoBonus: number
    isSostituito: boolean
    isVotoInfluente: boolean
  }[],
) {
  return giocatoriFormazione.filter((c) => c.isVotoInfluente)
}

export function getBonusSenzaVoto(giocatoriInfluenti: number) {
  return (
    (11 - giocatoriInfluenti > Configurazione.maxSostituzioni
      ? Configurazione.maxSostituzioni
      : 11 - giocatoriInfluenti) * Configurazione.bonusSenzaVoto
  )
}

export function getGolSegnati(fantapunti: number): number {
  const soglieGol = {
    soglia1: 66,
    soglia2: 72,
    soglia3: 78,
    soglia4: 82,
    soglia5: 86,
    soglia6: 90,
    soglia7: 94,
    soglia8: 98,
  }

  let gol = 0

  if (fantapunti >= soglieGol.soglia1 && fantapunti < soglieGol.soglia2) {
    gol = 1
  } else if (
    fantapunti >= soglieGol.soglia2 &&
    fantapunti < soglieGol.soglia3
  ) {
    gol = 2
  } else if (
    fantapunti >= soglieGol.soglia3 &&
    fantapunti < soglieGol.soglia4
  ) {
    gol = 3
  } else if (
    fantapunti >= soglieGol.soglia4 &&
    fantapunti < soglieGol.soglia5
  ) {
    gol = 4
  } else if (
    fantapunti >= soglieGol.soglia5 &&
    fantapunti < soglieGol.soglia6
  ) {
    gol = 5
  } else if (
    fantapunti >= soglieGol.soglia6 &&
    fantapunti < soglieGol.soglia7
  ) {
    gol = 6
  } else if (
    fantapunti >= soglieGol.soglia7 &&
    fantapunti < soglieGol.soglia8
  ) {
    gol = 7
  } else if (fantapunti >= soglieGol.soglia8) {
    gol = 8
  }

  return gol
}

export function getCountRiserve(titolariInfluenti: number) {
  return 11 - titolariInfluenti > Configurazione.maxSostituzioni
    ? Configurazione.maxSostituzioni
    : 11 - titolariInfluenti
}

export function getVotoBonus(voto: Voti): number {
  let bonus = 0
  bonus += voto.voto ?? 0
  bonus += voto.ammonizione ?? 0
  bonus += voto.espulsione ?? 0
  bonus += voto.gol ?? 0
  bonus += voto.assist ?? 0
  bonus += voto.autogol ?? 0
  bonus += voto.altriBonus ?? 0
  return bonus
}

export async function getTabellino(idFormazione: number) {
  const giocatoriFormazione = (
    await Voti.find({
      select: { Giocatore: { ruolo: true } },
      relations: { Giocatore: true },
      where: {
        idFormazione: idFormazione,
      },
    })
  ).map((v) => ({
    ruolo: v.Giocatore.ruolo,
    idVoto: v.idVoto,
    voto: v.voto,
    ammonizione: v.ammonizione,
    espulsione: v.espulsione,
    gol: v.gol,
    assist: v.assist,
    altriBonus: v.altriBonus,
    autogol: v.autogol,
    titolare: v.titolare,
    riserva: v.riserva,
    idGiocatore: v.idGiocatore,
    votoBonus: getVotoBonus(v),
    isSostituito: false,
    isVotoInfluente: v.titolare && v.voto && v.voto > 0 ? true : false,
  }))
  const countRiserve = getCountRiserve(
    getGiocatoriVotoInfluente(giocatoriFormazione).length,
  )

  console.info(
    `Titolari influenti: ${getGiocatoriVotoInfluente(giocatoriFormazione).length}, Count Riserve: ${countRiserve}`,
  )
  if (getGiocatoriVotoInfluente(giocatoriFormazione).length < 11) {
    let iRiserve = 0
    const titolariSenzaVoto = giocatoriFormazione.filter(
      (c) => c.titolare && c.voto == 0,
    )
    const riserveConVoto = giocatoriFormazione
      .filter((c) => c.riserva !== null && c.voto && c.voto > 0)
      .sort((a, b) => {
        if (a.riserva === null) return -1
        if (b.riserva === null) return 1
        if (a.riserva !== b.riserva) return a.riserva - b.riserva
        return b.votoBonus - a.votoBonus
      })
    console.info(
      `Titolari senza voto: ${titolariSenzaVoto.length}, Riserve con voto: ${riserveConVoto.length}, Count Riserve: ${countRiserve}`,
    )

    if (titolariSenzaVoto.length > 0) {
      for (const riserva of riserveConVoto) {
        const giocatoreRuolo = titolariSenzaVoto.find(
          (c) => c.ruolo === riserva.ruolo,
        )
        if (giocatoreRuolo) {
          titolariSenzaVoto.splice(
            titolariSenzaVoto.findIndex(
              (r) => r.idVoto === giocatoreRuolo.idVoto,
            ),
            1,
          )
          if (
            riserveConVoto.find(
              (c) => c.ruolo === giocatoreRuolo.ruolo && !c.isVotoInfluente,
            )
          ) {
            giocatoriFormazione
              .filter((c) => c.idVoto === giocatoreRuolo.idVoto)
              .forEach((c) => (c.isSostituito = true))
            giocatoriFormazione
              .filter((c) => c.idVoto === riserva.idVoto)
              .forEach((c) => (c.isVotoInfluente = true))
            riserveConVoto
              .filter((c) => c.idVoto === riserva.idVoto)
              .forEach((c) => (c.isVotoInfluente = true))
            iRiserve++
          }
        }
        if (iRiserve === countRiserve) break
      }
    }
  }
  for (const g of giocatoriFormazione.filter((c) => c.isVotoInfluente)) {
    console.info(
      `idgiocatore ${g.idGiocatore} ${g.votoBonus} - sostituito: ${g.isSostituito}`,
    )
  }
  return giocatoriFormazione
}
