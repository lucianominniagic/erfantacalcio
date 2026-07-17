/**
 * probabiliFormazioniMatcher — matching giocatori fonte → DB.
 *
 * Strategia:
 * 1. Carica tutti i trasferimenti attivi della stagione corrente con la
 *    relazione Giocatore.
 * 2. Raggruppa i candidati per squadra (case-insensitive + alias map).
 * 3. Per ogni giocatore fonte, calcola un punteggio di somiglianza nome
 *    e restituisce l'idGiocatore del candidato migliore (null se nessuno).
 *
 * NOTA: NON usa mai Giocatore.id_pf (appartiene a pianetafantacalcio.it).
 */

import { LessThanOrEqual } from 'typeorm'
import { Trasferimenti } from '~/server/db/entities'

// ─── Alias squadre (fonte → varianti DB) ─────────────────────────────────────

/**
 * Mappa normalizzata (lowercase) di possibili nomi fonte → nome DB normalizzato.
 * Aggiungere qui eventuali alias mancanti quando i nomi divergono.
 */
const TEAM_ALIAS_MAP: Record<string, string[]> = {
  // Chiavi = lowercase del nome così come appare nella fonte
  // Valori = lowercase di varianti del nome DB (SquadraSerieA.nome / Trasferimento.nomeSquadraSerieA)
  inter: ['inter', 'fc internazionale', 'internazionale', 'fc inter'],
  milan: ['milan', 'ac milan'],
  juventus: ['juventus', 'juventus fc'],
  roma: ['roma', 'as roma'],
  lazio: ['lazio', 'ss lazio'],
  napoli: ['napoli', 'ssc napoli'],
  atalanta: ['atalanta', 'atalanta bc'],
  fiorentina: ['fiorentina', 'acf fiorentina'],
  torino: ['torino', 'torino fc'],
  bologna: ['bologna', 'bologna fc'],
  udinese: ['udinese', 'udinese calcio'],
  genoa: ['genoa', 'genoa cfc'],
  sampdoria: ['sampdoria', 'uc sampdoria'],
  cagliari: ['cagliari', 'cagliari calcio'],
  lecce: ['lecce', 'us lecce'],
  empoli: ['empoli', 'empoli fc'],
  venezia: ['venezia', 'venezia fc'],
  monza: ['monza', 'ac monza'],
  frosinone: ['frosinone', 'frosinone calcio'],
  sassuolo: ['sassuolo', 'us sassuolo'],
  parma: ['parma', 'parma calcio'],
  como: ['como', 'como 1907', 'calcio como'],
  verona: ['verona', 'hellas verona'],
  'hellas verona': ['verona', 'hellas verona'],
  cremonese: ['cremonese', 'us cremonese'],
  spezia: ['spezia', 'spezia calcio'],
  brescia: ['brescia', 'brescia calcio'],
  pisa: ['pisa', 'ac pisa'],
}

// ─── Tipi ─────────────────────────────────────────────────────────────────────

export interface CandidatoGiocatore {
  idGiocatore: number
  nome: string // Giocatore.nome (uppercase, es. "MARTINEZ L.")
  ruolo: string // Giocatore.ruolo (P/D/C/A)
}

export interface MatchResult {
  idGiocatore: number | null
  /** Punteggio di somiglianza 0-1 del candidato scelto (0 se nessun match) */
  score: number
}

// ─── Cache candidati per stagione ────────────────────────────────────────────

export interface CandidatesByTeam {
  byTeam: Record<string, CandidatoGiocatore[]>
}

interface ScoredCandidate {
  candidato: CandidatoGiocatore
  score: number
  ruoloBonus: number
}

/**
 * Carica tutti i trasferimenti attivi della stagione e li raggruppa per squadra.
 * "Attivo" = dataAcquisto <= now, (dataCessione IS NULL OR dataCessione > now), hasRitirato = false.
 */
export async function loadCandidatiPerStagione(
  stagione: string,
): Promise<CandidatesByTeam> {
  const now = new Date()

  const trasferimenti = await Trasferimenti.find({
    select: {
      idGiocatore: true,
      nomeSquadraSerieA: true,
      dataAcquisto: true,
      dataCessione: true,
      hasRitirato: true,
      Giocatore: { idGiocatore: true, nome: true, ruolo: true },
      SquadraSerieA: { nome: true },
    },
    relations: { Giocatore: true, SquadraSerieA: true },
    where: {
      stagione,
      hasRitirato: false,
      dataAcquisto: LessThanOrEqual(now),
    },
  })

  const result: CandidatesByTeam = { byTeam: {} }

  for (const t of trasferimenti) {
    // Filtra dataCessione
    if (t.dataCessione !== null && t.dataCessione <= now) continue

    // Normalizza nome squadra
    const squadraNorm = normalizzaSquadra(
      t.SquadraSerieA?.nome ?? t.nomeSquadraSerieA ?? '',
    )
    if (!squadraNorm) continue

    if (!result.byTeam[squadraNorm]) result.byTeam[squadraNorm] = []

    if (
      result.byTeam[squadraNorm].some((c) => c.idGiocatore === t.idGiocatore)
    ) {
      continue
    }

    result.byTeam[squadraNorm].push({
      idGiocatore: t.Giocatore.idGiocatore,
      nome: t.Giocatore.nome,
      ruolo: t.Giocatore.ruolo,
    })
  }

  return result
}

/**
 * Cerca il giocatore DB migliore per un giocatore fonte.
 *
 * @param nomeSource Nome come appare nella fonte (es. "Lautaro Martinez")
 * @param ruoloSource Ruolo normalizzato dalla fonte (P/D/C/A)
 * @param squadraSource Nome squadra dalla fonte
 * @param candidatiPerSquadra Mappa precalcolata da loadCandidatiPerStagione
 */
export function matchGiocatore(
  nomeSource: string,
  ruoloSource: string,
  squadraSource: string,
  candidatiPerSquadra: CandidatesByTeam,
): MatchResult {
  const squadraNorm = normalizzaSquadra(squadraSource)
  const candidati = squadraNorm
    ? (candidatiPerSquadra.byTeam[squadraNorm] ?? [])
    : []

  if (candidati.length === 0) {
    return { idGiocatore: null, score: 0 }
  }

  // Genera token significativi dal nome fonte
  const sourceTokens = tokenizza(nomeSource)
  if (sourceTokens.length === 0) {
    return { idGiocatore: null, score: 0 }
  }

  // Equivalente al LIKE su ogni token richiesto, dopo avere ristretto per squadra.
  const searchTokens = sourceTokens.some((token) => token.length >= 3)
    ? sourceTokens.filter((token) => token.length >= 3)
    : sourceTokens
  const candidatiLike = candidati.filter((c) => {
    const nomeDb = normalizzaNomePerMatch(c.nome)
    return searchTokens.some((token) => nomeDb.includes(token))
  })

  if (candidatiLike.length === 0) {
    return { idGiocatore: null, score: 0 }
  }

  // Calcola punteggio per ogni candidato trovato.
  const scored: ScoredCandidate[] = candidatiLike.map((c) => {
    const s = calcolaSomiglianza(sourceTokens, c.nome)
    const ruoloBonus =
      c.ruolo.toUpperCase() === ruoloSource.toUpperCase() ? 0.01 : 0
    return { candidato: c, score: s, ruoloBonus }
  })

  // Ordina: somiglianza, ruolo come criterio secondario, id crescente.
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.ruoloBonus !== a.ruoloBonus) return b.ruoloBonus - a.ruoloBonus
    return a.candidato.idGiocatore - b.candidato.idGiocatore
  })

  const best = scored[0]
  if (best.score === 0) {
    return { idGiocatore: null, score: 0 }
  }

  return { idGiocatore: best.candidato.idGiocatore, score: best.score }
}

// ─── Normalizzazione ─────────────────────────────────────────────────────────

/**
 * Normalizza nome squadra per matching case-insensitive con alias.
 * Restituisce una chiave canonica (lowercase) o '' se non mappabile.
 */
export function normalizzaSquadra(nome: string): string {
  const lower = nome.toLowerCase().trim()
  if (!lower) return ''

  // Cerca in tutti i valori dell'alias map e ritorna la chiave
  for (const [key, aliases] of Object.entries(TEAM_ALIAS_MAP)) {
    if (aliases.includes(lower)) return key
  }

  // Fallback: usa il nome normalizzato direttamente (per squadre non in alias map)
  return lower
}

/**
 * Normalizza un nome giocatore per il matching:
 * - Uppercase
 * - Rimuove diacritici (à→a, é→e, ö→o, ñ→n, …)
 * - Rimuove apostrofi e trattini (D'Ambrosio → DAMBROSIO, Van Der → VAN DER)
 * - Rimuove punti
 * - Normalizza spazi
 */
export function normalizzaNomePerMatch(nome: string): string {
  return nome
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritici
    .replace(/['''`]/g, '') // apostrofi
    .replace(/[-]/g, ' ') // trattini → spazio
    .replace(/\./g, '') // punti
    .replace(/\s+/g, ' ') // spazi multipli
    .trim()
}

/**
 * Genera token significativi da un nome normalizzato.
 * Include parole >= 2 chars AND iniziali (1 char rimasta dopo normalizzazione).
 */
export function tokenizza(nome: string): string[] {
  const norm = normalizzaNomePerMatch(nome)
  return norm
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2) // mantiene "DE", "VAN", "LE", ma non ""
}

/**
 * Calcola un punteggio di somiglianza tra i token del nome fonte e il nome DB.
 * Score 0-1: frazione di token fonte che trovano corrispondenza nel nome DB.
 * Gestisce: matching esatto, prefisso (iniziali come "L." → "LAUTARO").
 */
export function calcolaSomiglianza(
  sourceTokens: string[],
  dbName: string,
): number {
  const dbNorm = normalizzaNomePerMatch(dbName)
  const dbTokens = dbNorm
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 1)

  if (sourceTokens.length === 0 || dbTokens.length === 0) return 0

  let matched = 0
  for (const st of sourceTokens) {
    for (const dt of dbTokens) {
      if (
        st === dt ||
        (dt.length >= 3 && st.startsWith(dt)) || // st=LAUTARO, dt=LAUTA (non reale ma safe)
        (st.length >= 3 && dt.startsWith(st)) || // dt=GUDMUNDSSON, st=GUDM (truncation)
        (dt.length === 1 && st.startsWith(dt)) || // dt=L, st=LAUTARO → iniziale match
        (st.length === 1 && dt.startsWith(st)) // st=L, dt=LAUTARO → iniziale match
      ) {
        matched++
        break // ogni source token conta al massimo 1
      }
    }
  }

  return matched / sourceTokens.length
}
