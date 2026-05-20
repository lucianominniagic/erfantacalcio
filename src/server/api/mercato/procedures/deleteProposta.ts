import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '~/server/api/trpc'
import { deletePropostaSchema } from '~/schemas/mercato'
import { PropostaMercato } from '~/server/db/entities'

interface DeletePropostaCtx {
  session: {
    user: {
      id: string
      ruolo?: string
      idSquadra: number
    }
  }
}

interface DeletePropostaInput {
  idProposta: number
}

export async function deleteProposta({
  ctx,
  input,
}: {
  ctx: DeletePropostaCtx
  input: DeletePropostaInput
}) {
  const proposta = await PropostaMercato.findOne({
    where: { id: input.idProposta },
  })

  if (!proposta) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposta non trovata' })
  }

  if (proposta.idSquadra !== ctx.session.user.idSquadra) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Non puoi eliminare una proposta di un\'altra squadra',
    })
  }

  if (proposta.deletedAt !== null) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'La proposta è già stata eliminata',
    })
  }

  proposta.deletedAt = new Date()
  return await PropostaMercato.save(proposta)
}

export const deletePropostaProcedure = protectedProcedure
  .input(deletePropostaSchema)
  .mutation(({ ctx, input }) => deleteProposta({ ctx, input }))
