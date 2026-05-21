import { protectedProcedure } from '~/server/orpc'
import { getSessioniMercato } from './getSessioniMercato'

export const getSessioniMercatoORPCProcedure = protectedProcedure
  .route({ method: 'GET', path: '/mercato/getSessioniMercato', summary: 'Lista sessioni di mercato con proposte' })
  .handler(async ({ context }) => {
    return getSessioniMercato({ ctx: context, input: {} })
  })
