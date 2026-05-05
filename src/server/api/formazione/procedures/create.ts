import { protectedProcedure } from '../../trpc'
import { z } from 'zod'
import { formatDateTime, nowInItalyIso } from '~/utils/dateUtils'
import { ReSendMailAsync } from '~/service/mailSender'
import { env } from 'process'
import { Formazioni, Partite, Voti } from '~/server/db/entities'
import { AppDataSource } from '~/data-source'
import { In } from 'typeorm'
import { getDescrizioneGiornata } from '~/utils/helper'

export const create = protectedProcedure
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
  .mutation(async (opts) => {
    const idSquadra = opts.ctx.session.user.idSquadra
    const idPartita = +opts.input.idPartita
    const modulo = opts.input.modulo
    const giocatori = opts.input.giocatori

    try {
      await AppDataSource.transaction(async (trx) => {
        const formazioniIds = await trx.find(Formazioni, {
          select: { idFormazione: true },
          where: { idPartita: idPartita, idSquadra: idSquadra },
        })
        await trx.delete(Voti, {
          idFormazione: In(formazioniIds.map((f) => f.idFormazione)),
        })
        await trx.delete(Formazioni, {
          idPartita: idPartita,
          idSquadra: idSquadra,
        })

        console.log(
          `Eliminazione voti e formazioni idPartita: ${idPartita} e idSquadra: ${idSquadra}`,
        )

        const partita = await trx.findOne(Partite, {
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
        console.log(
          `recupero idCalendario:${partita?.idCalendario} per idPartita: ${idPartita}`,
        )

        const dataInserimentoFormazione = nowInItalyIso()
        const formazione = await trx.insert(Formazioni, {
          idPartita: idPartita,
          idSquadra: idSquadra,
          modulo: modulo,
          dataOra: dataInserimentoFormazione,
          hasBloccata: false,
        })
        console.log(
          `Creazione nuova formazione`,
          formazione.identifiers[0].idFormazione,
        )
        const idFormazione = formazione.identifiers[0].idFormazione

        if (partita) {
          await Promise.all(
            giocatori.map(async (c) => {
              await trx.insert(Voti, {
                idGiocatore: c.idGiocatore,
                idCalendario: partita.idCalendario,
                idFormazione: idFormazione,
                titolare: c.titolare,
                riserva: c.riserva,
                voto: 0,
              })
            }),
          )
          console.log(
            `Inseriti giocatori in tabella voti con idFormazione: ${idFormazione}`,
          )

          //invio mail
          const mailEnabled = env.MAIL_ENABLED === 'true'
          if (mailEnabled) {
            console.log(`Invio notifica mail inserimento formazione`)
            const subject = `ErFantacalcio: Formazione partita ${partita.SquadraHome?.nomeSquadra} - ${partita.SquadraAway?.nomeSquadra}`
            const avversario =
              idSquadra === partita.SquadraHome?.idUtente
                ? partita.SquadraHome?.presidente
                : partita.SquadraAway?.presidente
            const to =
              idSquadra === partita.SquadraHome?.idUtente
                ? partita.SquadraAway?.mail
                : partita.SquadraHome?.mail
            const cc =
              idSquadra === partita.SquadraHome?.idUtente
                ? partita.SquadraHome?.mail
                : partita.SquadraAway?.mail

            const descrizioneGiornata = getDescrizioneGiornata(
              partita.Calendario.giornataSerieA,
              partita.Calendario.Torneo.nome,
              partita.Calendario.giornata,
              partita.Calendario.Torneo.gruppoFase,
            )
            const htmlMessage = `Notifica automatica da erFantacalcio.com<br><br>
              Il tuo avversario, l'infame ${avversario}, ha inserito la formazione per la prossima partita <br> <br>
              <b>Dettagli partita:</b><br>
              Giornata: ${descrizioneGiornata}<br>
              Data inserimento formazione: ${formatDateTime(dataInserimentoFormazione)}<br>
              Calcio d'inizio: ${formatDateTime(partita.Calendario.data ?? new Date())}<br> <br>
              https://www.erfantacalcio.com <br> <br>
              Saluti dal Vostro immenso Presidente`

            if (to && cc) await ReSendMailAsync(to, cc, subject, htmlMessage)
            else {
              const presidenteWithoutMail =
                idSquadra === partita.SquadraHome?.idUtente
                  ? partita.SquadraAway?.presidente
                  : partita.SquadraHome?.presidente
              console.warn(
                `Impossibile inviare notifica, mail non configurata per il presidente: ${presidenteWithoutMail}`,
              )
            }
          }
        } else {
          console.warn(
            `Calendario non trovato, impossibile procedere con l'inserimento della formazione`,
          )
        }
      })
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
