/**
 * salvaFormazioneService — orchestrazione dei casi d'uso "salva formazione".
 *
 * Possiede tutta la logica di coordinamento:
 *   - caricamento della Partita
 *   - delega della scrittura transazionale a scriviFormazione
 *   - invio della notifica mail
 *
 * Non possiede: la logica DB transazionale (scriviFormazione), i builder puri
 * (formazioneService) né i template HTML (mailTemplates).
 */

import { ORPCError } from '@orpc/server'
import { In, Not } from 'typeorm'
import { env } from 'process'

import { Formazioni, Partite, Utenti } from '~/server/db/entities'
import {
  getProssimaGiornata,
  getProssimaGiornataSerieA,
} from '~/server/api/calendario/repository'
import { scriviFormazione, type GiocatoreInput } from '~/server/services/scriviFormazione'
import { ReSendMailAsync } from '~/server/services/mailSender'
import { formatDateTime, nowInItalyIso } from '~/utils/dateUtils'
import { getDescrizioneGiornata } from '~/utils/helper'
import { Configurazione } from '~/config'
import {
  buildFormazioneCreatedHtml,
  buildConfermaPrecedenteHtml,
  buildConfermaPrecedenteAdminHtml,
  resolveFormazioneMailRecipients,
} from '~/server/services/mailTemplates'

export interface SalvaFormazioneInput {
  idPartita: number
  idSquadra: number
  modulo: string
  giocatori: GiocatoreInput[]
}

// ─── salvaFormazione ──────────────────────────────────────────────────────────

export async function salvaFormazione(input: SalvaFormazioneInput): Promise<void> {
  const { idPartita, idSquadra, modulo, giocatori } = input

  const partita = await Partite.findOne({
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
    relations: {
      Calendario: { Torneo: true },
      SquadraHome: true,
      SquadraAway: true,
    },
    where: { idPartita },
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

  const dataInserimentoFormazione = nowInItalyIso()
  await scriviFormazione({
    idPartita,
    idSquadra,
    idCalendario: partita.idCalendario,
    modulo,
    giocatori,
  })

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
}

// ─── confermaPrecedente ───────────────────────────────────────────────────────

export async function confermaPrecedente(idSquadra: number): Promise<void> {
  // 1. Recupera le giornate correnti e filtra per l'utente
  const giornataSerieA = await getProssimaGiornataSerieA(false, 'asc')
  const prossimeGiornate = await getProssimaGiornata(giornataSerieA, true)
  const giornateFiltrate = prossimeGiornate.filter((giornata) =>
    giornata.partite.some(
      (partita) => partita.idHome === idSquadra || partita.idAway === idSquadra,
    ),
  )

  const idPartiteCorrente: number[] = giornateFiltrate.flatMap((giornata) =>
    giornata.partite
      .filter((p) => p.idHome === idSquadra || p.idAway === idSquadra)
      .map((p) => p.idPartita),
  )

  // 2. Verifica che l'utente non abbia già una formazione per le partite correnti
  const formazioniEsistenti = await Formazioni.count({
    where: { idSquadra, idPartita: In(idPartiteCorrente) },
  })
  if (formazioniEsistenti > 0) {
    throw new ORPCError('CONFLICT', {
      message: 'Hai già inserito la formazione per questa giornata',
    })
  }

  // 3. Recupera l'ultima formazione precedente (escludendo le partite correnti)
  const lastFormazione = await Formazioni.findOne({
    where: { idSquadra, idPartita: Not(In(idPartiteCorrente)) },
    order: { dataOra: 'DESC' },
    relations: { Voti: true },
  })

  if (!lastFormazione) {
    throw new ORPCError('NOT_FOUND', {
      message: 'Nessuna formazione precedente trovata',
    })
  }

  // 4. Per ogni partita corrente, replica la formazione precedente
  const partiteConDettagli: { partita: Partite; descrizioneGiornata: string }[] = []

  for (const idPartita of idPartiteCorrente) {
    const partita = await Partite.findOne({
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
      relations: {
        Calendario: { Torneo: true },
        SquadraHome: true,
        SquadraAway: true,
      },
      where: { idPartita },
    })

    if (!partita) continue

    await scriviFormazione({
      idPartita,
      idSquadra,
      idCalendario: partita.idCalendario,
      modulo: lastFormazione.modulo,
      giocatori: lastFormazione.Voti,
    })

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
      const { to, cc, avversario, submitter, nomeSquadraSubmitter } =
        resolveFormazioneMailRecipients(partita, idSquadra)

      if (to && cc) {
        const htmlMessage = buildConfermaPrecedenteHtml({
          avversarioPresidente: avversario,
          descrizioneGiornata,
          dataConferma: formatDateTime(nowInItalyIso()),
          dataCalcioInizio: formatDateTime(partita.Calendario.data ?? new Date()),
          importoMulta: Configurazione.importoMulta,
        })
        await ReSendMailAsync(to, cc, subject, htmlMessage)
      }

      for (const admin of admins) {
        if (!admin.mail) continue
        const subjectAdmin = `[Admin] ErFantacalcio: Conferma automatica formazione – ${partita.SquadraHome?.nomeSquadra} - ${partita.SquadraAway?.nomeSquadra}`
        const htmlAdmin = buildConfermaPrecedenteAdminHtml({
          presidenteCorrente: submitter,
          nomeSquadraCorrente: nomeSquadraSubmitter,
          nomeSquadraHome: partita.SquadraHome?.nomeSquadra,
          nomeSquadraAway: partita.SquadraAway?.nomeSquadra,
          descrizioneGiornata,
          dataConferma: formatDateTime(nowInItalyIso()),
          dataCalcioInizio: formatDateTime(partita.Calendario.data ?? new Date()),
          importoMulta: Configurazione.importoMulta,
        })
        await ReSendMailAsync(admin.mail, admin.mail, subjectAdmin, htmlAdmin)
      }
    }
  }
}
