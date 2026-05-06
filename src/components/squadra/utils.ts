import dayjs from 'dayjs'
import { type z } from 'zod'
import { type giornataSchema } from '~/schemas/calendario'
import { type Moduli } from '~/types/common'
import { type GiocatoreFormazioneType, type GiocatoreType } from '~/types/squadre'
import {
  convertiStringaInRuolo,
  moduliList,
  ModuloPositions,
} from '~/utils/helper'

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

    // Renumber riserva indices sequentially for non-null values
    let riservaIndex = 0
    playersSortedForRuolo.forEach((player) => {
      if (player.riserva !== null) {
        riservaIndex += 1
        player.riserva = riservaIndex
      }
      playersSorted.push(player)
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
