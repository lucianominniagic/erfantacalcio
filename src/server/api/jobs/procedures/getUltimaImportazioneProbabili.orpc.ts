import { adminProcedure } from '~/server/orpc'
import { ProbabileFormazione } from '~/server/db/entities'

export const getUltimaImportazioneProbabiliORPCProcedure = adminProcedure
  .route({
    method: 'GET',
    path: '/jobs/probabili-formazioni/ultima-importazione',
    summary: 'Restituisce data e ora dell’ultima importazione delle probabili formazioni',
  })
  .handler(async () => {
    const ultimaImportazione = await ProbabileFormazione.findOne({
      select: { fetchedAt: true },
      order: { fetchedAt: 'DESC' },
    })

    return {
      fetchedAt: ultimaImportazione?.fetchedAt.toISOString() ?? null,
    }
  })
