import { z } from 'zod'
import { protectedProcedure } from '~/server/orpc'
import { getEsitoUltimaSessioneChiusa } from '../services/mercatoService'

export const getEsitoUltimaSessioneChiusaORPCProcedure = protectedProcedure
  .route({
    method: 'GET',
    path: '/mercato/getEsitoUltimaSessioneChiusa',
    summary:
      "Restituisce l'esito dell'aggiudicazione della sessione di mercato chiusa più recente (visibile a tutti gli utenti autenticati)",
  })
  .input(z.object({}))
  .handler(async ({ context }) => {
    return getEsitoUltimaSessioneChiusa({ ctx: context, input: {} })
  })
