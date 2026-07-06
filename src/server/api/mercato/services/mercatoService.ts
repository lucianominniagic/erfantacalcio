import { ORPCError } from '@orpc/server'
import { IsNull, LessThanOrEqual, MoreThan, Not } from 'typeorm'
import { env } from 'process'
import { AppDataSource } from '~/data-source'
import { SessioneMercato, PropostaMercato, Trasferimento, Utente, Utenti } from '~/server/db/entities'
import type { CreateSessioneInput, GetGiocatoriSvincolatiInput, CreatePropostaInput, DeletePropostaInput, RiordinaProposteInput, AggiudicaSessioneInput, GetProposteSessioneInput } from '~/schemas/mercato'
import { aggiudica, type PropostaInput } from './aggiudicazione'
import {
  calcolaStato,
  findSessioneAttiva,
} from './sessioneMercatoRepository'
import { ReSendMailAsync } from '~/server/services/mailSender'
import { buildSessioneMercatoCreataHtml } from '~/server/services/mailTemplates'
import { formatDateTime } from '~/utils/dateUtils'

export interface MercatoCtx {
  session: { user: { id: string; ruolo?: string; idSquadra: number } }
}


export async function getMieProposte({ ctx }: { ctx: MercatoCtx; input: Record<string, never> }) {
  const sessione = await findSessioneAttiva()

  if (!sessione) return []

  return PropostaMercato.find({
    where: {
      idSessione: sessione.id,
      idSquadra: ctx.session.user.idSquadra,
      deletedAt: IsNull(),
    },
    order: { priorita: 'ASC' },
    relations: { Giocatore: true },
  })
}

export async function getSessioneAttiva({ ctx }: { ctx: MercatoCtx; input: Record<string, never> }) {
  const sessione = await findSessioneAttiva()

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
    acquistiEffettivi: sessione.acquistiEffettivi,
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
          priorita: p.priorita,
          createdAt: p.createdAt,
          idSquadra: p.idSquadra,
          Giocatore: p.Giocatore.nome,
          Presidente: p.Utente.presidente,
        }))

      return {
        id: s.id,
        tipoValuta: s.tipoValuta,
        maxProposte: s.maxProposte,
        acquistiEffettivi: s.acquistiEffettivi,
        stato,
        proposte,
      }
    }

    return {
      id: s.id,
      dataApertura: s.dataApertura,
      dataChiusura: s.dataChiusura,
      tipoValuta: s.tipoValuta,
      maxProposte: s.maxProposte,
      acquistiEffettivi: s.acquistiEffettivi,
      stato,
    }
  })
}

export async function createSessione({ input }: { input: CreateSessioneInput }) {
  const now = new Date()

  const [esistente] = await SessioneMercato.find({
    order: { id: 'DESC' },
    take: 1,
  })

  if (esistente) {
    const start = esistente.dataApertura
    const end = esistente.dataChiusura
    const inputStart = new Date(input.dataApertura)
    const inputEnd = new Date(input.dataChiusura)

    const isAttiva = start <= now && end >= now
    const isFutura = start > now

    if (isAttiva || isFutura) {
      throw new ORPCError('CONFLICT', {
        message: 'Esiste già una sessione attiva o futura',
      })
    }

    if (inputStart <= end && inputEnd >= start) {
      throw new ORPCError('CONFLICT', {
        message: 'Le date si sovrappongono a una sessione esistente',
      })
    }
  }

  const sessione = SessioneMercato.create({
    dataApertura: new Date(input.dataApertura),
    dataChiusura: new Date(input.dataChiusura),
    maxProposte: input.maxProposte,
    acquistiEffettivi: input.acquistiEffettivi,
    tipoValuta: input.tipoValuta,
  })

  const saved = await SessioneMercato.save(sessione)

  await notificaSessioneMercatoCreata(saved)

  return saved
}

/**
 * Invia una mail a tutti i presidenti (Utenti, admin inclusi) con le
 * informazioni della sessione di mercato appena creata. Invio best-effort:
 * eventuali errori vengono solo loggati, senza impattare la creazione della
 * sessione (già avvenuta con successo a questo punto).
 */
async function notificaSessioneMercatoCreata(sessione: SessioneMercato): Promise<void> {
  const mailEnabled = env.MAIL_ENABLED === 'true'
  if (!mailEnabled) {
    console.info('Mail disabilitata (MAIL_ENABLED != true), skip notifica creazione sessione mercato')
    return
  }

  try {
    const presidenti = await Utenti.find({
      select: { idUtente: true, mail: true, presidente: true },
    })

    const dataApertura = formatDateTime(sessione.dataApertura)
    const dataChiusura = formatDateTime(sessione.dataChiusura)
    const subject = 'ErFantacalcio: Nuova sessione di mercato aperta'

    for (const presidente of presidenti) {
      if (!presidente.mail) continue

      const htmlMessage = buildSessioneMercatoCreataHtml({
        presidente: presidente.presidente,
        dataApertura,
        dataChiusura,
        maxProposte: sessione.maxProposte,
        acquistiEffettivi: sessione.acquistiEffettivi,
        tipoValuta: sessione.tipoValuta,
      })

      await ReSendMailAsync(presidente.mail, presidente.mail, subject, htmlMessage)
    }
  } catch (error) {
    console.error('Errore invio notifica creazione sessione mercato:', error)
  }
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
  const sessione = await findSessioneAttiva()

  if (!sessione) {
    throw new ORPCError('NOT_FOUND', { message: 'Nessuna sessione di mercato attiva' })
  }

  const myProposte = await PropostaMercato.find({
    where: {
      idSessione: sessione.id,
      idSquadra: ctx.session.user.idSquadra,
      deletedAt: IsNull(),
    },
  })

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

  // Calcolo priorità + insert atomico per evitare race condition fra insert
  // concorrenti della stessa squadra. Il partial unique index agisce comunque
  // da rete di sicurezza in caso di concorrenza estrema.
  return AppDataSource.transaction(async (trx) => {
    const attive = await trx.find(PropostaMercato, {
      where: {
        idSessione: sessione.id,
        idSquadra: ctx.session.user.idSquadra,
        deletedAt: IsNull(),
      },
      select: { priorita: true },
    })
    const nextPriorita =
      attive.length === 0
        ? 1
        : attive.reduce((max, p) => Math.max(max, p.priorita), 0) + 1

    const proposta = trx.create(PropostaMercato, {
      idSessione: sessione.id,
      idSquadra: ctx.session.user.idSquadra,
      idGiocatore: input.idGiocatore,
      prezzoOfferto: input.prezzoOfferto,
      priorita: nextPriorita,
      deletedAt: null,
    })

    return trx.save(PropostaMercato, proposta)
  })
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

  // Soft-delete + compatta priorità delle proposte successive (decrement).
  // Avvolto in transazione per garantire atomicità con la compattazione.
  return AppDataSource.transaction(async (trx) => {
    proposta.deletedAt = new Date()
    const saved = await trx.save(PropostaMercato, proposta)

    // Compatta: tutte le proposte attive della squadra nella stessa sessione
    // con priorità > priorità eliminata scendono di 1.
    // Postgres applica il check unique a fine statement, quindi anche se
    // l'ordine è {3→2, 4→3, 5→4} non c'è collisione (la riga 2 originale è
    // uscita dall'index parziale via deleted_at NOT NULL).
    await trx.decrement(
      PropostaMercato,
      {
        idSessione: proposta.idSessione,
        idSquadra: proposta.idSquadra,
        deletedAt: IsNull(),
        priorita: MoreThan(proposta.priorita),
      },
      'priorita',
      1,
    )

    return saved
  })
}

export async function riordinaProposte({
  ctx,
  input,
}: {
  ctx: MercatoCtx
  input: RiordinaProposteInput
}) {
  // Recupera la sessione attiva: il riordino è permesso solo finché la
  // sessione è aperta (altrimenti l'aggiudicazione sarebbe falsificabile).
  const sessione = await findSessioneAttiva()

  if (!sessione) {
    throw new ORPCError('NOT_FOUND', {
      message: 'Nessuna sessione di mercato attiva',
    })
  }

  return AppDataSource.transaction(async (trx) => {
    const attive = await trx.find(PropostaMercato, {
      where: {
        idSessione: sessione.id,
        idSquadra: ctx.session.user.idSquadra,
        deletedAt: IsNull(),
      },
    })

    // L'array in input deve coincidere esattamente con l'insieme delle
    // proposte attive della squadra (stessa lunghezza, stessi id, no duplicati).
    const attiveIds = new Set(attive.map((p) => p.id))
    const inputIds = new Set(input.ordineIdProposte)

    if (input.ordineIdProposte.length !== attive.length) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Numero di proposte da riordinare non coincide',
      })
    }
    if (inputIds.size !== input.ordineIdProposte.length) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Lista contiene id duplicati',
      })
    }
    for (const id of input.ordineIdProposte) {
      if (!attiveIds.has(id)) {
        throw new ORPCError('BAD_REQUEST', {
          message: `Proposta ${id} non appartiene alle tue proposte attive`,
        })
      }
    }

    // Due fasi per evitare violazioni del partial unique index durante una
    // permutazione (es. 1↔2 farebbe collidere temporaneamente).
    // Fase 1: sposta tutte le priorità a valori negativi univoci.
    // Fase 2: assegna i valori finali 1..N nell'ordine richiesto.
    for (let i = 0; i < input.ordineIdProposte.length; i++) {
      const id = input.ordineIdProposte[i]!
      await trx.update(PropostaMercato, { id }, { priorita: -(i + 1) })
    }
    for (let i = 0; i < input.ordineIdProposte.length; i++) {
      const id = input.ordineIdProposte[i]!
      await trx.update(PropostaMercato, { id }, { priorita: i + 1 })
    }

    return trx.find(PropostaMercato, {
      where: {
        idSessione: sessione.id,
        idSquadra: ctx.session.user.idSquadra,
        deletedAt: IsNull(),
      },
      order: { priorita: 'ASC' },
      relations: { Giocatore: true },
    })
  })
}

export async function aggiudicaSessione({
  ctx: _ctx,
  input,
}: {
  ctx: MercatoCtx
  input: AggiudicaSessioneInput
}) {
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

  return buildEsitoSessione(sessione)
}

export async function getEsitoUltimaSessioneChiusa({
  ctx: _ctx,
}: {
  ctx: MercatoCtx
  input: Record<string, never>
}) {
  const sessione = await SessioneMercato.findOne({
    where: { dataChiusura: LessThanOrEqual(new Date()) },
    order: { dataChiusura: 'DESC' },
  })

  if (!sessione) return null

  return buildEsitoSessione(sessione)
}

async function buildEsitoSessione(sessione: SessioneMercato) {
  const proposte = await PropostaMercato.find({
    where: { idSessione: sessione.id, deletedAt: IsNull() },
    relations: { Giocatore: true, Utente: true },
  })

  const algoInput: PropostaInput[] = proposte.map((p) => ({
    idProposta: p.id,
    idSquadra: p.idSquadra,
    idGiocatore: p.idGiocatore,
    prezzoOfferto: Number(p.prezzoOfferto),
    priorita: p.priorita,
    createdAt: new Date(p.createdAt),
  }))

  const esiti = aggiudica({
    acquistiEffettivi: sessione.acquistiEffettivi,
    proposte: algoInput,
  })

  const propostaById = new Map(proposte.map((p) => [p.id, p]))

  const dettaglio = esiti.map((e) => {
    const p = propostaById.get(e.idProposta)!
    return {
      idProposta: e.idProposta,
      idGiocatore: p.idGiocatore,
      nomeGiocatore: p.Giocatore?.nome ?? `#${p.idGiocatore}`,
      idSquadra: p.idSquadra,
      presidente: p.Utente?.presidente ?? `Squadra ${p.idSquadra}`,
      prezzoOfferto: Number(p.prezzoOfferto),
      priorita: p.priorita,
      esito: e.esito,
      motivo: e.motivo,
      vincitoreGiocatore: e.vincitoreGiocatore,
    }
  })

  const perGiocatore = new Map<
    number,
    {
      idGiocatore: number
      nomeGiocatore: string
      vincitore: { idSquadra: number; presidente: string; prezzo: number; priorita: number } | null
      offerte: typeof dettaglio
    }
  >()

  for (const d of dettaglio) {
    const existing = perGiocatore.get(d.idGiocatore) ?? {
      idGiocatore: d.idGiocatore,
      nomeGiocatore: d.nomeGiocatore,
      vincitore: null,
      offerte: [] as typeof dettaglio,
    }
    existing.offerte.push(d)
    if (d.esito === 'VINTA' && d.motivo === 'aggiudicata') {
      existing.vincitore = {
        idSquadra: d.idSquadra,
        presidente: d.presidente,
        prezzo: d.prezzoOfferto,
        priorita: d.priorita,
      }
    }
    perGiocatore.set(d.idGiocatore, existing)
  }

  const giocatori = Array.from(perGiocatore.values()).map((g) => ({
    ...g,
    offerte: g.offerte.sort((a, b) => b.prezzoOfferto - a.prezzoOfferto),
  }))

  return {
    idSessione: sessione.id,
    dataChiusura: sessione.dataChiusura,
    acquistiEffettivi: sessione.acquistiEffettivi,
    maxProposte: sessione.maxProposte,
    tipoValuta: sessione.tipoValuta,
    dettaglio,
    giocatori,
  }
}

export async function listSessioni() {
  const sessioni = await SessioneMercato.find({ order: { id: 'DESC' } })
  const now = new Date()
  return sessioni.map((s) => ({
    id: s.id,
    dataApertura: s.dataApertura,
    dataChiusura: s.dataChiusura,
    maxProposte: s.maxProposte,
    acquistiEffettivi: s.acquistiEffettivi,
    tipoValuta: s.tipoValuta,
    stato: calcolaStato(s, now),
  }))
}

export async function getProposteSessione({ input }: { input: GetProposteSessioneInput }) {
  const sessione = await SessioneMercato.findOne({
    where: { id: input.idSessione },
  })

  if (!sessione) {
    throw new ORPCError('NOT_FOUND', { message: 'Sessione non trovata' })
  }

  if (sessione.dataChiusura >= new Date()) {
    throw new ORPCError('BAD_REQUEST', {
      message: 'La sessione non è ancora chiusa',
    })
  }

  return PropostaMercato.find({
    where: { idSessione: input.idSessione, deletedAt: IsNull() },
    relations: { Utente: true, Giocatore: true },
  })
}
