import { protectedProcedure } from '~/server/orpc'
import { getProposteAstaInChiaro } from '../services/mercatoService'

export const getProposteAstaInChiaroORPCProcedure = protectedProcedure
  .route({ method: 'GET', path: '/mercato/getProposteAstaInChiaro', summary: 'Stato aste in chiaro della sessione attiva' })
  .handler(async ({ context }) => {
    return getProposteAstaInChiaro({ ctx: context, input: {} })
  })
