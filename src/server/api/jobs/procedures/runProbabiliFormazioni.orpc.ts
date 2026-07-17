import { adminProcedure } from '~/server/orpc'
import { importaProbabiliFormazioni } from '~/server/api/formazione/services/probabiliFormazioniService'

export const runProbabiliFormazioniORPCProcedure = adminProcedure
  .route({
    method: 'POST',
    path: '/jobs/probabili-formazioni',
    summary: 'Esegue il job di importazione delle probabili formazioni',
  })
  .handler(async () => importaProbabiliFormazioni())
