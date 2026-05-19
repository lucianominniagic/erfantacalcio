import { z } from 'zod'

export const statisticheSquadreInputSchema = z.object({
  idTornei: z.array(z.number()),
})

export type StatisticheSquadreInputType = z.infer<typeof statisticheSquadreInputSchema>
