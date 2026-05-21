import { ORPCError } from '@orpc/server'
import { IsNull } from 'typeorm'
import { adminProcedure } from '~/server/orpc'
import { getProposteSessioneSchema } from '~/schemas/mercato'
import { SessioneMercato, PropostaMercato } from '~/server/db/entities'

export const getProposteSessioneORPCProcedure = adminProcedure
  .route({ method: 'GET', path: '/mercato/getProposteSessione', summary: 'Recupera le proposte di una sessione chiusa (admin)' })
  .input(getProposteSessioneSchema)
  .handler(async ({ input }) => {
    console.log(`getProposteSessioneORPCProcedure called with idSessione: ${input.idSessione}`)
    const sessione = await SessioneMercato.findOne({
      where: { id: input.idSessione },
    })

    if (!sessione) {
      throw new ORPCError('NOT_FOUND', { message: 'Sessione non trovata' })
    }

    const now = new Date()
    if (sessione.dataChiusura >= now) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'La sessione non è ancora chiusa',
      })
    }

    const proposte = await PropostaMercato.find({
      where: { idSessione: input.idSessione, deletedAt: IsNull() },
      relations: { Utente: true, Giocatore: true },
    })

    return proposte
  })
