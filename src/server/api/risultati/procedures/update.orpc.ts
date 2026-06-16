import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { registraEsito } from '../services/registraEsitoService'

export const updateRisultatiORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/risultati/update', summary: 'Aggiorna risultati di una partita' })
  .input(
    z.object({
      idPartita: z.number(),
      escludi: z.boolean(),
      golHome: z.number().min(0).max(10),
      golAway: z.number().min(0).max(10),
      fantapuntiHome: z.number().min(0).max(120),
      fantapuntiAway: z.number().min(0).max(120),
      multaHome: z.boolean(),
      multaAway: z.boolean(),
    }),
  )
  .handler(async ({ input }) => {
    await registraEsito(input)
  })
