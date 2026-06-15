import { ORPCError } from '@orpc/server'
import { IsNull, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm'
import { SessioneMercato, PropostaMercato, Trasferimento, Utente } from '~/server/db/entities'
import type { GetGiocatoriSvincolatiInput, CreatePropostaInput, DeletePropostaInput } from '~/schemas/mercato'

export interface MercatoCtx {
  session: { user: { id: string; ruolo?: string; idSquadra: number } }
}

export type StatoSessione = 'futura' | 'attiva' | 'chiusa'

function calcolaStato(sessione: SessioneMercato, now: Date): StatoSessione {
  if (sessione.dataApertura > now) return 'futura'
  if (sessione.dataChiusura < now) return 'chiusa'
  return 'attiva'
}

export async function getMieProposte({ ctx }: { ctx: MercatoCtx; input: Record<string, never> }) {
  const sessione = await SessioneMercato.findOne({
    where: {
      dataApertura: LessThanOrEqual(new Date()),
      dataChiusura: MoreThanOrEqual(new Date()),
    },
    order: { id: 'DESC' },
  })

  if (!sessione) return []

  return PropostaMercato.find({
    where: {
      idSessione: sessione.id,
      idSquadra: ctx.session.user.idSquadra,
      deletedAt: IsNull(),
    },
    order: { createdAt: 'ASC' },
    relations: { Giocatore: true },
  })
}

export async function getSessioneAttiva({ ctx }: { ctx: MercatoCtx; input: Record<string, never> }) {
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

export async function getSessioniMercato({ ctx: _ctx }: { ctx: MercatoCtx; input: Record<string, never> }) {
  const sessioni = await SessioneMercato.find({
    relations: { ProposteMercato: { Giocatore: true, Utente: true } },
    order: { id: 'DESC', ProposteMercato: { Giocatore: { nome: 'ASC' }, prezzoOfferto: 'DESC', createdAt: 'ASC' } },
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
          createdAt: p.createdAt,
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

export async function getGiocatoriSvincolati({
  ctx: _ctx,
  input,
}: {
  ctx: MercatoCtx
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

export async function createProposta({
  ctx,
  input,
}: {
  ctx: MercatoCtx
  input: CreatePropostaInput
}) {
  const sessione = await SessioneMercato.findOne({
    where: {
      dataApertura: LessThanOrEqual(new Date()),
      dataChiusura: MoreThanOrEqual(new Date()),
    },
    relations: { ProposteMercato: true },
    order: { id: 'DESC' },
  })

  if (!sessione) {
    throw new ORPCError('NOT_FOUND', { message: 'Nessuna sessione trovata' })
  }

  const now = new Date()
  const isAttiva = sessione.dataApertura <= now && sessione.dataChiusura >= now

  if (!isAttiva) {
    throw new ORPCError('NOT_FOUND', { message: 'Nessuna sessione di mercato attiva' })
  }

  const myProposte = (sessione.ProposteMercato ?? []).filter(
    (p) => p.idSquadra === ctx.session.user.idSquadra && p.deletedAt === null,
  )

  if (myProposte.length >= sessione.maxProposte) {
    throw new ORPCError('BAD_REQUEST', {
      message: `Hai già raggiunto il massimo di ${sessione.maxProposte} proposte`,
    })
  }

  if (myProposte.some((p) => p.idGiocatore === input.idGiocatore)) {
    throw new ORPCError('BAD_REQUEST', {
      message: "Hai già fatto un'offerta per questo giocatore",
    })
  }

  const trasferimento = await Trasferimento.findOne({
    where: { idGiocatore: input.idGiocatore, dataCessione: IsNull() },
  })
  if (trasferimento && trasferimento.idSquadra !== null) {
    throw new ORPCError('BAD_REQUEST', { message: 'Il giocatore non è svincolato' })
  }

  if (sessione.tipoValuta === 'fantamilioni') {
    const utente = await Utente.findOne({
      where: { idUtente: ctx.session.user.idSquadra },
    })

    if (utente) {
      const esistenti = await PropostaMercato.find({
        where: {
          idSessione: sessione.id,
          idSquadra: ctx.session.user.idSquadra,
          deletedAt: IsNull(),
        },
      })
      const totalSpeso = esistenti.reduce((sum, p) => sum + Number(p.prezzoOfferto), 0)

      if (totalSpeso + input.prezzoOfferto > Number(utente.fantaMilioni)) {
        throw new ORPCError('BAD_REQUEST', { message: 'Budget fantamilioni superato' })
      }
    }
  }

  const proposta = PropostaMercato.create({
    idSessione: sessione.id,
    idSquadra: ctx.session.user.idSquadra,
    idGiocatore: input.idGiocatore,
    prezzoOfferto: input.prezzoOfferto,
    deletedAt: null,
  })

  return PropostaMercato.save(proposta)
}

export async function deleteProposta({
  ctx,
  input,
}: {
  ctx: MercatoCtx
  input: DeletePropostaInput
}) {
  const proposta = await PropostaMercato.findOne({
    where: { id: input.idProposta },
  })

  if (!proposta) {
    throw new ORPCError('NOT_FOUND', { message: 'Proposta non trovata' })
  }

  if (proposta.idSquadra !== ctx.session.user.idSquadra) {
    throw new ORPCError('FORBIDDEN', {
      message: "Non puoi eliminare una proposta di un'altra squadra",
    })
  }

  if (proposta.deletedAt !== null) {
    throw new ORPCError('BAD_REQUEST', { message: 'La proposta è già stata eliminata' })
  }

  proposta.deletedAt = new Date()
  return PropostaMercato.save(proposta)
}
