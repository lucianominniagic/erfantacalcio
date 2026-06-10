import { protectedProcedure } from '~/server/orpc'
import { createPropostaSchema } from '~/schemas/mercato'
import { createProposta } from '../services/mercatoService'

export const createPropostaORPCProcedure = protectedProcedure
  .route({ method: 'POST', path: '/mercato/createProposta', summary: 'Crea una proposta di acquisto per un giocatore svincolato' })
  .input(createPropostaSchema)
  .handler(async ({ input, context }) => {
    return createProposta({ ctx: context, input })
  })
