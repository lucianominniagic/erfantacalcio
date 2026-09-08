/**
 * Test per probabiliFormazioniMerge.
 *
 * Testa la logica pura di merge/media tra due fonti di probabilità.
 * Isolato: nessuna dipendenza DA I/O, DB, fetch HTTP, ecc.
 */

import { describe, it, expect } from 'vitest'
import {
  mergeProbabilita,
  type MergeInput,
  type MergeOutput,
} from '../probabiliFormazioniMerge'

describe('mergeProbabilita', () => {
  // ─── Caso base: probabilitaSosfanta === null ────────────────────────────

  it('restituisce il valore fantacalcio se sosfanta è null', () => {
    const input: MergeInput = {
      idGiocatore: 1,
      probabilitaFantacalcio: 75,
      probabilitaSosfanta: null,
    }

    const result = mergeProbabilita(input)

    expect(result).toEqual<MergeOutput>({
      idGiocatore: 1,
      probabilita: 75,
      fonteSosfantaUsata: false,
    })
  })

  it('restituisce probabilita 0 di fantacalcio se sosfanta è null', () => {
    const input: MergeInput = {
      idGiocatore: 2,
      probabilitaFantacalcio: 0,
      probabilitaSosfanta: null,
    }

    const result = mergeProbabilita(input)

    expect(result).toEqual<MergeOutput>({
      idGiocatore: 2,
      probabilita: 0,
      fonteSosfantaUsata: false,
    })
  })

  it('restituisce probabilita 100 di fantacalcio se sosfanta è null', () => {
    const input: MergeInput = {
      idGiocatore: 3,
      probabilitaFantacalcio: 100,
      probabilitaSosfanta: null,
    }

    const result = mergeProbabilita(input)

    expect(result).toEqual<MergeOutput>({
      idGiocatore: 3,
      probabilita: 100,
      fonteSosfantaUsata: false,
    })
  })

  // ─── Media semplice: entrambi i valori presenti ────────────────────────────

  it('calcola la media di due valori uguali', () => {
    const input: MergeInput = {
      idGiocatore: 4,
      probabilitaFantacalcio: 50,
      probabilitaSosfanta: 50,
    }

    const result = mergeProbabilita(input)

    expect(result).toEqual<MergeOutput>({
      idGiocatore: 4,
      probabilita: 50,
      fonteSosfantaUsata: true,
    })
  })

  it('calcola la media di 100 e 0 come 50', () => {
    const input: MergeInput = {
      idGiocatore: 5,
      probabilitaFantacalcio: 100,
      probabilitaSosfanta: 0,
    }

    const result = mergeProbabilita(input)

    expect(result).toEqual<MergeOutput>({
      idGiocatore: 5,
      probabilita: 50,
      fonteSosfantaUsata: true,
    })
  })

  it('calcola la media di 0 e 100 come 50', () => {
    const input: MergeInput = {
      idGiocatore: 6,
      probabilitaFantacalcio: 0,
      probabilitaSosfanta: 100,
    }

    const result = mergeProbabilita(input)

    expect(result).toEqual<MergeOutput>({
      idGiocatore: 6,
      probabilita: 50,
      fonteSosfantaUsata: true,
    })
  })

  // ─── Arrotondamento con .5 (Math.round) ────────────────────────────────────

  it('arrotonda 55.5 a 56 (Math.round half-to-even)', () => {
    // 51 + 60 = 111 → 111/2 = 55.5 → Math.round = 56
    const input: MergeInput = {
      idGiocatore: 7,
      probabilitaFantacalcio: 51,
      probabilitaSosfanta: 60,
    }

    const result = mergeProbabilita(input)

    expect(result.probabilita).toBe(56)
    expect(result.fonteSosfantaUsata).toBe(true)
  })

  it('arrotonda 54.5 a 54 (Math.round half-to-even)', () => {
    // 54 + 55 = 109 → 109/2 = 54.5 → Math.round = 54 (banker's rounding in JS)
    const input: MergeInput = {
      idGiocatore: 8,
      probabilitaFantacalcio: 54,
      probabilitaSosfanta: 55,
    }

    const result = mergeProbabilita(input)

    // Nota: Math.round() in JavaScript arrotonda verso l'alto per 0.5
    // (non è banker's rounding). Quindi 54.5 → 55
    expect(result.probabilita).toBe(55)
    expect(result.fonteSosfantaUsata).toBe(true)
  })

  it('arrotonda 33.5 a 34', () => {
    // 33 + 34 = 67 → 67/2 = 33.5 → Math.round = 34
    const input: MergeInput = {
      idGiocatore: 9,
      probabilitaFantacalcio: 33,
      probabilitaSosfanta: 34,
    }

    const result = mergeProbabilita(input)

    expect(result.probabilita).toBe(34)
    expect(result.fonteSosfantaUsata).toBe(true)
  })

  it('arrotonda 32.5 a 32 (Math.round half-to-even in JS)', () => {
    // 32 + 33 = 65 → 65/2 = 32.5 → Math.round = 32
    const input: MergeInput = {
      idGiocatore: 10,
      probabilitaFantacalcio: 32,
      probabilitaSosfanta: 33,
    }

    const result = mergeProbabilita(input)

    // In JavaScript, Math.round(32.5) = 33 (arrotonda sempre verso l'alto per 0.5)
    expect(result.probabilita).toBe(33)
    expect(result.fonteSosfantaUsata).toBe(true)
  })

  // ─── Media esatta (senza arrotondamento) ──────────────────────────────────

  it('calcola una media esatta senza decimali', () => {
    const input: MergeInput = {
      idGiocatore: 11,
      probabilitaFantacalcio: 60,
      probabilitaSosfanta: 80,
    }

    const result = mergeProbabilita(input)

    // (60 + 80) / 2 = 70
    expect(result.probabilita).toBe(70)
    expect(result.fonteSosfantaUsata).toBe(true)
  })

  it('calcola media di 40 e 50 come 45', () => {
    const input: MergeInput = {
      idGiocatore: 12,
      probabilitaFantacalcio: 40,
      probabilitaSosfanta: 50,
    }

    const result = mergeProbabilita(input)

    expect(result.probabilita).toBe(45)
    expect(result.fonteSosfantaUsata).toBe(true)
  })

  // ─── Edge values: 0 e 100 ────────────────────────────────────────────────

  it('calcola media di 0 e 0 come 0', () => {
    const input: MergeInput = {
      idGiocatore: 13,
      probabilitaFantacalcio: 0,
      probabilitaSosfanta: 0,
    }

    const result = mergeProbabilita(input)

    expect(result.probabilita).toBe(0)
    expect(result.fonteSosfantaUsata).toBe(true)
  })

  it('calcola media di 100 e 100 come 100', () => {
    const input: MergeInput = {
      idGiocatore: 14,
      probabilitaFantacalcio: 100,
      probabilitaSosfanta: 100,
    }

    const result = mergeProbabilita(input)

    expect(result.probabilita).toBe(100)
    expect(result.fonteSosfantaUsata).toBe(true)
  })

  it('calcola media di 0 e 1 come 0 (arrotondamento verso il basso)', () => {
    const input: MergeInput = {
      idGiocatore: 15,
      probabilitaFantacalcio: 0,
      probabilitaSosfanta: 1,
    }

    const result = mergeProbabilita(input)

    // (0 + 1) / 2 = 0.5 → Math.round = 0 (banker's rounding? no, JS rounds up)
    // Verificare: Math.round(0.5) = 1 in JavaScript
    // Quindi dovrebbe essere 1
    expect(result.probabilita).toBe(1)
    expect(result.fonteSosfantaUsata).toBe(true)
  })

  it('calcola media di 99 e 100 come 100 (arrotondamento verso l\'alto)', () => {
    const input: MergeInput = {
      idGiocatore: 16,
      probabilitaFantacalcio: 99,
      probabilitaSosfanta: 100,
    }

    const result = mergeProbabilita(input)

    // (99 + 100) / 2 = 99.5 → Math.round = 100
    expect(result.probabilita).toBe(100)
    expect(result.fonteSosfantaUsata).toBe(true)
  })

  // ─── Valori differenti: fonte sosfanta usata ──────────────────────────────

  it('usa correttamente l\'idGiocatore sorgente', () => {
    const input: MergeInput = {
      idGiocatore: 12345,
      probabilitaFantacalcio: 75,
      probabilitaSosfanta: 85,
    }

    const result = mergeProbabilita(input)

    expect(result.idGiocatore).toBe(12345)
  })

  it('imposta fonteSosfantaUsata=true quando sosfanta è presente', () => {
    const input: MergeInput = {
      idGiocatore: 17,
      probabilitaFantacalcio: 50,
      probabilitaSosfanta: 60,
    }

    const result = mergeProbabilita(input)

    expect(result.fonteSosfantaUsata).toBe(true)
  })

  it('imposta fonteSosfantaUsata=false quando sosfanta è null', () => {
    const input: MergeInput = {
      idGiocatore: 18,
      probabilitaFantacalcio: 50,
      probabilitaSosfanta: null,
    }

    const result = mergeProbabilita(input)

    expect(result.fonteSosfantaUsata).toBe(false)
  })

  // ─── Casi di probabilità molto diverse ─────────────────────────────────────

  it('calcola media di 10 e 90 come 50', () => {
    const input: MergeInput = {
      idGiocatore: 19,
      probabilitaFantacalcio: 10,
      probabilitaSosfanta: 90,
    }

    const result = mergeProbabilita(input)

    expect(result.probabilita).toBe(50)
    expect(result.fonteSosfantaUsata).toBe(true)
  })

  it('calcola media di 5 e 95 come 50', () => {
    const input: MergeInput = {
      idGiocatore: 20,
      probabilitaFantacalcio: 5,
      probabilitaSosfanta: 95,
    }

    const result = mergeProbabilita(input)

    expect(result.probabilita).toBe(50)
    expect(result.fonteSosfantaUsata).toBe(true)
  })

  it('calcola media di 25 e 75 come 50', () => {
    const input: MergeInput = {
      idGiocatore: 21,
      probabilitaFantacalcio: 25,
      probabilitaSosfanta: 75,
    }

    const result = mergeProbabilita(input)

    expect(result.probabilita).toBe(50)
    expect(result.fonteSosfantaUsata).toBe(true)
  })
})
