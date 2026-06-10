import { protectedProcedure } from '~/server/orpc'
import { deletePropostaSchema } from '~/schemas/mercato'
import { deleteProposta } from '../services/mercatoService'

export const deletePropostaORPCProcedure = protectedProcedure
  .route({ method: 'POST', path: '/mercato/deleteProposta', summary: 'Elimina una proposta di mercato' })
  .input(deletePropostaSchema)
  .handler(async ({ input, context }) => {
    return deleteProposta({ ctx: context, input })
  })
