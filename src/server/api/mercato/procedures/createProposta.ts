import { TRPCError } from '@trpc/server'
import { IsNull, LessThanOrEqual, MoreThanOrEqual   } from 'typeorm'
import { protectedProcedure } from '~/server/api/trpc'
import { createPropostaSchema } from '~/schemas/mercato'
import {
  SessioneMercato,
  PropostaMercato,
  Trasferimento,
  Utente,
} from '~/server/db/entities'

interface CreatePropostaCtx {
  session: {
    user: {
      id: string
      ruolo?: string
      idSquadra: number
    }
  }
}

interface CreatePropostaInput {
  idGiocatore: number
  prezzoOfferto: number
}

export async function createProposta({
  ctx,
  input,
}: {
  ctx: CreatePropostaCtx
  input: CreatePropostaInput
}) {
  console.log(`Creazione proposta: utente ${ctx.session.user.id}, giocatore ${input.idGiocatore}, prezzo ${input.prezzoOfferto}`)
  // 1. Trova la sessione (con proposte caricate per la verifica maxProposte)
  const sessione = await SessioneMercato.findOne({
    where: {
      dataApertura: LessThanOrEqual(new Date()),
      dataChiusura: MoreThanOrEqual(new Date()),
    },
    relations: { ProposteMercato: true },
    order: { id: 'DESC' },
  })

  if (!sessione) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Nessuna sessione trovata' })
  }

  const now = new Date()
  const isAttiva = sessione.dataApertura <= now && sessione.dataChiusura >= now

  if (!isAttiva) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Nessuna sessione di mercato attiva',
    })
  }

  // 2. Controlla max proposte usando le relazioni già caricate
  const myProposte = (sessione.ProposteMercato ?? []).filter(
    (p) => p.idSquadra === ctx.session.user.idSquadra && p.deletedAt === null,
  )

  if (myProposte.length >= sessione.maxProposte) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Hai già raggiunto il massimo di ${sessione.maxProposte} proposte`,
    })
  }

  if (myProposte.some((p) => p.idGiocatore === input.idGiocatore)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Hai già fatto un\'offerta per questo giocatore',
    })
  }

  // 3. Verifica che il giocatore sia svincolato
  const trasferimento = await Trasferimento.findOne({
    where: { idGiocatore: input.idGiocatore, dataCessione: IsNull() },
  })
  // Il giocatore è non-svincolato se ha un trasferimento attivo con squadra assegnata
  if (trasferimento && trasferimento.idSquadra !== null) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Il giocatore non è svincolato',
    })
  }

  // 4. Controllo budget (solo per sessioni in fantamilioni)
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
      const totalSpeso = esistenti.reduce(
        (sum, p) => sum + Number(p.prezzoOfferto),
        0,
      )

      if (totalSpeso + input.prezzoOfferto > Number(utente.fantaMilioni)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Budget fantamilioni superato',
        })
      }
    }
  }

  // 5. Crea e salva la proposta
  const proposta = PropostaMercato.create({
    idSessione: sessione.id,
    idSquadra: ctx.session.user.idSquadra,
    idGiocatore: input.idGiocatore,
    prezzoOfferto: input.prezzoOfferto,
    deletedAt: null,
  })

  return await PropostaMercato.save(proposta)
}

export const createPropostaProcedure = protectedProcedure
  .input(createPropostaSchema)
  .mutation(({ ctx, input }) => createProposta({ ctx, input }))
