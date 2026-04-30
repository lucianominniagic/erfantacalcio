import { Configurazione } from '~/config'
import { StatsA, StatsC, StatsD, StatsP } from '~/server/db/entities'

export type StatsEntity = typeof StatsP | typeof StatsD | typeof StatsC | typeof StatsA

export const roleEntityMap: Record<string, StatsEntity> = {
  P: StatsP,
  D: StatsD,
  C: StatsC,
  A: StatsA,
}

export interface StatsPlayerRaw {
  idgiocatore: number
  maglia: string
  ruolo: string
  nome: string
  nomefantagazzetta?: string | null
  media?: string | null
  mediabonus?: string | null
  golfatti?: string | null
  golsubiti?: string | null
  assist?: string | null
  ammonizioni?: string | null
  espulsioni?: string | null
  giocate?: number | null
  squadraSerieA?: string
  squadra?: string | null
  idSquadra?: number | null
}

export const toClientPlayer = (player: StatsPlayerRaw) => ({
  ...player,
  id: player.idgiocatore,
  maglia: player.maglia ? `/images/maglie/${player.maglia}` : player.maglia,
})

export const getSogliaGiocate = async (): Promise<number> => {
  const maxGiocateRow = await StatsP.createQueryBuilder('s')
    .select('MAX(s.giocate)', 'max')
    .getRawOne<{ max: string | null }>()
  const maxGiocate = Number(maxGiocateRow?.max ?? 0)
  return Math.floor(maxGiocate * (Configurazione.percentualeMinimaGiocate / 100))
}
