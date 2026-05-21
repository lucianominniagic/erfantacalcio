import { protectedProcedure } from '~/server/orpc'
import { getMieProposte } from './helpers'

export const getMieProposteORPCProcedure = protectedProcedure
  .route({ method: 'GET', path: '/mercato/getMieProposte', summary: 'Recupera le proposte di mercato dell\'utente corrente' })
  .handler(async ({ context }) => {
    return getMieProposte({ ctx: context, input: {} })
  })
