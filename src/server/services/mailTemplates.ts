/**
 * mailTemplates — template HTML per le notifiche email di ErFantacalcio.
 *
 * Nessuna dipendenza da contesto tRPC, DB o sessione.
 * Ogni funzione riceve i dati necessari e restituisce una stringa HTML.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FormazioneMailData {
  avversarioPresidente: string | undefined
  descrizioneGiornata: string
  dataInserimentoFormazione: string
  dataCalcioInizio: string
}

export interface ConfermaPrecedenteMailData {
  avversarioPresidente: string | undefined
  descrizioneGiornata: string
  dataConferma: string
  dataCalcioInizio: string
  importoMulta: number
}

export interface ConfermaPrecedenteAdminMailData {
  presidenteCorrente: string | undefined
  nomeSquadraCorrente: string | undefined
  nomeSquadraHome: string | undefined
  nomeSquadraAway: string | undefined
  descrizioneGiornata: string
  dataConferma: string
  dataCalcioInizio: string
  importoMulta: number
}

// ─── Templates ────────────────────────────────────────────────────────────────

/**
 * HTML per la notifica all'avversario quando un presidente inserisce la formazione.
 */
export function buildFormazioneCreatedHtml(data: FormazioneMailData): string {
  return `Notifica automatica da erFantacalcio.com<br><br>
              Il tuo avversario, l'infame ${data.avversarioPresidente}, ha inserito la formazione per la prossima partita <br> <br>
              <b>Dettagli partita:</b><br>
              Giornata: ${data.descrizioneGiornata}<br>
              Data inserimento formazione: ${data.dataInserimentoFormazione}<br>
              Calcio d'inizio: ${data.dataCalcioInizio}<br> <br>
              https://www.erfantacalcio.com <br> <br>
              Saluti dal Vostro immenso Presidente`
}

/**
 * HTML per la notifica all'avversario quando viene confermata la formazione precedente.
 * Include l'avviso della multa.
 */
export function buildConfermaPrecedenteHtml(
  data: ConfermaPrecedenteMailData,
): string {
  return `Notifica automatica da erFantacalcio.com<br><br>
          Il tuo avversario, l'infame ${data.avversarioPresidente}, ha confermato automaticamente la formazione della giornata precedente per la prossima partita.<br><br>
          <b>Dettagli partita:</b><br>
          Giornata: ${data.descrizioneGiornata}<br>
          Data conferma formazione: ${data.dataConferma}<br>
          Calcio d'inizio: ${data.dataCalcioInizio}<br><br>
          ⚠️ <b>Attenzione:</b> per il ritardo nell'inserimento della formazione verrà applicata una multa di <b>€${data.importoMulta}</b>.<br><br>
          https://www.erfantacalcio.com <br><br>
          Saluti dal Vostro immenso Presidente`
}

/**
 * HTML per la notifica admin quando viene confermata la formazione precedente.
 */
export function buildConfermaPrecedenteAdminHtml(
  data: ConfermaPrecedenteAdminMailData,
): string {
  return `Notifica automatica da erFantacalcio.com<br><br>
          Riepilogo operazione di conferma formazione precedente:<br><br>
          <b>Chi ha confermato:</b> ${data.presidenteCorrente} (${data.nomeSquadraCorrente})<br>
          <b>Giornata:</b> ${data.descrizioneGiornata}<br>
          <b>Partita:</b> ${data.nomeSquadraHome} - ${data.nomeSquadraAway}<br>
          <b>Data conferma:</b> ${data.dataConferma}<br>
          <b>Calcio d'inizio:</b> ${data.dataCalcioInizio}<br>
          <b>Multa applicata:</b> €${data.importoMulta}<br><br>
          https://www.erfantacalcio.com`
}
