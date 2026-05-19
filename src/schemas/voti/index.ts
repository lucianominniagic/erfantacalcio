import { z } from 'zod'
import { uploadVotoGiocatoreSchema } from '~/schemas/giocatore'

export const processVotiInputSchema = z.object({
  idCalendario: z.number(),
  votiGiocatori: z.array(uploadVotoGiocatoreSchema),
})

export type ProcessVotiInputType = z.infer<typeof processVotiInputSchema>
