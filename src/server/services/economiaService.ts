export interface SquadraEconomiaInput {
  id: number
  importoAnnuale: number | null
  importoMulte: number | null
  importoMercato: number | null
  isAdmin?: boolean
}

export interface CalcolaEconomiaInput {
  montepremi: number
  classificaMap: Record<number, number>
  idVincitriceChampions: number | null
  squadre: SquadraEconomiaInput[]
}

export interface PremiStagionali {
  primo: number
  secondo: number
  terzo: number
  champions: number
}

export interface PremiVinto {
  label: string
  color: 'warning' | 'info' | 'default'
}

export interface SquadraCalcolata {
  id: number
  pagato: number
  premio: number
  premiVinti: PremiVinto[]
  saldo: number
}

export interface CalcolaEconomiaOutput {
  premi: PremiStagionali
  squadreCalcolate: SquadraCalcolata[]
}

const PERC_PRIMO = 52
const PERC_SECONDO = 20
const PERC_TERZO = 13
const PERC_CHAMPIONS = 15

export function calcolaEconomia(input: CalcolaEconomiaInput): CalcolaEconomiaOutput {
  const { montepremi, classificaMap, idVincitriceChampions, squadre } = input

  const premi: PremiStagionali = {
    primo: Math.round((montepremi * PERC_PRIMO) / 100),
    secondo: Math.round((montepremi * PERC_SECONDO) / 100),
    terzo: Math.round((montepremi * PERC_TERZO) / 100),
    champions: Math.round((montepremi * PERC_CHAMPIONS) / 100),
  }

  const squadreCalcolate: SquadraCalcolata[] = squadre.map((squadra) => {
    const pagato =
      (squadra.importoAnnuale ?? 0) +
      (squadra.importoMulte ?? 0) +
      (squadra.importoMercato ?? 0)

    const pos = classificaMap[squadra.id]
    const isChampions = idVincitriceChampions === squadra.id

    let premio = 0
    const premiVinti: PremiVinto[] = []

    if (pos === 1) {
      premio += Math.round((montepremi * PERC_PRIMO) / 100)
      premiVinti.push({ label: '1° Classificato', color: 'warning' })
    }
    if (pos === 2) {
      premio += Math.round((montepremi * PERC_SECONDO) / 100)
      premiVinti.push({ label: '2° Classificato', color: 'default' })
    }
    if (pos === 3) {
      premio += Math.round((montepremi * PERC_TERZO) / 100)
      premiVinti.push({ label: '3° Classificato', color: 'default' })
    }
    if (isChampions) {
      premio += Math.round((montepremi * PERC_CHAMPIONS) / 100)
      premiVinti.push({ label: 'Vincitore Champions', color: 'info' })
    }

    return {
      id: squadra.id,
      pagato,
      premio,
      premiVinti,
      saldo: premio - pagato,
    }
  })

  squadreCalcolate.sort((a, b) => b.premio - a.premio)

  return { premi, squadreCalcolate }
}
