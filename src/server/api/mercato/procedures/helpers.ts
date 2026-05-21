import { IsNull, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm'
import { SessioneMercato, PropostaMercato, Trasferimento } from '~/server/db/entities'
import type { GetGiocatoriSvincolatiInput } from '~/schemas/mercato'

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
      dataChiusura: MoreThanOrEqual(new Date()),
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

interface GetSessioneAttivaCtx {
  session: { user: { id: string; ruolo?: string; idSquadra: number } }
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
    order: { id: 'DESC' },
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
    countPerSquadra[p.Utente.nomeSquadra] =
      (countPerSquadra[p.Utente.nomeSquadra] ?? 0) + 1
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

type StatoSessione = 'futura' | 'attiva' | 'chiusa'

function calcolaStato(sessione: SessioneMercato, now: Date): StatoSessione {
  if (sessione.dataApertura > now) return 'futura'
  if (sessione.dataChiusura < now) return 'chiusa'
  return 'attiva'
}

interface GetSessioniMercatoCtx {
  session: { user: { id: string; ruolo?: string; idSquadra: number } }
}

export async function getSessioniMercato({
  ctx: _ctx,
}: {
  ctx: GetSessioniMercatoCtx
  input: Record<string, never>
}) {
  const sessioni = await SessioneMercato.find({
    relations: { ProposteMercato: { Giocatore: true, Utente: true } },
    order: { id: 'DESC', ProposteMercato: { Giocatore: { nome: 'ASC' } } },
  })

  const now = new Date()

  return sessioni.map((s) => {
    const stato = calcolaStato(s, now)

    if (stato === 'chiusa') {
      const proposte = (s.ProposteMercato ?? [])
        .filter((p) => p.deletedAt === null)
        .map((p) => ({
          idGiocatore: p.idGiocatore,
          prezzoOfferto: p.prezzoOfferto,
          idSquadra: p.idSquadra,
          Giocatore: p.Giocatore.nome,
          Presidente: p.Utente.presidente,
        }))

      return {
        id: s.id,
        tipoValuta: s.tipoValuta,
        stato,
        proposte,
      }
    }

    return {
      id: s.id,
      dataApertura: s.dataApertura,
      dataChiusura: s.dataChiusura,
      tipoValuta: s.tipoValuta,
      stato,
    }
  })
}

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
    where: {
      dataCessione: IsNull(),
      idSquadra: IsNull(),
      stagione: input.stagione,
      Giocatore: { ruolo: input.ruolo },
      idSquadraSerieA: Not(IsNull()),
    },
    relations: { Giocatore: true, SquadraSerieA: true },
    order: { Giocatore: { nome: 'ASC' } },
  })

  return svincolati.map((t) => ({
    idGiocatore: t.idGiocatore,
    idTrasferimento: t.idTrasferimento,
    nome: t.Giocatore?.nome,
    ruolo: t.Giocatore?.ruolo,
    stagione: t.stagione,
    nomeSquadraSerieA: t.SquadraSerieA?.nome,
    maglia: t.SquadraSerieA?.maglia
      ? `/images/maglie/${t.SquadraSerieA.maglia}`
      : null,
  }))
}
