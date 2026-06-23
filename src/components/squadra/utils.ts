import dayjs from 'dayjs'
import { type z } from 'zod'
import { type giornataSchema } from '~/schemas/calendario'
import { type Moduli } from '~/types/common'
import { type GiocatoreFormazioneType, type GiocatoreType } from '~/types/squadre'
import { convertiStringaInRuolo, moduliList, ModuloPositions } from '~/utils/formazione'

export const allowedFormations: number[] = [
  1343, 1352, 1451, 1442, 1433, 1541, 1532,
]

export function formatModulo(moduloStr: string): string {
  return moduloStr
    .substring(1)
    .split('-')
    .map((num) => parseInt(num, 10))
    .join('-')
}

export function calcolaCodiceFormazione(
  campo: GiocatoreFormazioneType[],
  ruoloGiocatore: string,
): number {
  const ruoli = ['P', 'D', 'C', 'A']
  const conteggio = ruoli.map((ruolo) => {
    const count = campo.filter((giocatore) => giocatore.ruolo === ruolo).length
    return count + (ruolo === ruoloGiocatore ? 1 : 0)
  })

  return Number(conteggio.join(''))
}

export const sortPlayersByRoleDescThenCostoDesc = (
  players: GiocatoreFormazioneType[],
) => {
  return players.sort((a, b) => {
    if (b.ruolo !== a.ruolo) {
      return b.ruolo.localeCompare(a.ruolo)
    } else if (b.costo !== a.costo) {
      return b.costo - a.costo
    } else {
      return a.nome.localeCompare(b.nome)
    }
  })
}

export const sortPlayersByRoleDescThenRiserva = (
  players: GiocatoreFormazioneType[],
) => {
  const playersSorted: GiocatoreFormazioneType[] = []
  // Ensure fixed order: P > D > C > A
  const ruoliOrder = ['P', 'D', 'C', 'A']

  ruoliOrder.forEach((ruolo) => {
    const playersForRuolo = players.filter((player) => player.ruolo === ruolo)
    const playersSortedForRuolo = playersForRuolo.sort((a, b) => {
      if (a.riserva === null && b.riserva === null) {
        return 0
      } else if (a.riserva === null) {
        return -1
      } else if (b.riserva === null) {
        return 1
      }
      return a.riserva - b.riserva
    })

    // Renumber riserva indices sequentially for non-null values (clone to avoid mutating query cache)
    let riservaIndex = 0
    playersSortedForRuolo.forEach((player) => {
      const cloned = { ...player }
      if (cloned.riserva !== null) {
        riservaIndex += 1
        cloned.riserva = riservaIndex
      }
      playersSorted.push(cloned)
    })
  })

  return playersSorted
}

export function getPlayerStylePosition(
  ruolo: string,
  index: number,
  modulo: Moduli,
) {
  const moduloCompatibile = findModuloCompatibile(modulo)
  return ModuloPositions[moduloCompatibile][
    convertiStringaInRuolo(ruolo) ?? 'P'
  ][index]
}

function findModuloCompatibile(modulo: string): Moduli {
  const [D, C, A] = modulo.split('-').map(Number)

  return (
    moduliList.find((m) => {
      const [modD, modC, modA] = m.split('-').map(Number)
      return D <= modD && C <= modC && A <= modA
    }) ?? '3-4-3'
  )
}

export function checkDataFormazione(dataIso: string | undefined) {
  // Parse ISO date strings directly to ensure consistent timezone handling
  const targetDate = new Date(dataIso ?? new Date()).getTime()
  const now = new Date().getTime()
  return targetDate >= now
}

/**
 * Determina se aggiungere un giocatore di `ruoloGiocatore` al campo è valido
 * rispetto ai moduli consentiti. Restituisce il nuovo modulo calcolato, o null
 * se nessuna formazione ammette l'aggiunta.
 */
export function validateAndGetModulo(
  campo: GiocatoreFormazioneType[],
  ruoloGiocatore: string,
): Moduli | null {
  const newState = calcolaCodiceFormazione(campo, ruoloGiocatore)
  const newStateStr = newState.toString().padStart(4, '0')
  const isValid = allowedFormations.some((formation) => {
    const formationStr = formation.toString().padStart(4, '0')
    for (let i = 0; i < 4; i++) {
      const currentRoleCount = parseInt(newStateStr.charAt(i), 10)
      const maxRoleCount = parseInt(formationStr.charAt(i), 10)
      if (currentRoleCount > maxRoleCount) return false
    }
    return true
  })
  return isValid ? (formatModulo(newStateStr) as Moduli) : null
}

/**
 * Applica il click su un giocatore calcolando la nuova distribuzione
 * rosa / campo / panca. Funzione pura: non muta l'input, non ha side effect.
 *
 * @param canAdd - pre-calcolato da validateAndGetModulo (non null → true)
 */
export function applyPlayerClick(
  rosa: GiocatoreFormazioneType[],
  campo: GiocatoreFormazioneType[],
  panca: GiocatoreFormazioneType[],
  playerClicked: GiocatoreFormazioneType,
  canAdd: boolean,
): { rosa: GiocatoreFormazioneType[]; campo: GiocatoreFormazioneType[]; panca: GiocatoreFormazioneType[] } {
  const base: GiocatoreFormazioneType = { ...playerClicked, riserva: null, titolare: false }

  if (rosa.some((c) => c.idGiocatore === base.idGiocatore) && canAdd) {
    return {
      rosa: rosa.filter((p) => p.idGiocatore !== base.idGiocatore),
      campo: [...campo, { ...base, titolare: true }],
      panca,
    }
  }
  if (rosa.some((c) => c.idGiocatore === base.idGiocatore)) {
    return {
      rosa: rosa.filter((p) => p.idGiocatore !== base.idGiocatore),
      campo,
      panca: sortPlayersByRoleDescThenRiserva([...panca, { ...base, riserva: 100 }]),
    }
  }
  if (campo.some((c) => c.idGiocatore === base.idGiocatore)) {
    return {
      rosa: sortPlayersByRoleDescThenRiserva([...rosa, base]),
      campo: campo.filter((p) => p.idGiocatore !== base.idGiocatore),
      panca,
    }
  }
  if (panca.some((c) => c.idGiocatore === base.idGiocatore)) {
    return {
      rosa: [...rosa, base],
      campo,
      panca: panca.filter((p) => p.idGiocatore !== base.idGiocatore),
    }
  }
  return { rosa, campo, panca }
}

export function getOpponent(
  giornata: z.infer<typeof giornataSchema>,
  player: Pick<GiocatoreType, 'nomeSquadraSerieA'>,
) {
  if (!giornata?.SerieA) return null

  const playerTeam = player.nomeSquadraSerieA?.toLowerCase()

  const match = giornata.SerieA.find(
    (c) =>
      c.squadraHome?.toLowerCase().trim() === playerTeam ||
      c.squadraAway?.toLowerCase().trim() === playerTeam,
  )

  if (!match) return ''

  return match.squadraHome?.toLowerCase().trim() === playerTeam
    ? match.squadraAway.toLowerCase().trim()
    : match.squadraHome.toUpperCase().trim()
}

export function getMatch(
  giornata: z.infer<typeof giornataSchema>,
  player: Pick<GiocatoreType, 'nomeSquadraSerieA'>,
  withSubstring: boolean,
) {
  if (!giornata?.SerieA) return null

  const playerTeam = player.nomeSquadraSerieA?.toLowerCase()

  const match = giornata.SerieA.find(
    (c) =>
      c.squadraHome?.toLowerCase().trim() === playerTeam ||
      c.squadraAway?.toLowerCase().trim() === playerTeam,
  )

  if (!match) return ''

  if (withSubstring)
    return `${match.squadraHome?.trim().substring(0, 3) ?? ''} - ${match.squadraAway?.trim().substring(0, 3) ?? ''}`
  else
    return `${match.squadraHome?.trim() ?? ''} - ${match.squadraAway?.trim() ?? ''}`
}
