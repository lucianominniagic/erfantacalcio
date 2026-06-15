/**
 * Algoritmo di aggiudicazione per le sessioni di mercato "asta al buio".
 *
 * Pure function: nessun side-effect, nessuna dipendenza da DB.
 * L'output è il dettaglio per-proposta dell'esito calcolato; la decisione di
 * scrivere `Trasferimenti` resta fuori scope (manualmente a cura dell'admin).
 *
 * ──── Regole (decisione di prodotto) ──────────────────────────────────────
 * - Una squadra può acquisire al massimo `acquistiEffettivi` giocatori.
 * - Per ogni giocatore vince l'offerta col prezzo più alto.
 * - Tie-breaker su prezzo uguale: vince la proposta con `createdAt` più vecchio.
 * - Se una squadra "vincerebbe" più giocatori del cap, tiene le wins a priorità
 *   più alta (numero più basso) e rilascia le altre, che ricadono in cascata
 *   sul secondo offerente. Iterare fino a stabilità.
 */

export interface PropostaInput {
  idProposta: number
  idSquadra: number
  idGiocatore: number
  prezzoOfferto: number
  priorita: number
  createdAt: Date
}

export interface AggiudicaInput {
  acquistiEffettivi: number
  proposte: PropostaInput[]
}

export type EsitoMotivo =
  | 'aggiudicata'
  | 'superata_prezzo'
  | 'rilasciata_per_cap'

export interface EsitoProposta {
  idProposta: number
  esito: 'VINTA' | 'PERSA'
  motivo: EsitoMotivo
  vincitoreGiocatore?: {
    idSquadra: number
    prezzo: number
    priorita: number
  }
}

/**
 * Calcola l'esito dell'aggiudicazione.
 *
 * Complessità: O(K · N · log N) nel caso peggiore, dove K = numero di iterazioni
 * (limitato superiormente da N, perché ad ogni iterazione utile il set di
 * proposte "invalidate" cresce monotonicamente).
 */
export function aggiudica(input: AggiudicaInput): EsitoProposta[] {
  const { acquistiEffettivi, proposte } = input

  // Set di id proposte rilasciate (per cap) — vengono escluse dai round successivi.
  const rilasciatePerCap = new Set<number>()

  // Stato finale dei vincitori per giocatore (popolato all'ultima iterazione stabile).
  let winnersByGiocatore = new Map<number, PropostaInput>()

  // Loop iterativo: termina quando un round non aggiunge rilasci.
  // Cap superiore di sicurezza: |proposte| + 1 (impossibile superarlo perché
  // `rilasciatePerCap` cresce strettamente).
  const maxIter = proposte.length + 1
  for (let iter = 0; iter < maxIter; iter++) {
    winnersByGiocatore = computeWinnersByGiocatore(proposte, rilasciatePerCap)
    const releasedThisRound = applyCapAndCollectReleases(
      winnersByGiocatore,
      acquistiEffettivi,
    )
    if (releasedThisRound.length === 0) break
    for (const id of releasedThisRound) rilasciatePerCap.add(id)
  }

  // Costruisci esiti finali per OGNI proposta in input.
  return proposte.map((p): EsitoProposta => {
    const vincitoreDelGiocatore = winnersByGiocatore.get(p.idGiocatore)

    if (vincitoreDelGiocatore?.idProposta === p.idProposta) {
      return {
        idProposta: p.idProposta,
        esito: 'VINTA',
        motivo: 'aggiudicata',
        vincitoreGiocatore: {
          idSquadra: vincitoreDelGiocatore.idSquadra,
          prezzo: vincitoreDelGiocatore.prezzoOfferto,
          priorita: vincitoreDelGiocatore.priorita,
        },
      }
    }

    if (rilasciatePerCap.has(p.idProposta)) {
      return {
        idProposta: p.idProposta,
        esito: 'PERSA',
        motivo: 'rilasciata_per_cap',
        vincitoreGiocatore: vincitoreDelGiocatore
          ? {
              idSquadra: vincitoreDelGiocatore.idSquadra,
              prezzo: vincitoreDelGiocatore.prezzoOfferto,
              priorita: vincitoreDelGiocatore.priorita,
            }
          : undefined,
      }
    }

    return {
      idProposta: p.idProposta,
      esito: 'PERSA',
      motivo: 'superata_prezzo',
      vincitoreGiocatore: vincitoreDelGiocatore
        ? {
            idSquadra: vincitoreDelGiocatore.idSquadra,
            prezzo: vincitoreDelGiocatore.prezzoOfferto,
            priorita: vincitoreDelGiocatore.priorita,
          }
        : undefined,
    }
  })
}

/**
 * Per ogni giocatore con almeno un'offerta valida (non rilasciata), determina
 * il miglior candidato: prezzo DESC, poi createdAt ASC come tie-breaker.
 */
function computeWinnersByGiocatore(
  proposte: PropostaInput[],
  rilasciate: Set<number>,
): Map<number, PropostaInput> {
  const winners = new Map<number, PropostaInput>()
  for (const p of proposte) {
    if (rilasciate.has(p.idProposta)) continue
    const current = winners.get(p.idGiocatore)
    if (!current || isBetterBid(p, current)) {
      winners.set(p.idGiocatore, p)
    }
  }
  return winners
}

/**
 * Per ogni squadra che supera `acquistiEffettivi`, ordina le sue wins per
 * priorità ASC (la 1 è la più "voluta") e rilascia quelle oltre il cap.
 * Ritorna gli id rilasciati in questo round.
 */
function applyCapAndCollectReleases(
  winnersByGiocatore: Map<number, PropostaInput>,
  cap: number,
): number[] {
  const released: number[] = []
  const winsPerSquadra = new Map<number, PropostaInput[]>()

  for (const win of winnersByGiocatore.values()) {
    const arr = winsPerSquadra.get(win.idSquadra) ?? []
    arr.push(win)
    winsPerSquadra.set(win.idSquadra, arr)
  }

  for (const [, wins] of winsPerSquadra) {
    if (wins.length <= cap) continue
    wins.sort((a, b) => a.priorita - b.priorita)
    for (let i = cap; i < wins.length; i++) {
      const w = wins[i]
      if (w) released.push(w.idProposta)
    }
  }

  return released
}

/**
 * `a` è un'offerta migliore di `b` se il prezzo è maggiore, oppure a parità di
 * prezzo se è stata inviata prima (createdAt minore).
 */
function isBetterBid(a: PropostaInput, b: PropostaInput): boolean {
  if (a.prezzoOfferto !== b.prezzoOfferto) {
    return a.prezzoOfferto > b.prezzoOfferto
  }
  return a.createdAt.getTime() < b.createdAt.getTime()
}
