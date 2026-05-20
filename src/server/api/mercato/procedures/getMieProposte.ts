import { IsNull, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { protectedProcedure } from '~/server/api/trpc'
import { SessioneMercato, PropostaMercato } from '~/server/db/entities'

interface MieProposteCtx {
  session: { user: { id: string; ruolo?: string; idSquadra: number } }
}

export async function getMieProposte({
  ctx,
}: {
  ctx: MieProposteCtx
  input: Record<string, never>
}) {
  const sessione = await SessioneMercato.findOne({
    where: {
      dataApertura: LessThanOrEqual(new Date()),
      dataChiusura: MoreThanOrEqual(new Date())
    },
    order: { id: 'DESC' },
  })

  if (!sessione) return []

  const proposte = await PropostaMercato.find({
    where: {
      idSessione: sessione.id,
      idSquadra: ctx.session.user.idSquadra,
      deletedAt: IsNull(),
    },
    relations: { Giocatore: true },
  })

  return proposte
}

export const getMieProposteProcedure = protectedProcedure.query(({ ctx }) =>
  getMieProposte({ ctx, input: {} }),
)
