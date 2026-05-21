import { ORPCError } from '@orpc/server'
import { IsNull, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { protectedProcedure } from '~/server/orpc'
import { createPropostaSchema } from '~/schemas/mercato'
import {
  SessioneMercato,
  PropostaMercato,
  Trasferimento,
  Utente,
} from '~/server/db/entities'

export const createPropostaORPCProcedure = protectedProcedure
  .route({ method: 'POST', path: '/mercato/createProposta', summary: 'Crea una proposta di acquisto per un giocatore svincolato' })
  .input(createPropostaSchema)
  .handler(async ({ input, context }) => {
    console.log(
      `Creazione proposta: utente ${context.session.user.id}, giocatore ${input.idGiocatore}, prezzo ${input.prezzoOfferto}`,
    )

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
      throw new ORPCError('NOT_FOUND', { message: 'Nessuna sessione trovata' })
    }

    const now = new Date()
    const isAttiva = sessione.dataApertura <= now && sessione.dataChiusura >= now

    if (!isAttiva) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Nessuna sessione di mercato attiva',
      })
    }

    // 2. Controlla max proposte usando le relazioni già caricate
    const myProposte = (sessione.ProposteMercato ?? []).filter(
      (p) => p.idSquadra === context.session.user.idSquadra && p.deletedAt === null,
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

    // 3. Verifica che il giocatore sia svincolato
    const trasferimento = await Trasferimento.findOne({
      where: { idGiocatore: input.idGiocatore, dataCessione: IsNull() },
    })
    if (trasferimento && trasferimento.idSquadra !== null) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Il giocatore non è svincolato',
      })
    }

    // 4. Controllo budget (solo per sessioni in fantamilioni)
    if (sessione.tipoValuta === 'fantamilioni') {
      const utente = await Utente.findOne({
        where: { idUtente: context.session.user.idSquadra },
      })

      if (utente) {
        const esistenti = await PropostaMercato.find({
          where: {
            idSessione: sessione.id,
            idSquadra: context.session.user.idSquadra,
            deletedAt: IsNull(),
          },
        })
        const totalSpeso = esistenti.reduce(
          (sum, p) => sum + Number(p.prezzoOfferto),
          0,
        )

        if (totalSpeso + input.prezzoOfferto > Number(utente.fantaMilioni)) {
          throw new ORPCError('BAD_REQUEST', {
            message: 'Budget fantamilioni superato',
          })
        }
      }
    }

    // 5. Crea e salva la proposta
    const proposta = PropostaMercato.create({
      idSessione: sessione.id,
      idSquadra: context.session.user.idSquadra,
      idGiocatore: input.idGiocatore,
      prezzoOfferto: input.prezzoOfferto,
      deletedAt: null,
    })

    return await PropostaMercato.save(proposta)
  })
