import { ORPCError } from '@orpc/server'
import { protectedProcedure } from '~/server/orpc'
import { deletePropostaSchema } from '~/schemas/mercato'
import { PropostaMercato } from '~/server/db/entities'

export const deletePropostaORPCProcedure = protectedProcedure
  .route({ method: 'POST', path: '/mercato/deleteProposta', summary: 'Elimina una proposta di mercato' })
  .input(deletePropostaSchema)
  .handler(async ({ input, context }) => {
    const proposta = await PropostaMercato.findOne({
      where: { id: input.idProposta },
    })

    if (!proposta) {
      throw new ORPCError('NOT_FOUND', { message: 'Proposta non trovata' })
    }

    if (proposta.idSquadra !== context.session.user.idSquadra) {
      throw new ORPCError('FORBIDDEN', {
        message: "Non puoi eliminare una proposta di un'altra squadra",
      })
    }

    if (proposta.deletedAt !== null) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'La proposta è già stata eliminata',
      })
    }

    proposta.deletedAt = new Date()
    return await PropostaMercato.save(proposta)
  })
