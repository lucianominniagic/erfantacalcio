import { protectedProcedure } from '~/server/orpc'
import { getGiocatoriSvincolatiSchema } from '~/schemas/mercato'
import { getGiocatoriSvincolati } from './helpers'

export const getGiocatoriSvincolatiORPCProcedure = protectedProcedure
  .route({ method: 'GET', path: '/mercato/getGiocatoriSvincolati', summary: 'Lista giocatori svincolati disponibili al mercato' })
  .input(getGiocatoriSvincolatiSchema)
  .handler(async ({ input, context }) => {
    return getGiocatoriSvincolati({ ctx: context, input })
  })
