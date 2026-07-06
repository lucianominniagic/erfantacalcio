/**
 * mailTemplates — template HTML per le notifiche email di ErFantacalcio.
 *
 * Nessuna dipendenza da contesto tRPC, DB o sessione.
 * Ogni funzione riceve i dati necessari e restituisce una stringa HTML.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PartitaMailPartecipanti {
  SquadraHome?: { idUtente?: number; mail?: string; presidente?: string; nomeSquadra?: string } | null
  SquadraAway?: { idUtente?: number; mail?: string; presidente?: string; nomeSquadra?: string } | null
}

export interface FormazioneMailRecipients {
  /** Mail dell'avversario (destinatario principale) */
  to: string | undefined
  /** Mail di chi ha inserito la formazione (in copia) */
  cc: string | undefined
  /** Nome del presidente avversario (per il corpo email) */
  avversario: string | undefined
  /** Nome del presidente che ha inserito la formazione */
  submitter: string | undefined
  /** Nome della squadra di chi ha inserito */
  nomeSquadraSubmitter: string | undefined
}

/**
 * Risolve i destinatari di una mail di notifica formazione dato chi l'ha inserita.
 * Funzione pura: nessuna dipendenza da DB o sessione.
 */
export function resolveFormazioneMailRecipients(
  partita: PartitaMailPartecipanti,
  idSquadraSubmitter: number,
): FormazioneMailRecipients {
  const isHome = idSquadraSubmitter === partita.SquadraHome?.idUtente
  return {
    to: isHome ? partita.SquadraAway?.mail : partita.SquadraHome?.mail,
    cc: isHome ? partita.SquadraHome?.mail : partita.SquadraAway?.mail,
    avversario: isHome ? partita.SquadraAway?.presidente : partita.SquadraHome?.presidente,
    submitter: isHome ? partita.SquadraHome?.presidente : partita.SquadraAway?.presidente,
    nomeSquadraSubmitter: isHome ? partita.SquadraHome?.nomeSquadra : partita.SquadraAway?.nomeSquadra,
  }
}



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
          Il tuo avversario, l'illustrissimo ${data.avversarioPresidente}, ha confermato automaticamente la formazione della giornata precedente per la prossima partita.<br><br>
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

/**
 * HTML per il promemoria di formazione (cron giornaliero).
 * Ricorda al presidente che oggi si gioca, indipendentemente dal fatto che la
 * formazione sia già stata inserita o meno.
 */
export function buildFormazionePromemoriaHtml(data: {
  presidente: string | undefined
  dataPartita: string
}): string {
  return `Notifica automatica da erFantacalcio.com<br><br>
          Illustrissimo ${data.presidente ?? 'Presidente'}, oggi si gioca! Ti ricordiamo di inserire (o ricontrollare) la formazione.<br><br>
          Calcio d'inizio: ${data.dataPartita}<br><br>
          Accedi al sito prima del calcio d'inizio.<br><br>
          https://www.erfantacalcio.com <br><br>
          Saluti dal Vostro immenso Presidente`
}

export interface SessioneMercatoCreataMailData {
  presidente: string | undefined
  dataApertura: string
  dataChiusura: string
  maxProposte: number
  acquistiEffettivi: number
  tipoValuta: string
}

/**
 * HTML per la notifica a tutti i presidenti quando viene creata una nuova
 * sessione di mercato.
 */
export function buildSessioneMercatoCreataHtml(data: SessioneMercatoCreataMailData): string {
  return `Notifica automatica da erFantacalcio.com<br><br>
          Illustrissimo ${data.presidente ?? 'Presidente'}, è stata aperta una nuova sessione di mercato!<br><br>
          <b>Dettagli sessione:</b><br>
          Data apertura: ${data.dataApertura}<br>
          Data chiusura: ${data.dataChiusura}<br>
          Numero massimo proposte: ${data.maxProposte}<br>
          Acquisti effettivi consentiti: ${data.acquistiEffettivi}<br>
          Tipo valuta: ${data.tipoValuta}<br><br>
          https://www.erfantacalcio.com <br><br>
          Saluti dal Vostro immenso Presidente`
}
