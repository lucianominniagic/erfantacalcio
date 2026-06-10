/**
 * formazioneService — logica pura per la costruzione dei dati formazione e voti.
 *
 * Nessuna dipendenza da contesto tRPC, DB o sessione.
 * Le funzioni sono pure: prendono dati in input e restituiscono oggetti da inserire.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GiocatoreInput {
  idGiocatore: number
  titolare: boolean
  riserva?: number | null
}

export interface FormazioneInsertData {
  idPartita: number
  idSquadra: number
  modulo: string
  dataOra: string | Date
  hasBloccata: boolean
}

export interface VotoInsertData {
  idGiocatore: number
  idCalendario: number
  idFormazione: number
  titolare: boolean
  riserva: number | null
  voto: number
}

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Costruisce il payload per inserire una nuova formazione.
 * Imposta sempre `hasBloccata: false`.
 */
export function buildFormazioneInsertData(
  idPartita: number,
  idSquadra: number,
  modulo: string,
  dataOra: string | Date,
): FormazioneInsertData {
  return {
    idPartita,
    idSquadra,
    modulo,
    dataOra,
    hasBloccata: false,
  }
}

/**
 * Costruisce l'array di payload per inserire i voti di una formazione.
 * Imposta sempre `voto: 0` (i voti reali vengono caricati tramite processVoti).
 */
export function buildVotiInsertData(
  giocatori: GiocatoreInput[],
  idFormazione: number,
  idCalendario: number,
): VotoInsertData[] {
  return giocatori.map((g) => ({
    idGiocatore: g.idGiocatore,
    idCalendario,
    idFormazione,
    titolare: g.titolare,
    riserva: g.riserva ?? null,
    voto: 0,
  }))
}
