import { TRPCError } from '@trpc/server'
import { In, Not } from 'typeorm'
import { env } from 'process'

import { protectedProcedure } from '../../trpc'
import { AppDataSource } from '~/data-source'
import { Formazioni, Partite, Utenti, Voti } from '~/server/db/entities'
import { getProssimaGiornata, getProssimaGiornataSerieA } from '~/server/utils/common'
import { ReSendMailAsync } from '~/service/mailSender'
import { formatDateTime, nowInItalyIso } from '~/utils/dateUtils'
import { getDescrizioneGiornata } from '~/utils/helper'
import { Configurazione } from '~/config'

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
      .filter((partita) => partita.idHome === idSquadra || partita.idAway === idSquadra)
      .map((partita) => partita.idPartita),
  )

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
  const partiteConDettagli: Array<{
    partita: Partite
    descrizioneGiornata: string
  }> = []

  for (const idPartita of idPartiteCorrente) {
    await AppDataSource.transaction(async (trx) => {
      // Elimina voti e formazione esistenti per questa partita+squadra
      const formazioniIds = await trx.find(Formazioni, {
        select: { idFormazione: true },
        where: { idPartita: idPartita, idSquadra: idSquadra },
      })
      if (formazioniIds.length > 0) {
        await trx.delete(Voti, {
          idFormazione: In(formazioniIds.map((f) => f.idFormazione)),
        })
      }
      await trx.delete(Formazioni, { idPartita: idPartita, idSquadra: idSquadra })

      // Recupera i dettagli della partita corrente
      const partita = await trx.findOne(Partite, {
        select: {
          idCalendario: true,
          idPartita: true,
          SquadraHome: { nomeSquadra: true, presidente: true, idUtente: true, mail: true },
          SquadraAway: { nomeSquadra: true, presidente: true, idUtente: true, mail: true },
          Calendario: {
            idCalendario: true,
            giornata: true,
            giornataSerieA: true,
            data: true,
            girone: true,
            Torneo: { idTorneo: true, nome: true, gruppoFase: true },
          },
        },
        relations: { Calendario: { Torneo: true }, SquadraHome: true, SquadraAway: true },
        where: { idPartita: idPartita },
      })

      if (!partita) return

      // Inserisce la nuova formazione (stesso modulo di quella precedente)
      const dataInserimento = nowInItalyIso()
      const formazioneResult = await trx.insert(Formazioni, {
        idPartita: idPartita,
        idSquadra: idSquadra,
        modulo: lastFormazione.modulo,
        dataOra: dataInserimento,
        hasBloccata: false,
      })
      const idFormazione = formazioneResult.identifiers[0].idFormazione as number

      // Clona i voti dalla formazione precedente
      await Promise.all(
        lastFormazione.Voti.map(async (v) => {
          await trx.insert(Voti, {
            idGiocatore: v.idGiocatore,
            idCalendario: partita.idCalendario,
            idFormazione: idFormazione,
            titolare: v.titolare,
            riserva: v.riserva,
            voto: 0,
          })
        }),
      )

      // Salva i dettagli per le mail (fuori transazione)
      const descrizioneGiornata = getDescrizioneGiornata(
        partita.Calendario.giornataSerieA,
        partita.Calendario.Torneo.nome,
        partita.Calendario.giornata,
        partita.Calendario.Torneo.gruppoFase,
      )
      partiteConDettagli.push({ partita, descrizioneGiornata })
    })
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
        const htmlMessage = `Notifica automatica da erFantacalcio.com<br><br>
          Il tuo avversario, l'infame ${avversarioPresidente}, ha confermato automaticamente la formazione della giornata precedente per la prossima partita.<br><br>
          <b>Dettagli partita:</b><br>
          Giornata: ${descrizioneGiornata}<br>
          Data conferma formazione: ${formatDateTime(nowInItalyIso())}<br>
          Calcio d'inizio: ${formatDateTime(partita.Calendario.data ?? new Date())}<br><br>
          ⚠️ <b>Attenzione:</b> per il ritardo nell'inserimento della formazione verrà applicata una multa di <b>€${Configurazione.importoMulta}</b>.<br><br>
          https://www.erfantacalcio.com <br><br>
          Saluti dal Vostro immenso Presidente`

        await ReSendMailAsync(to, cc, subject, htmlMessage)
      }

      // Mail agli admin
      for (const admin of admins) {
        if (!admin.mail) continue
        const subjectAdmin = `[Admin] ErFantacalcio: Conferma automatica formazione – ${partita.SquadraHome?.nomeSquadra} - ${partita.SquadraAway?.nomeSquadra}`
        const htmlAdmin = `Notifica automatica da erFantacalcio.com<br><br>
          Riepilogo operazione di conferma formazione precedente:<br><br>
          <b>Chi ha confermato:</b> ${presidenteCorrente} (${nomeSquadraCorrente})<br>
          <b>Giornata:</b> ${descrizioneGiornata}<br>
          <b>Partita:</b> ${partita.SquadraHome?.nomeSquadra} - ${partita.SquadraAway?.nomeSquadra}<br>
          <b>Data conferma:</b> ${formatDateTime(nowInItalyIso())}<br>
          <b>Calcio d'inizio:</b> ${formatDateTime(partita.Calendario.data ?? new Date())}<br>
          <b>Multa applicata:</b> €${Configurazione.importoMulta}<br><br>
          https://www.erfantacalcio.com`

        await ReSendMailAsync(admin.mail, admin.mail, subjectAdmin, htmlAdmin)
      }
    }
  }
})
