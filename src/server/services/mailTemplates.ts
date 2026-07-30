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

import {
  tipoAstaDaBoolean,
  REGOLE_PER_TIPO_ASTA,
  SEZIONE_SESSIONI_MERCATO,
  type Block,
} from '~/content/regolamentoMercato'

// ─── Escape helper (sicurezza HTML) ──────────────────────────────────────────

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ─── Block renderer ───────────────────────────────────────────────────────────

/**
 * Converte un array di `Block` (da `regolamentoMercato.ts`) in HTML sicuro
 * per email.
 */
function renderBlocksHtml(blocks: Block[]): string {
  return blocks
    .map((block) => {
      if (block.type === 'p') return `<p>${esc(block.text)}</p>`

      if (block.type === 'list') {
        const items = block.items.map((i) => `<li>${esc(i)}</li>`).join('\n')
        return `<ul>\n${items}\n</ul>`
      }

      if (block.type === 'table') {
        const headers = block.headers.map((h) => `<th>${esc(h)}</th>`).join('')
        const rows = block.rows
          .map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
          .join('\n')
        return `<table border="1" cellpadding="4" cellspacing="0">\n<tr>${headers}</tr>\n${rows}\n</table>`
      }

      return ''
    })
    .join('\n')
}

export interface SessioneMercatoCreataMailData {
  presidente: string | undefined
  dataApertura: string
  dataChiusura: string
  maxProposte: number
  acquistiEffettivi: number
  tipoValuta: string
  /** Indica se la sessione è in modalità asta in chiaro (`true`) o al buio (`false`). */
  astaInChiaro: boolean
  /** URL assoluto alla sezione regolamento (opzionale). */
  linkRegolamento?: string
}

const LABEL_VALUTA: Record<string, string> = {
  fantamilioni: 'Fantamilioni',
  euro: 'Euro',
}

const LABEL_TIPO_ASTA: Record<string, string> = {
  alBuio: 'Al Buio',
  inChiaro: 'In Chiaro',
}

/**
 * HTML per la notifica a tutti i presidenti quando viene creata una nuova
 * sessione di mercato.
 *
 * Include:
 * - Tutti i parametri configurati per la sessione
 * - Riepilogo del regolamento specifico per tipo di asta (al buio / in chiaro)
 * - Link assoluto alla sezione regolamento (se fornito)
 */
export function buildSessioneMercatoCreataHtml(data: SessioneMercatoCreataMailData): string {
  const tipoAsta = tipoAstaDaBoolean(data.astaInChiaro)
  const regolaSezione = REGOLE_PER_TIPO_ASTA[tipoAsta]
  const labelValuta = LABEL_VALUTA[data.tipoValuta] ?? data.tipoValuta
  const labelTipoAsta = LABEL_TIPO_ASTA[tipoAsta] ?? tipoAsta

  const linkSection = data.linkRegolamento
    ? `Per il regolamento completo: <a href="${data.linkRegolamento}">Sezione regolamento — Sessioni di mercato</a><br><br>`
    : ''

  const regolamentoHtml = `
<b>Regolamento — ${esc(regolaSezione.title)}:</b><br>
${renderBlocksHtml(regolaSezione.blocks)}
<br>
${linkSection}`

  return `Notifica automatica da erFantacalcio.com<br><br>
Illustrissimo ${esc(data.presidente ?? 'Presidente')}, è stata aperta una nuova sessione di mercato!<br><br>
<b>Dettagli sessione:</b><br>
Data apertura: ${esc(data.dataApertura)}<br>
Data chiusura: ${esc(data.dataChiusura)}<br>
Tipo di asta: <b>${labelTipoAsta}</b><br>
Valuta: ${labelValuta}<br>
Numero massimo proposte: ${data.maxProposte}<br>
Acquisti effettivi consentiti: ${data.acquistiEffettivi}<br><br>
${regolamentoHtml}
https://www.erfantacalcio.com <br><br>
Saluti dal Vostro immenso Presidente`
}
