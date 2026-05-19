import { TRPCError } from '@trpc/server'
import { In, Not } from 'typeorm'
import { env } from 'process'

import { protectedProcedure } from '../../trpc'
import { Formazioni, Partite, Utenti } from '~/server/db/entities'
import {
  getProssimaGiornata,
  getProssimaGiornataSerieA,
} from '~/server/utils/common'
import { ReSendMailAsync } from '~/service/mailSender'
import { formatDateTime, nowInItalyIso } from '~/utils/dateUtils'
import { getDescrizioneGiornata } from '~/utils/helper'
import { Configurazione } from '~/config'
import {
  buildConfermaPrecedenteHtml,
  buildConfermaPrecedenteAdminHtml,
} from '~/server/services/mailTemplates'
import { scriviFormazione } from '~/server/services/scriviFormazione'

export const confirmPrecedente = protectedProcedure.mutation(async (opts) => {
  const idSquadra = opts.ctx.session.user.idSquadra

  // 1. Recupera le giornate correnti e filtra per l'utente
  const giornataSerieA = await getProssimaGiornataSerieA(false, 'asc')
  const prossimeGiornate = await getProssimaGiornata(giornataSerieA, true)
  const giornateFiltrate = prossimeGiornate.filter((giornata) =>
    giornata.partite.some(
      (partita) => partita.idHome === idSquadra || partita.idAway === idSquadra,
    ),
  )

  // 2. Calcola gli idPartita correnti dell'utente
  const idPartiteCorrente: number[] = giornateFiltrate.flatMap((giornata) =>
    giornata.partite
      .filter(
        (partita) =>
          partita.idHome === idSquadra || partita.idAway === idSquadra,
      )
      .map((partita) => partita.idPartita),
  )

  // 2b. Verifica che l'utente non abbia già una formazione per le partite correnti
  const formazioniEsistenti = await Formazioni.count({
    where: { idSquadra: idSquadra, idPartita: In(idPartiteCorrente) },
  })
  if (formazioniEsistenti > 0) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'Hai già inserito la formazione per questa giornata',
    })
  }

  // 3. Recupera l'ultima formazione precedente (escludendo le partite correnti)
  const lastFormazione = await Formazioni.findOne({
    where: {
      idSquadra: idSquadra,
      idPartita: Not(In(idPartiteCorrente)),
    },
    order: { dataOra: 'DESC' },
    relations: { Voti: true },
  })

  if (!lastFormazione) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Nessuna formazione precedente trovata',
    })
  }

  // 4. Per ogni partita corrente, replica la formazione precedente in transazione
  const partiteConDettagli: {
    partita: Partite
    descrizioneGiornata: string
  }[] = []

  for (const idPartita of idPartiteCorrente) {
    // Carica partita (per idCalendario + dettagli mail)
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
          Torneo: { idTorneo: true, nome: true, gruppoFase: true },
        },
      },
      relations: {
        Calendario: { Torneo: true },
        SquadraHome: true,
        SquadraAway: true,
      },
      where: { idPartita },
    })

    if (!partita) continue

    // Scrivi formazione (usa voti della formazione precedente come giocatori)
    await scriviFormazione({
      idPartita,
      idSquadra,
      idCalendario: partita.idCalendario,
      modulo: lastFormazione.modulo,
      giocatori: lastFormazione.Voti,
    })

    // Salva dettagli per mail
    const descrizioneGiornata = getDescrizioneGiornata(
      partita.Calendario.giornataSerieA,
      partita.Calendario.Torneo.nome,
      partita.Calendario.giornata,
      partita.Calendario.Torneo.gruppoFase,
    )
    partiteConDettagli.push({ partita, descrizioneGiornata })
  }

  // 5. Invia mail (dopo le transazioni)
  const mailEnabled = env.MAIL_ENABLED === 'true'
  if (mailEnabled && partiteConDettagli.length > 0) {
    const admins = await Utenti.find({ where: { adminLevel: true } })

    for (const { partita, descrizioneGiornata } of partiteConDettagli) {
      const subject = `ErFantacalcio: Conferma formazione precedente – ${partita.SquadraHome?.nomeSquadra} - ${partita.SquadraAway?.nomeSquadra}`

      const avversarioPresidente =
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

      const presidenteCorrente =
        idSquadra === partita.SquadraHome?.idUtente
          ? partita.SquadraHome?.presidente
          : partita.SquadraAway?.presidente

      const nomeSquadraCorrente =
        idSquadra === partita.SquadraHome?.idUtente
          ? partita.SquadraHome?.nomeSquadra
          : partita.SquadraAway?.nomeSquadra

      // Mail all'avversario (to) e copia al presidente che ha confermato (cc)
      if (to && cc) {
        const htmlMessage = buildConfermaPrecedenteHtml({
          avversarioPresidente,
          descrizioneGiornata,
          dataConferma: formatDateTime(nowInItalyIso()),
          dataCalcioInizio: formatDateTime(
            partita.Calendario.data ?? new Date(),
          ),
          importoMulta: Configurazione.importoMulta,
        })

        await ReSendMailAsync(to, cc, subject, htmlMessage)
      }

      // Mail agli admin
      for (const admin of admins) {
        if (!admin.mail) continue
        const subjectAdmin = `[Admin] ErFantacalcio: Conferma automatica formazione – ${partita.SquadraHome?.nomeSquadra} - ${partita.SquadraAway?.nomeSquadra}`
        const htmlAdmin = buildConfermaPrecedenteAdminHtml({
          presidenteCorrente,
          nomeSquadraCorrente,
          nomeSquadraHome: partita.SquadraHome?.nomeSquadra,
          nomeSquadraAway: partita.SquadraAway?.nomeSquadra,
          descrizioneGiornata,
          dataConferma: formatDateTime(nowInItalyIso()),
          dataCalcioInizio: formatDateTime(
            partita.Calendario.data ?? new Date(),
          ),
          importoMulta: Configurazione.importoMulta,
        })

        await ReSendMailAsync(admin.mail, admin.mail, subjectAdmin, htmlAdmin)
      }
    }
  }
})
