import dayjs from 'dayjs'
import { type Moduli } from '~/types/common'
import { type GiocatoreFormazioneType } from '~/types/squadre'
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
    .split('')
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
  const ruoliUnici = [...new Set(players.map((player) => player.ruolo))]

  ruoliUnici.forEach((ruolo) => {
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

    playersSortedForRuolo.forEach((player, index) => {
      if (player.riserva !== null) {
        player.riserva = index + 1
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
      return D! <= modD! && C! <= modC! && A! <= modA!
    }) ?? '3-4-3'
  )
}

export function checkDataFormazione(dataIso: string | undefined) {
  return dayjs(dataIso).toDate() >= dayjs(new Date()).toDate()
}


export function getOpponent(giornata: any, player: any) {
  if (!giornata?.SerieA) return null;

  const playerTeam = player.nomeSquadraSerieA?.toLowerCase();

  const match = giornata.SerieA.find(
    (c: any) =>
      c.squadraHome?.toLowerCase().trim() === playerTeam ||
      c.squadraAway?.toLowerCase().trim() === playerTeam
  );

  if (!match) return '';

  return match.squadraHome?.toLowerCase().trim() === playerTeam
    ? match.squadraAway.toLowerCase().trim()
    : match.squadraHome.toUpperCase().trim();
}

export function getMatch(giornata: any, player: any, withSubstring: boolean) {
  if (!giornata?.SerieA) return null;

  const playerTeam = player.nomeSquadraSerieA?.toLowerCase();

  const match = giornata.SerieA.find(
    (c: any) =>
      c.squadraHome?.toLowerCase().trim() === playerTeam ||
      c.squadraAway?.toLowerCase().trim() === playerTeam
  );

  if (!match) return '';

  if (withSubstring)
    return `${match.squadraHome?.trim().substring(0,3) ?? ''} - ${match.squadraAway?.trim().substring(0,3) ?? ''}`;
  else
    return `${match.squadraHome?.trim() ?? ''} - ${match.squadraAway?.trim() ?? ''}`;
}
