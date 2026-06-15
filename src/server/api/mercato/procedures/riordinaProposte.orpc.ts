import { protectedProcedure } from '~/server/orpc'
import { riordinaProposteSchema } from '~/schemas/mercato'
import { riordinaProposte } from '../services/mercatoService'

export const riordinaProposteORPCProcedure = protectedProcedure
  .route({
    method: 'POST',
    path: '/mercato/riordinaProposte',
    summary: 'Riordina le proprie proposte (drag-and-drop) ricalcolando le priorità',
  })
  .input(riordinaProposteSchema)
  .handler(async ({ input, context }) => {
    return riordinaProposte({ ctx: context, input })
  })
