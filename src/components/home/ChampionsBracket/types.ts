import { z } from 'zod'
import { giornataSchema } from '~/schemas/calendario'

export type GiornataType = z.infer<typeof giornataSchema>
export type PartitaType = GiornataType['partite'][0]

export const SCORE_COL_W = 44

export interface ChampionsBracketProps {
  titolo: string
  semifinaliAndata: GiornataType | null
  semifinaliRitorno: GiornataType | null
  finale: GiornataType | null
}
