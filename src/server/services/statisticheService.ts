/**
 * statisticheService — logica pura per l'aggregazione delle statistiche squadre.
 *
 * Nessuna dipendenza da contesto tRPC, DB o sessione.
 * Le funzioni buildRiepilogo / buildHeadToHead accettano tipi duck-typed
 * per restare disaccoppiate dal layer TypeORM.
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

// ─── Input types (duck-typed, no TypeORM dependency) ─────────────────────────

interface UtenteSummary {
  idUtente: number
  nomeSquadra: string
  foto: string | null
}

interface PartitaConPunteggioEntity {
  idSquadraH: number | null
  idSquadraA: number | null
  punteggioH: number | string | null
  punteggioA: number | string | null
  golH: number | string | null
  golA: number | string | null
}

interface PartitaConGol {
  idSquadraH: number | null
  idSquadraA: number | null
  golH: number | string | null
  golA: number | string | null
}

export interface H2HCell {
  v: number
  n: number
  p: number
  golFatti: number
  golSubiti: number
  partite: number
}

// ─── Aggregation functions ────────────────────────────────────────────────────

/**
 * Costruisce il riepilogo classificatorio dalle partite con punteggio completate.
 */
export function buildRiepilogo(
  utenti: UtenteSummary[],
  partite: { entities: PartitaConPunteggioEntity[]; raw: { giornata?: string | number }[] },
) {
  const statsMap = new Map<number, SquadraStats>()
  utenti.forEach((u) => {
    statsMap.set(u.idUtente, initStats(u.idUtente, u.nomeSquadra, u.foto))
  })

  const nomeBy = (id: number | null | undefined): string =>
    (id != null && statsMap.get(id)?.squadra) || '—'

  partite.entities.forEach((p, idx) => {
    const giornata = Number(partite.raw[idx]?.giornata ?? 0)
    const idH = p.idSquadraH
    const idA = p.idSquadraA
    if (idH == null || idA == null) return
    const punteggioH = Number(p.punteggioH ?? 0)
    const punteggioA = Number(p.punteggioA ?? 0)
    const golH = Number(p.golH ?? 0)
    const golA = Number(p.golA ?? 0)

    const home = statsMap.get(idH)
    const away = statsMap.get(idA)
    if (!home || !away) return

    accumulate(home, true, punteggioH, golH, golA, nomeBy(idA), giornata)
    accumulate(away, false, punteggioA, golA, golH, nomeBy(idH), giornata)
  })

  return Array.from(statsMap.values())
    .filter((s) => s.giocate > 0)
    .map((s) => ({
      id: s.idSquadra,
      idSquadra: s.idSquadra,
      squadra: s.squadra,
      foto: s.foto,
      giocate: s.giocate,
      vittorie: s.vittorie,
      pareggi: s.pareggi,
      sconfitte: s.sconfitte,
      mediaFantapunti: round2(s.fantapuntiTot / s.giocate),
      mediaGolFatti: round2(s.golFatti / s.giocate),
      mediaGolSubiti: round2(s.golSubiti / s.giocate),
      miglioreFantapunti: s.miglioreFantapunti != null ? round2(s.miglioreFantapunti) : null,
      miglioreGiornata: s.miglioreGiornata,
      peggioreFantapunti: s.peggioreFantapunti != null ? round2(s.peggioreFantapunti) : null,
      peggioreGiornata: s.peggioreGiornata,
      miglioreVittoria: s.miglioreVittoriaLabel,
      peggioreSconfitta: s.peggioreSconfittaLabel,
      cleanSheet: s.cleanSheet,
      partiteSenzaGol: s.partiteSenzaGol,
      percVittorieCasa:
        s.giocateCasa > 0 ? round2((s.vittorieCasa / s.giocateCasa) * 100) : 0,
      percVittorieTrasferta:
        s.giocateTrasferta > 0 ? round2((s.vittorieTrasferta / s.giocateTrasferta) * 100) : 0,
    }))
    .sort((a, b) => b.mediaFantapunti - a.mediaFantapunti)
}

/**
 * Costruisce la matrice head-to-head dalle partite con gol completate.
 */
export function buildHeadToHead(utenti: UtenteSummary[], partite: PartitaConGol[]) {
  const matrice: Record<number, Record<number, H2HCell>> = {}
  const ensure = (a: number, b: number): H2HCell => {
    if (!matrice[a]) matrice[a] = {}
    const row = matrice[a]!
    if (!row[b]) row[b] = { v: 0, n: 0, p: 0, golFatti: 0, golSubiti: 0, partite: 0 }
    return row[b]!
  }

  partite.forEach((p) => {
    const idH = p.idSquadraH
    const idA = p.idSquadraA
    if (idH == null || idA == null) return
    const golH = Number(p.golH ?? 0)
    const golA = Number(p.golA ?? 0)

    const cellH = ensure(idH, idA)
    const cellA = ensure(idA, idH)
    cellH.partite += 1
    cellA.partite += 1
    cellH.golFatti += golH
    cellH.golSubiti += golA
    cellA.golFatti += golA
    cellA.golSubiti += golH
    if (golH > golA) {
      cellH.v += 1
      cellA.p += 1
    } else if (golH === golA) {
      cellH.n += 1
      cellA.n += 1
    } else {
      cellH.p += 1
      cellA.v += 1
    }
  })

  const squadre = utenti.map((u) => ({
    idSquadra: u.idUtente,
    squadra: u.nomeSquadra,
    foto: u.foto,
  }))

  return { squadre, matrice }
}
