import { IsNull, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { protectedProcedure } from '~/server/api/trpc'
import { SessioneMercato, PropostaMercato } from '~/server/db/entities'

interface GetSessioneAttivaCtx {
  session: {
    user: {
      id: string
      ruolo?: string
      idSquadra: number
    }
  }
}

export async function getSessioneAttiva({
  ctx,
}: {
  ctx: GetSessioneAttivaCtx
  input: Record<string, never>
}) {
  const sessione = await SessioneMercato.findOne({
    where: {
      dataApertura: LessThanOrEqual(new Date()),
      dataChiusura: MoreThanOrEqual(new Date()),
    },
    order: { id: 'DESC' }
  })

  if (!sessione) return null

  const proposte = await PropostaMercato.find({
    where: { idSessione: sessione.id, deletedAt: IsNull() },
    relations: { Utente: true },
  })

  const myCount = proposte.filter(
    (p) => p.idSquadra === ctx.session.user.idSquadra,
  ).length

  const countPerSquadra: Record<string, number> = {}
  for (const p of proposte) {
    countPerSquadra[p.Utente.nomeSquadra] = (countPerSquadra[p.Utente.nomeSquadra] ?? 0) + 1
  }

  return {
    id: sessione.id,
    dataApertura: sessione.dataApertura,
    dataChiusura: sessione.dataChiusura,
    maxProposte: sessione.maxProposte,
    tipoValuta: sessione.tipoValuta,
    myCount,
    countPerSquadra,
  }
}

export const getSessioneAttivaProcedure = protectedProcedure.query(
  ({ ctx }) => getSessioneAttiva({ ctx, input: {} }),
)
