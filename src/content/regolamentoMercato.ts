/**
 * Contenuto regolamentare relativo alle sessioni di mercato.
 *
 * Questo modulo è server-safe e client-safe: non importa React né hook.
 * Viene consumato da:
 *  - `src/app/(user)/regolamento/page.tsx`  → rendering lato pagina
 *  - futuri template email (es. Resend) → riepilogo regole al momento
 *    della creazione di una nuova sessione di mercato
 *
 * I tipi `Block`, `SubSection`, `Section` sono re-esportati affinché
 * la pagina non debba ridefinirli.
 */

// ── Content-model types ────────────────────────────────────────────────────

export type Block =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }

export interface SubSection {
  title: string
  blocks: Block[]
}

export interface Section {
  id: string
  title: string
  blocks?: Block[]
  subsections?: SubSection[]
}

// ── TipoAsta — mapping type-safe al campo `astaInChiaro: boolean` ──────────

/**
 * Discriminante semantico per il tipo di asta di una sessione di mercato.
 * - `'alBuio'`   → `SessioneMercato.astaInChiaro === false`
 * - `'inChiaro'` → `SessioneMercato.astaInChiaro === true`
 */
export type TipoAsta = 'alBuio' | 'inChiaro'

/**
 * Converte il booleano `astaInChiaro` (campo entity) in `TipoAsta`.
 */
export function tipoAstaDaBoolean(astaInChiaro: boolean): TipoAsta {
  return astaInChiaro ? 'inChiaro' : 'alBuio'
}

// ── Regole per tipo di asta ────────────────────────────────────────────────

/**
 * Sottosezioni del regolamento — una per tipo di asta.
 * Usato dalle email per includere solo le regole pertinenti alla sessione
 * appena creata.
 */
export const REGOLE_PER_TIPO_ASTA: Record<TipoAsta, SubSection> = {
  alBuio: {
    title: 'Modalità Asta al Buio (fantamilioni o euro)',
    blocks: [
      {
        type: 'p',
        text: 'Ciascun presidente può effettuare delle proposte di acquisto indicando il costo e la priorità della proposta.',
      },
      {
        type: 'p',
        text: "Le proposte di acquisto non sono visibili agli altri presidenti fino alla chiusura della sessione di mercato (le proposte sono criptate, non visibili nemmeno dall'amministratore).",
      },
      {
        type: 'p',
        text: "Alla scadenza della sessione le offerte pervenute saranno visibili da tutti in trasparenza e si procederà all'acquisto dichiarando il giocatore da cedere.",
      },
      {
        type: 'p',
        text: "L'aggiudicazione avviene nel seguente modo:",
      },
      {
        type: 'list',
        items: [
          'regola base: per ogni giocatore vince la squadra che ha offerto il prezzo più alto. A parità di prezzo, vince chi ha inviato la proposta prima',
          'Cap acquisti: ogni squadra può aggiudicarsi al massimo gli acquisti effettivi concessi; se un presidente effettua 5 proposte e gli acquisti consentiti sono 2, prende i primi 2 giocatori in ordine di priorità su cui è il miglior offerente',
        ],
      },
    ],
  },
  inChiaro: {
    title: 'Modalità Asta in Chiaro (solo euro)',
    blocks: [
      {
        type: 'p',
        text: "La modalità asta in chiaro è disponibile esclusivamente per le sessioni in soldi reali. A differenza dell'asta al buio, tutte le offerte sono visibili in tempo reale a tutti i presidenti: per ogni giocatore si vede chi sta offrendo e a quale prezzo.",
      },
      {
        type: 'p',
        text: 'Le regole principali sono:',
      },
      {
        type: 'list',
        items: [
          'Tutti i giocatori svincolati sono disponibili contemporaneamente per tutta la durata della sessione',
          "Ogni squadra può fare un'offerta su ciascun giocatore; l'offerta può essere aggiornata (rilancio) in qualsiasi momento, ma deve essere strettamente superiore all'offerta massima corrente sul quel giocatore",
          "Non è possibile ritirare un'offerta già inviata",
          'Una volta fatta la prima offerta su un giocatore, si avvia un timer di 24 ore. Alla scadenza (o alla chiusura generale della sessione, se precedente) il giocatore viene aggiudicato al miglior offerente',
          "Il giocatore scompare dall'elenco degli acquistabili non appena il suo timer scade, anche prima della conferma formale dell'amministratore",
          'Cap acquisti: se una squadra ha già vinto un numero di aste pari agli acquisti effettivi consentiti, i successivi rilanci vengono bloccati automaticamente',
        ],
      },
      {
        type: 'p',
        text: "L'aggiudicazione effettiva di ogni giocatore viene confermata dall'amministratore al termine delle singole aste.",
      },
    ],
  },
}

// ── Sezione completa — "Sessioni di mercato sosta nazionali" ───────────────

/**
 * Sezione regolamentare completa (intro + sottosezioni per tipo di asta).
 * L'`id` corrisponde all'anchor HTML usato nella pagina regolamento.
 */
export const SEZIONE_SESSIONI_MERCATO: Section = {
  id: 'sessioni-di-mercato-sosta-nazionali',
  title: 'Sessioni di mercato sosta nazionali',
  blocks: [
    {
      type: 'p',
      text: 'Durante il periodo della sosta nazionali (orientativamente 11-17 novembre e 24-30 marzo) verrà creata una sessione di mercato sul sito.',
    },
    { type: 'p', text: 'La sessione di mercato prevede la scelta di:' },
    {
      type: 'list',
      items: [
        'una finestra temporale (data inizio, data fine)',
        'soldi reali o fantamilioni',
        'un numero massimo di proposte di acquisto per ciascuna squadra',
        'un numero massimo di giocatori acquistabili per ciascuna squadra',
      ],
    },
    {
      type: 'p',
      text: "Per le sessioni di mercato in fantamilioni è previsto all'apertura di ogni sessione un extra bonus di 30 fantamilioni oltre a quelli restanti del mercato di settembre/gennaio. Per le sessioni in soldi reali non sono previsti extra bonus e l'offerta non è legata a vincoli.",
    },
    {
      type: 'p',
      text: "Esistono due modalità di mercato, selezionabili dall'amministratore al momento della creazione della sessione:",
    },
  ],
  subsections: [REGOLE_PER_TIPO_ASTA.alBuio, REGOLE_PER_TIPO_ASTA.inChiaro],
}
