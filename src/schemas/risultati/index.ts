import { z } from 'zod'

export const tabellinoInputSchema = z.object({
  idPartita: z.number(),
  idSquadra: z.number().nullable(),
})

export type TabellinoInputType = z.infer<typeof tabellinoInputSchema>
