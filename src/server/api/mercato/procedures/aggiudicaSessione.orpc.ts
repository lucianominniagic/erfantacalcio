import { adminProcedure } from '~/server/orpc'
import { aggiudicaSessioneSchema } from '~/schemas/mercato'
import { aggiudicaSessione } from '../services/mercatoService'

export const aggiudicaSessioneORPCProcedure = adminProcedure
  .route({
    method: 'GET',
    path: '/mercato/aggiudicaSessione',
    summary:
      "Calcola l'esito dell'aggiudicazione di una sessione chiusa (sola lettura: non scrive Trasferimenti)",
  })
  .input(aggiudicaSessioneSchema)
  .handler(async ({ input, context }) => {
    return aggiudicaSessione({ ctx: context, input })
  })
