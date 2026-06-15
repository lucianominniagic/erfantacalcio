import { describe, it, expect } from 'vitest'
import { aggiudica } from './aggiudicazione'
import type { PropostaInput, EsitoProposta } from './aggiudicazione'

// ── Helper: costruisci una proposta con default ragionevoli ──────────────────
function p(overrides: Partial<PropostaInput>): PropostaInput {
  return {
    idProposta: 0,
    idSquadra: 0,
    idGiocatore: 0,
    prezzoOfferto: 0,
    priorita: 0,
    createdAt: new Date('2026-06-01T10:00:00Z'),
    ...overrides,
  }
}

function esitoOf(esiti: EsitoProposta[], idProposta: number) {
  const e = esiti.find((x) => x.idProposta === idProposta)
  if (!e) throw new Error(`Esito non trovato per proposta ${idProposta}`)
  return e
}

describe('aggiudica', () => {
  it('caso base: 1 squadra, 1 proposta, 1 giocatore → vince', () => {
    const out = aggiudica({
      acquistiEffettivi: 1,
      proposte: [
        p({ idProposta: 1, idSquadra: 10, idGiocatore: 100, prezzoOfferto: 5, priorita: 1 }),
      ],
    })

    expect(out).toHaveLength(1)
    expect(esitoOf(out, 1).esito).toBe('VINTA')
    expect(esitoOf(out, 1).motivo).toBe('aggiudicata')
    expect(esitoOf(out, 1).vincitoreGiocatore?.idSquadra).toBe(10)
  })

  it('prezzo più alto vince contro stesso giocatore', () => {
    const out = aggiudica({
      acquistiEffettivi: 5,
      proposte: [
        p({ idProposta: 1, idSquadra: 10, idGiocatore: 100, prezzoOfferto: 5, priorita: 1 }),
        p({ idProposta: 2, idSquadra: 20, idGiocatore: 100, prezzoOfferto: 8, priorita: 1 }),
      ],
    })

    expect(esitoOf(out, 2).esito).toBe('VINTA')
    expect(esitoOf(out, 1).esito).toBe('PERSA')
    expect(esitoOf(out, 1).motivo).toBe('superata_prezzo')
    expect(esitoOf(out, 1).vincitoreGiocatore?.idSquadra).toBe(20)
    expect(esitoOf(out, 1).vincitoreGiocatore?.prezzo).toBe(8)
  })

  it('tie-breaker su prezzo uguale: vince la proposta con createdAt più vecchio', () => {
    const out = aggiudica({
      acquistiEffettivi: 5,
      proposte: [
        p({
          idProposta: 1,
          idSquadra: 10,
          idGiocatore: 100,
          prezzoOfferto: 5,
          priorita: 1,
          createdAt: new Date('2026-06-01T12:00:00Z'),
        }),
        p({
          idProposta: 2,
          idSquadra: 20,
          idGiocatore: 100,
          prezzoOfferto: 5,
          priorita: 1,
          createdAt: new Date('2026-06-01T10:00:00Z'), // più vecchia
        }),
      ],
    })

    expect(esitoOf(out, 2).esito).toBe('VINTA')
    expect(esitoOf(out, 1).esito).toBe('PERSA')
    expect(esitoOf(out, 1).motivo).toBe('superata_prezzo')
  })

  it('cap superato: squadra con 4 wins e cap=3 → rilascia la priorità più bassa, cade al secondo offerente', () => {
    // Squadra 10 offre forte su 4 giocatori con priorità 1..4.
    // Cap = 3 → la #4 (priorità 4) viene rilasciata e va a squadra 20.
    const out = aggiudica({
      acquistiEffettivi: 3,
      proposte: [
        // Squadra 10: wins (sempre miglior offerta) su 4 giocatori
        p({ idProposta: 1, idSquadra: 10, idGiocatore: 101, prezzoOfferto: 10, priorita: 1 }),
        p({ idProposta: 2, idSquadra: 10, idGiocatore: 102, prezzoOfferto: 10, priorita: 2 }),
        p({ idProposta: 3, idSquadra: 10, idGiocatore: 103, prezzoOfferto: 10, priorita: 3 }),
        p({ idProposta: 4, idSquadra: 10, idGiocatore: 104, prezzoOfferto: 10, priorita: 4 }),
        // Squadra 20: secondo offerente sul giocatore 104
        p({ idProposta: 5, idSquadra: 20, idGiocatore: 104, prezzoOfferto: 5, priorita: 1 }),
      ],
    })

    expect(esitoOf(out, 1).esito).toBe('VINTA')
    expect(esitoOf(out, 2).esito).toBe('VINTA')
    expect(esitoOf(out, 3).esito).toBe('VINTA')

    // La #4 di squadra 10 è stata rilasciata per cap
    expect(esitoOf(out, 4).esito).toBe('PERSA')
    expect(esitoOf(out, 4).motivo).toBe('rilasciata_per_cap')

    // La #5 di squadra 20 subentra e vince
    expect(esitoOf(out, 5).esito).toBe('VINTA')
    expect(esitoOf(out, 5).motivo).toBe('aggiudicata')
    expect(esitoOf(out, 5).vincitoreGiocatore?.idSquadra).toBe(20)
  })

  it('cascata multipla: rilascio di A genera nuova vittoria a B che però era già al cap → seconda cascata', () => {
    // Setup:
    // - cap = 1
    // - Squadra A vince giocatore X (prio 1) e giocatore Y (prio 2)
    // - Squadra B è secondo su Y, e vince giocatore Z (prio 1)
    // - Squadra C è secondo su Z (e backup secondo su Y)
    //
    // Round 1: A vince X+Y, B vince Z
    // Round 2: A oltre cap → rilascia Y (prio 2). Y va a B.
    //          B ora ha Z+Y, oltre cap → rilascia il meno prioritario.
    //          B aveva: vinta Z (prio 1) e Y (prio 1 di B) → entrambi prio 1.
    //          Per stabilità del test, B mette Z a prio 1 e Y a prio 2.
    //          B rilascia Y (prio 2). Y va a C.
    const out = aggiudica({
      acquistiEffettivi: 1,
      proposte: [
        // Squadra A (10): X prio 1, Y prio 2
        p({ idProposta: 1, idSquadra: 10, idGiocatore: 100, prezzoOfferto: 10, priorita: 1 }), // X
        p({ idProposta: 2, idSquadra: 10, idGiocatore: 200, prezzoOfferto: 10, priorita: 2 }), // Y
        // Squadra B (20): Z prio 1, Y prio 2
        p({ idProposta: 3, idSquadra: 20, idGiocatore: 300, prezzoOfferto: 10, priorita: 1 }), // Z
        p({ idProposta: 4, idSquadra: 20, idGiocatore: 200, prezzoOfferto: 5, priorita: 2 }),  // Y secondo offerente
        // Squadra C (30): Z secondo, Y terzo
        p({ idProposta: 5, idSquadra: 30, idGiocatore: 300, prezzoOfferto: 3, priorita: 1 }),  // Z backup
        p({ idProposta: 6, idSquadra: 30, idGiocatore: 200, prezzoOfferto: 2, priorita: 2 }),  // Y backup
      ],
    })

    // A tiene solo X (prio 1)
    expect(esitoOf(out, 1).esito).toBe('VINTA')
    expect(esitoOf(out, 2).esito).toBe('PERSA')
    expect(esitoOf(out, 2).motivo).toBe('rilasciata_per_cap')

    // B tiene solo Z (prio 1) — Y a prio 2 viene rilasciato per cap
    expect(esitoOf(out, 3).esito).toBe('VINTA')
    expect(esitoOf(out, 4).esito).toBe('PERSA')
    expect(esitoOf(out, 4).motivo).toBe('rilasciata_per_cap')

    // C vince Y (subentra dopo le cascate). Z: rimane di B.
    expect(esitoOf(out, 5).esito).toBe('PERSA')
    expect(esitoOf(out, 5).motivo).toBe('superata_prezzo')
    expect(esitoOf(out, 6).esito).toBe('VINTA')
    expect(esitoOf(out, 6).vincitoreGiocatore?.idSquadra).toBe(30)
  })

  it('squadra senza vincite: tutte le proposte sono superate per prezzo', () => {
    const out = aggiudica({
      acquistiEffettivi: 3,
      proposte: [
        p({ idProposta: 1, idSquadra: 10, idGiocatore: 100, prezzoOfferto: 2, priorita: 1 }),
        p({ idProposta: 2, idSquadra: 20, idGiocatore: 100, prezzoOfferto: 5, priorita: 1 }),
      ],
    })

    expect(esitoOf(out, 1).esito).toBe('PERSA')
    expect(esitoOf(out, 1).motivo).toBe('superata_prezzo')
    expect(esitoOf(out, 2).esito).toBe('VINTA')
  })

  it('squadra esattamente al cap: nessun rilascio', () => {
    const out = aggiudica({
      acquistiEffettivi: 3,
      proposte: [
        p({ idProposta: 1, idSquadra: 10, idGiocatore: 101, prezzoOfferto: 5, priorita: 1 }),
        p({ idProposta: 2, idSquadra: 10, idGiocatore: 102, prezzoOfferto: 5, priorita: 2 }),
        p({ idProposta: 3, idSquadra: 10, idGiocatore: 103, prezzoOfferto: 5, priorita: 3 }),
      ],
    })

    expect(esitoOf(out, 1).esito).toBe('VINTA')
    expect(esitoOf(out, 2).esito).toBe('VINTA')
    expect(esitoOf(out, 3).esito).toBe('VINTA')
  })

  it('una squadra che ha già il cap e la sua proposta a priorità bassa è non vincente: motivo cap_squadra_raggiunto se il giocatore non ha altri vincitori (NB: impossibile in pratica, ma comportamento deterministico)', () => {
    // Squadra A vince giocatore X con prio 1 (cap = 1).
    // Squadra A propone anche giocatore Y a prio 2, e nessun altro propone Y.
    // Round 1: A vince X (prio 1) e Y (prio 2). Cap=1 → rilascia Y per cap.
    // Round 2: Y non ha altri candidati → nessuno vince Y. La proposta su Y è PERSA per cap.
    const out = aggiudica({
      acquistiEffettivi: 1,
      proposte: [
        p({ idProposta: 1, idSquadra: 10, idGiocatore: 100, prezzoOfferto: 5, priorita: 1 }),
        p({ idProposta: 2, idSquadra: 10, idGiocatore: 200, prezzoOfferto: 5, priorita: 2 }),
      ],
    })

    expect(esitoOf(out, 1).esito).toBe('VINTA')
    expect(esitoOf(out, 2).esito).toBe('PERSA')
    expect(esitoOf(out, 2).motivo).toBe('rilasciata_per_cap')
  })

  it('proposte indipendenti tra giocatori diversi e squadre diverse: tutti vincono', () => {
    const out = aggiudica({
      acquistiEffettivi: 5,
      proposte: [
        p({ idProposta: 1, idSquadra: 10, idGiocatore: 100, prezzoOfferto: 5, priorita: 1 }),
        p({ idProposta: 2, idSquadra: 20, idGiocatore: 200, prezzoOfferto: 5, priorita: 1 }),
        p({ idProposta: 3, idSquadra: 30, idGiocatore: 300, prezzoOfferto: 5, priorita: 1 }),
      ],
    })

    out.forEach((e) => expect(e.esito).toBe('VINTA'))
  })
})
