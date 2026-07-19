import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { importaProbabiliFormazioni } from '~/server/api/formazione/services/probabiliFormazioniService'

export const runProbabiliFormazioniORPCProcedure = adminProcedure
  .route({
    method: 'POST',
    path: '/jobs/probabili-formazioni',
    summary: 'Esegue il job di importazione delle probabili formazioni',
  })
  .input(
    z.object({
      bypassFinestraTemporale: z.boolean().optional(),
    }),
  )
  .handler(async ({ input }) =>
    importaProbabiliFormazioni(input.bypassFinestraTemporale),
  )
