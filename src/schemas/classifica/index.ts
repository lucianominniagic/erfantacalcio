import { z } from 'zod'

export const classificaSchema = z.object({
  idSquadra: z.number(),
  squadra: z.string(),
  foto: z.string().nullable(),
  punti: z.number(),
  vinte: z.number(),
  pareggi: z.number(),
  perse: z.number(),
  golFatti: z.number(),
  golSubiti: z.number(),
  differenzaReti: z.number(),
  giocate: z.number(),
  fantapunti: z.number(),
})
