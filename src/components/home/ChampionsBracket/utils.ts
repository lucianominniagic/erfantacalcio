import { PartitaType } from './types'

/**
 * Finds the ritorno partita matching an andata partita by team IDs.
 * Matches regardless of which team is home/away in the ritorno.
 */
export function findRitorno(
  andataP: PartitaType,
  ritornoPartite: PartitaType[] | undefined,
): PartitaType | undefined {
  return ritornoPartite?.find(
    (r) =>
      (r.idHome === andataP.idHome && r.idAway === andataP.idAway) ||
      (r.idHome === andataP.idAway && r.idAway === andataP.idHome),
  )
}

/**
 * Resolves each team's 2nd-leg goals from the matched ritorno partita.
 * Team A = home in andata. In ritorno they may be home OR away.
 */
export function resolveRitornoGoals(
  andataP: PartitaType,
  ritornoP: PartitaType | undefined,
): { aGol2P: number | null; bGol2P: number | null } {
  if (!ritornoP) return { aGol2P: null, bGol2P: null }
  const teamAIsHomeInRitorno = ritornoP.idHome === andataP.idHome
  return {
    aGol2P: teamAIsHomeInRitorno ? ritornoP.golHome : ritornoP.golAway,
    bGol2P: teamAIsHomeInRitorno ? ritornoP.golAway : ritornoP.golHome,
  }
}

/**
 * Returns true if at least one partita in the array has teams assigned.
 */
export function hasTeams(partite: PartitaType[]): boolean {
  return partite.some((p) => p.idHome !== null || p.idAway !== null)
}
