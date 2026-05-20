import { TRPCError } from '@trpc/server'
import { IsNull } from 'typeorm'
import { adminProcedure } from '~/server/api/trpc'
import { getProposteSessioneSchema } from '~/schemas/mercato'
import { SessioneMercato, PropostaMercato } from '~/server/db/entities'

export const getProposteSessioneProcedure = adminProcedure
  .input(getProposteSessioneSchema)
  .query(async ({ input }) => {
    console.log(`getProposteSessioneProcedure called with idSessione: ${input.idSessione}`)
    const sessione = await SessioneMercato.findOne({
      where: { id: input.idSessione },
    })

    if (!sessione) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Sessione non trovata' })
    }

    const now = new Date()
    if (sessione.dataChiusura >= now) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'La sessione non è ancora chiusa',
      })
    }

    const proposte = await PropostaMercato.find({
      where: { idSessione: input.idSessione, deletedAt: IsNull() },
      relations: { Utente: true, Giocatore: true },
    })

    return proposte
  })
