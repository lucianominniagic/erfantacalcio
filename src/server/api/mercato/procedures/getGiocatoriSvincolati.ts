import { IsNull, Not } from 'typeorm'
import { protectedProcedure } from '~/server/api/trpc'
import { Trasferimento } from '~/server/db/entities'
import { getGiocatoriSvincolatiSchema, type GetGiocatoriSvincolatiInput } from '~/schemas/mercato'

interface SvincolatiCtx {
  session: { user: { id: string; ruolo?: string; idSquadra: number } }
}

export async function getGiocatoriSvincolati({
  ctx: _ctx,
  input,
}: {
  ctx: SvincolatiCtx
  input: GetGiocatoriSvincolatiInput
}) {
  const svincolati = await Trasferimento.find({
    where: { dataCessione: IsNull(), idSquadra: IsNull(), stagione: input.stagione, Giocatore: { ruolo: input.ruolo }, idSquadraSerieA: Not(IsNull()) },
    relations: { Giocatore: true, SquadraSerieA: true },
    order: { Giocatore: { nome: 'ASC' } },
  })

  return svincolati.map((t) => ({
    idGiocatore: t.idGiocatore,
    idTrasferimento: t.idTrasferimento,
    nome: t.Giocatore?.nome,
    ruolo: t.Giocatore?.ruolo,
    costo: t.costo,
    stagione: t.stagione,
    nomeSquadraSerieA: t.SquadraSerieA?.nome,
    maglia: t.SquadraSerieA?.maglia ? `/images/maglie/${t.SquadraSerieA.maglia}` : null,
  }))
}

export const getGiocatoriSvincolatiProcedure = protectedProcedure
  .input(getGiocatoriSvincolatiSchema)
  .query(({ ctx, input }) => getGiocatoriSvincolati({ ctx, input }))
