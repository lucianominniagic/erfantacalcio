/**
 * formazioneReminderService — logica del cron giornaliero "promemoria formazione".
 *
 * Individua, tra le giornate/partite non ancora giocate, quelle la cui data
 * (`Calendario.data`) cade nel giorno solare odierno (Europe/Rome). Per
 * ciascuna squadra coinvolta in quelle partite (senza distinzione di torneo:
 * campionato/champions/coppa dei perdenti/recuperi possono coesistere nella
 * stessa data grazie a `hasSovrapposta`) invia sempre una mail di promemoria
 * cumulativa, a prescindere dal fatto che la formazione sia già stata
 * inserita o meno (può essere stata inserita giorni prima e la mail funge
 * comunque da promemoria/invito a ricontrollarla prima del calcio d'inizio).
 */

import { In } from 'typeorm'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { env } from 'process'

import { Utenti } from '~/server/db/entities'
import {
  getProssimaGiornata,
  getProssimaGiornataSerieA,
} from '~/server/api/calendario/repository'
import { ReSendMailAsync } from '~/server/services/mailSender'
import { buildFormazionePromemoriaHtml } from '~/server/services/mailTemplates'
import { formatDateTime } from '~/utils/dateUtils'

dayjs.extend(utc)
dayjs.extend(timezone)

const TIMEZONE = 'Europe/Rome'

export interface PromemoriaFormazioniResult {
  inviate: number
  destinatari: string[]
}

export async function inviaPromemoriaFormazioniMancanti(): Promise<PromemoriaFormazioniResult> {
  const oggi = dayjs().tz(TIMEZONE)

  const giornataSerieA = await getProssimaGiornataSerieA(false, 'asc')
  const prossimeGiornate = await getProssimaGiornata(giornataSerieA, false)

  // Solo le giornate/partite in programma oggi (stesso giorno solare Europe/Rome)
  const giornateOggi = prossimeGiornate.filter(
    (giornata) => !!giornata.data && dayjs(giornata.data).tz(TIMEZONE).isSame(oggi, 'day'),
  )

  if (giornateOggi.length === 0) {
    return { inviate: 0, destinatari: [] }
  }

  // Mappa idSquadra -> partite in scadenza oggi (home o away, qualsiasi torneo)
  const idSquadreSet = new Set<number>()
  for (const giornata of giornateOggi) {
    for (const partita of giornata.partite) {
      if (partita.idHome) idSquadreSet.add(partita.idHome)
      if (partita.idAway) idSquadreSet.add(partita.idAway)
    }
  }

  if (idSquadreSet.size === 0) {
    return { inviate: 0, destinatari: [] }
  }

  const idSquadre = Array.from(idSquadreSet)

  // Data della prima partita di Serie A della giornata odierna (comune a tutti i tornei sovrapposti)
  const dataPartita = formatDateTime(giornateOggi[0]?.data)

  const squadre = await Utenti.find({
    select: { idUtente: true, mail: true, presidente: true, nomeSquadra: true },
    where: { idUtente: In(idSquadre) },
  })

  const mailEnabled = env.MAIL_ENABLED === 'true'
  const destinatari: string[] = []

  for (const squadra of squadre) {
    if (!squadra.mail) {
      console.warn(
        `Impossibile inviare promemoria formazione: mail non configurata per la squadra ${squadra.nomeSquadra}`,
      )
      continue
    }

    if (mailEnabled) {
      const subject = 'ErFantacalcio: Promemoria formazione'
      const htmlMessage = buildFormazionePromemoriaHtml({
        presidente: squadra.presidente,
        dataPartita,
      })
      await ReSendMailAsync(squadra.mail, squadra.mail, subject, htmlMessage)
    } else {
      console.info(
        `Mail disabilitata (MAIL_ENABLED != true), skip invio promemoria a: ${squadra.mail}`,
      )
    }
    destinatari.push(squadra.mail)
  }

  return { inviate: destinatari.length, destinatari }
}
