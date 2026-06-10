/**
 * statisticheService — logica pura per l'aggregazione delle statistiche squadre.
 *
 * Nessuna dipendenza da contesto tRPC, DB o sessione.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SquadraStats {
  idSquadra: number
  squadra: string
  foto: string | null
  giocate: number
  vittorie: number
  pareggi: number
  sconfitte: number
  vittorieCasa: number
  giocateCasa: number
  vittorieTrasferta: number
  giocateTrasferta: number
  fantapuntiTot: number
  golFatti: number
  golSubiti: number
  cleanSheet: number
  partiteSenzaGol: number
  miglioreGiornata: number | null
  miglioreFantapunti: number | null
  peggioreGiornata: number | null
  peggioreFantapunti: number | null
  miglioreVittoriaScarto: number
  miglioreVittoriaLabel: string | null
  peggioreSconfittaScarto: number
  peggioreSconfittaLabel: string | null
}

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Crea un oggetto `SquadraStats` inizializzato a zero per una squadra.
 */
export function initStats(
  idSquadra: number,
  squadra: string,
  foto: string | null,
): SquadraStats {
  return {
    idSquadra,
    squadra,
    foto,
    giocate: 0,
    vittorie: 0,
    pareggi: 0,
    sconfitte: 0,
    vittorieCasa: 0,
    giocateCasa: 0,
    vittorieTrasferta: 0,
    giocateTrasferta: 0,
    fantapuntiTot: 0,
    golFatti: 0,
    golSubiti: 0,
    cleanSheet: 0,
    partiteSenzaGol: 0,
    miglioreGiornata: null,
    miglioreFantapunti: null,
    peggioreGiornata: null,
    peggioreFantapunti: null,
    miglioreVittoriaScarto: -Infinity,
    miglioreVittoriaLabel: null,
    peggioreSconfittaScarto: Infinity,
    peggioreSconfittaLabel: null,
  }
}

/**
 * Accumula i dati di una singola partita nello stats di una squadra (mutazione in-place).
 *
 * @param s           - stats da aggiornare (mutato)
 * @param isHome      - true se la squadra giocava in casa
 * @param fantapunti  - punteggio fantacalcio della squadra in questa partita
 * @param golF        - gol fatti dalla squadra
 * @param golS        - gol subiti dalla squadra
 * @param opponentName - nome dell'avversario (per label vittoria/sconfitta)
 * @param giornata    - numero giornata (per migliore/peggiore fantapunti)
 */
export function accumulate(
  s: SquadraStats,
  isHome: boolean,
  fantapunti: number,
  golF: number,
  golS: number,
  opponentName: string,
  giornata: number,
): void {
  s.giocate += 1
  s.fantapuntiTot += fantapunti
  s.golFatti += golF
  s.golSubiti += golS
  if (isHome) s.giocateCasa += 1
  else s.giocateTrasferta += 1
  if (golS === 0) s.cleanSheet += 1
  if (golF === 0) s.partiteSenzaGol += 1

  if (s.miglioreFantapunti == null || fantapunti > s.miglioreFantapunti) {
    s.miglioreFantapunti = fantapunti
    s.miglioreGiornata = giornata
  }
  if (s.peggioreFantapunti == null || fantapunti < s.peggioreFantapunti) {
    s.peggioreFantapunti = fantapunti
    s.peggioreGiornata = giornata
  }

  if (golF > golS) {
    s.vittorie += 1
    if (isHome) s.vittorieCasa += 1
    else s.vittorieTrasferta += 1
    const scarto = golF - golS
    if (scarto > s.miglioreVittoriaScarto) {
      s.miglioreVittoriaScarto = scarto
      s.miglioreVittoriaLabel = `${golF}-${golS} vs ${opponentName} (G${giornata})`
    }
  } else if (golF === golS) {
    s.pareggi += 1
  } else {
    s.sconfitte += 1
    const scarto = golF - golS
    if (scarto < s.peggioreSconfittaScarto) {
      s.peggioreSconfittaScarto = scarto
      s.peggioreSconfittaLabel = `${golF}-${golS} vs ${opponentName} (G${giornata})`
    }
  }
}

/**
 * Arrotonda un numero a 2 cifre decimali.
 */
export function round2(n: number): number {
  return Math.round(n * 100) / 100
}
