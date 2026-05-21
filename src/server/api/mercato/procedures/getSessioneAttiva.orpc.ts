import { protectedProcedure } from '~/server/orpc'
import { getSessioneAttiva } from './getSessioneAttiva'

export const getSessioneAttivaORPCProcedure = protectedProcedure
  .route({ method: 'GET', path: '/mercato/getSessioneAttiva', summary: 'Recupera la sessione di mercato attiva' })
  .handler(async ({ context }) => {
    return getSessioneAttiva({ ctx: context, input: {} })
  })
