import { z } from 'zod'
import { protectedProcedure } from '~/server/orpc'
import { formatDateTime, nowInItalyIso } from '~/utils/dateUtils'
import { ReSendMailAsync } from '~/server/services/mailSender'
import { env } from 'process'
import { Partite } from '~/server/db/entities'
import { getDescrizioneGiornata } from '~/utils/helper'
import { buildFormazioneCreatedHtml, resolveFormazioneMailRecipients } from '~/server/services/mailTemplates'
import { scriviFormazione } from '~/server/services/scriviFormazione'

export const createFormazioneORPCProcedure = protectedProcedure
  .route({ method: 'POST', path: '/formazione/create', summary: 'Inserisci formazione per una partita' })
  .input(
    z.object({
      idPartita: z.number(),
      modulo: z.string(),
      giocatori: z.array(
        z.object({
          idGiocatore: z.number(),
          titolare: z.boolean(),
          riserva: z.number().nullable().optional(),
        }),
      ),
    }),
  )
  .handler(async ({ input, context }) => {
    const idSquadra = context.session.user.idSquadra
    const idPartita = +input.idPartita
    const modulo = input.modulo
    const giocatori = input.giocatori

    // 1. Carica partita (per idCalendario + mail routing)
    const partita = await Partite.findOne({
      select: {
        idCalendario: true,
        idPartita: true,
        SquadraHome: {
          nomeSquadra: true,
          presidente: true,
          idUtente: true,
          mail: true,
        },
        SquadraAway: {
          nomeSquadra: true,
          presidente: true,
          idUtente: true,
          mail: true,
        },
        Calendario: {
          idCalendario: true,
          giornata: true,
          giornataSerieA: true,
          data: true,
          girone: true,
          Torneo: {
            idTorneo: true,
            nome: true,
            gruppoFase: true,
          },
        },
      },
      relations: {
        Calendario: { Torneo: true },
        SquadraHome: true,
        SquadraAway: true,
      },
      where: { idPartita: idPartita },
    })

    if (!partita) {
      console.warn(
        `Partita non trovata, impossibile procedere con l'inserimento della formazione per idPartita: ${idPartita}`,
      )
      return
    }

    console.log(
      `Recuperato idCalendario:${partita.idCalendario} per idPartita: ${idPartita}`,
    )

    // 2. Scrivi la formazione (transazione interna)
    const dataInserimentoFormazione = nowInItalyIso()
    await scriviFormazione({
      idPartita,
      idSquadra,
      idCalendario: partita.idCalendario,
      modulo,
      giocatori,
    })

    // 3. Invia mail
    const mailEnabled = env.MAIL_ENABLED === 'true'
    if (mailEnabled) {
      console.log(`Invio notifica mail inserimento formazione`)
      const { to, cc, avversario } = resolveFormazioneMailRecipients(partita, idSquadra)
      const subject = `ErFantacalcio: Formazione partita ${partita.SquadraHome?.nomeSquadra} - ${partita.SquadraAway?.nomeSquadra}`
      const descrizioneGiornata = getDescrizioneGiornata(
        partita.Calendario.giornataSerieA,
        partita.Calendario.Torneo.nome,
        partita.Calendario.giornata,
        partita.Calendario.Torneo.gruppoFase,
      )
      const htmlMessage = buildFormazioneCreatedHtml({
        avversarioPresidente: avversario,
        descrizioneGiornata,
        dataInserimentoFormazione: formatDateTime(dataInserimentoFormazione),
        dataCalcioInizio: formatDateTime(partita.Calendario.data ?? new Date()),
      })

      if (to && cc) await ReSendMailAsync(to, cc, subject, htmlMessage)
      else {
        console.warn(
          `Impossibile inviare notifica, mail non configurata per il presidente avversario`,
        )
      }
    }
  })
