/**
 * probabiliFormazioniMerge — logica pura di merge/media tra le probabilità
 * fornite dalla fonte primaria (fantacalcio.it) e dalla fonte secondaria
 * (sosfanta.com).
 *
 * Isolata in un file dedicato per testabilità unitaria: nessuna dipendenza
 * da I/O, DB o altri moduli.
 */

// ─── Tipi pubblici ────────────────────────────────────────────────────────────

export interface MergeInput {
  idGiocatore: number
  probabilitaFantacalcio: number
  /** null = giocatore non trovato/associato in sosfanta */
  probabilitaSosfanta: number | null
}

export interface MergeOutput {
  idGiocatore: number
  /** Valore finale da persistere */
  probabilita: number
  /** true se per questo giocatore è avvenuta effettivamente una media */
  fonteSosfantaUsata: boolean
}

// ─── Merge ────────────────────────────────────────────────────────────────────

/**
 * Combina la probabilità fantacalcio.it con quella sosfanta.com.
 * Se sosfanta non ha un valore (null), restituisce quella di fantacalcio
 * invariata. Altrimenti restituisce la media arrotondata delle due.
 */
export function mergeProbabilita(input: MergeInput): MergeOutput {
  const { idGiocatore, probabilitaFantacalcio, probabilitaSosfanta } = input

  if (probabilitaSosfanta === null) {
    return {
      idGiocatore,
      probabilita: probabilitaFantacalcio,
      fonteSosfantaUsata: false,
    }
  }

  return {
    idGiocatore,
    probabilita: Math.round((probabilitaFantacalcio + probabilitaSosfanta) / 2),
    fonteSosfantaUsata: true,
  }
}
